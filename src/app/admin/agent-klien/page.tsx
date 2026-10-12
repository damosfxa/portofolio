"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Copy, ExternalLink, Loader2, MapPin, MessageCircle, Search, Star, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadSetting, saveSetting } from "@/lib/admin-data";
import type { Lead, LeadStatus } from "@/lib/types";

// Agent Cari Klien: cari usaha lewat Google Places, analisis dengan Claude, siapkan pesan WhatsApp.
// Pesan tidak pernah dikirim otomatis; kamu yang menekan kirim di WhatsApp.

type Candidate = { place_id: string; name: string } & Record<string, unknown>;
type Budget = { spent: number; limit: number; remaining: number };
type Step = { name: string; state: "menunggu" | "proses" | "selesai" | "gagal"; note?: string };

const STATUS: Record<LeadStatus, { label: string; cls: string }> = {
  baru: { label: "Baru", cls: "bg-blue-500/15 text-blue-600" },
  dikirim: { label: "Dikirim", cls: "bg-amber-500/15 text-amber-600" },
  dibalas: { label: "Dibalas", cls: "bg-purple-500/15 text-purple-600" },
  deal: { label: "Deal", cls: "bg-emerald-500/15 text-emerald-600" },
  tidak_tertarik: { label: "Tidak tertarik", cls: "bg-gray-500/15 text-gray-500" },
  lewati: { label: "Dilewati", cls: "bg-gray-500/15 text-gray-500" },
};

const field = "bg-background border border-border rounded-xl px-3 py-2 text-sm";
const today = () => new Date().toISOString().slice(0, 10);

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sesi login habis. Logout lalu login lagi.");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, { method: body ? "POST" : "GET", headers: await authHeaders(), body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Gagal (${res.status})`);
  return json as T;
}

async function loadLeads() {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) alert("Gagal memuat calon klien: " + error.message + (/leads/.test(error.message) ? "\n\nTabel leads belum dibuat. Jalankan SQL pembuatan tabel agent di Supabase dulu." : ""));
  return (data ?? []) as Lead[];
}

/** Nomor Indonesia ke format wa.me (62...). */
function waNumber(phone: string | null) {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return d.length >= 9 ? d : null;
}

export default function AgentKlien() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [limitDraft, setLimitDraft] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(5);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [filter, setFilter] = useState<LeadStatus | "semua" | "followup">("semua");

  const refreshBudget = async () => {
    try {
      setBudget(await call<Budget>("/api/agents/budget"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([loadLeads(), call<Budget>("/api/agents/budget").catch(() => null)]).then(([rows, b]) => {
      if (!active) return;
      setLeads(rows);
      setBudget(b);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const run = async () => {
    if (!query.trim()) return;
    setRunning(true);
    setSteps([{ name: `Mencari "${query}" di web (biasanya 1 sampai 2 menit)`, state: "proses" }]);
    try {
      const { candidates, found, known } = await call<{ candidates: Candidate[]; found: number; known: number }>("/api/agents/leads/search", { query, limit: count });
      refreshBudget();
      const head: Step = { name: `Mencari "${query}" di web`, state: "selesai", note: `${found} ditemukan${known ? ` (${known} sudah ada di daftar)` : ""}, ${candidates.length} dianalisis` };
      const list: Step[] = [head, ...candidates.map((c) => ({ name: c.name, state: "menunggu" as const }))];
      setSteps(list);

      // Satu per satu, supaya setiap langkah singkat dan progresnya terlihat.
      for (let i = 0; i < candidates.length; i++) {
        setSteps((s) => s.map((x, k) => (k === i + 1 ? { ...x, state: "proses", note: "membaca website dan menganalisis" } : x)));
        try {
          const { lead } = await call<{ lead: Lead }>("/api/agents/leads/analyze", { candidate: candidates[i], query });
          setLeads((prev) => [lead, ...prev.filter((l) => l.id !== lead.id)]);
          setSteps((s) => s.map((x, k) => (k === i + 1 ? { ...x, state: "selesai", note: `skor ${lead.fit_score}/10` } : x)));
          refreshBudget();
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          setSteps((s) => s.map((x, k) => (k === i + 1 ? { ...x, state: "gagal", note: msg } : x)));
          if (/Budget agent|ANTHROPIC|API key/.test(msg)) break;
        }
      }
    } catch (e) {
      setSteps((s) => s.map((x, k) => (k === 0 ? { ...x, state: "gagal", note: e instanceof Error ? e.message : String(e) } : x)));
    }
    setRunning(false);
    refreshBudget();
  };

  const update = async (lead: Lead, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)));
    const { error } = await supabase.from("leads").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", lead.id);
    if (error) alert("Gagal menyimpan: " + error.message);
  };

  const remove = async (lead: Lead) => {
    if (!confirm(`Hapus ${lead.name}? Usaha ini bisa muncul lagi di pencarian berikutnya.`)) return;
    await supabase.from("leads").delete().eq("id", lead.id);
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
  };

  const markSent = (lead: Lead) => {
    const next = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
    update(lead, { status: "dikirim", next_follow_up: next });
  };

  const saveLimit = async () => {
    const n = Number(limitDraft);
    if (!(n > 0)) return;
    if (await saveSetting("agent_budget", { monthlyUsd: n })) {
      setLimitDraft(null);
      refreshBudget();
    }
  };

  const dueCount = leads.filter((l) => l.status === "dikirim" && l.next_follow_up && l.next_follow_up <= today()).length;
  const shown = useMemo(
    () =>
      leads
        .filter((l) => (filter === "semua" ? l.status !== "lewati" : filter === "followup" ? l.status === "dikirim" && !!l.next_follow_up && l.next_follow_up <= today() : l.status === filter))
        .sort((a, b) => (a.status === "baru" && b.status === "baru" ? (b.fit_score ?? 0) - (a.fit_score ?? 0) : 0)),
    [leads, filter],
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3"><Bot className="w-7 h-7" /> Agent Cari Klien</h1>
        <p className="text-text-muted">Agent mencari usaha lewat pencarian web, membaca websitenya, menilai kecocokan, lalu menulis pesan WhatsApp yang personal. Kamu tinggal cek dan kirim sendiri.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px] mb-6">
        <section className="bg-surface border border-border rounded-2xl p-5">
          <p className="font-bold mb-3">Cari calon klien</p>
          <div className="flex flex-wrap gap-2">
            <input className={`${field} flex-1 min-w-56`} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !running && run()} placeholder="Contoh: rental motor Sleman, klinik kecantikan Jogja" disabled={running} />
            <select className={field} value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={running}>
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} usaha</option>)}
            </select>
            <button onClick={run} disabled={running || !query.trim()} className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} {running ? "Bekerja..." : "Jalankan agent"}
            </button>
          </div>
          {steps.length > 0 && (
            <ol className="mt-4 flex flex-col gap-1.5 text-sm">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 shrink-0 text-center">{s.state === "selesai" ? "✅" : s.state === "gagal" ? "❌" : s.state === "proses" ? "⏳" : "·"}</span>
                  <span className="flex-1">{s.name}{s.note && <span className="text-text-muted"> · {s.note}</span>}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="bg-surface border border-border rounded-2xl p-5 text-sm">
          <p className="font-bold mb-2">Budget Claude bulan ini</p>
          {budget ? (
            <>
              <p className="text-2xl font-bold">${budget.spent.toFixed(2)} <span className="text-sm font-normal text-text-muted">/ ${budget.limit.toFixed(2)}</span></p>
              <div className="h-2 rounded-full bg-background border border-border mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (budget.spent / budget.limit) * 100)}%` }} />
              </div>
              {limitDraft === null ? (
                <button onClick={() => setLimitDraft(String(budget.limit))} className="mt-3 text-xs font-semibold text-primary hover:underline">Ubah batas</button>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input type="number" min={1} className={`${field} w-24`} value={limitDraft} onChange={(e) => setLimitDraft(e.target.value)} />
                  <button onClick={saveLimit} className="text-xs font-bold text-primary">Simpan</button>
                </div>
              )}
              <p className="text-xs text-text-muted mt-2">Agent berhenti otomatis bila batas tercapai.</p>
            </>
          ) : (
            <p className="text-text-muted text-xs">Belum bisa dimuat. Pastikan tabel agent dan environment server sudah diisi.</p>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {([["semua", "Semua"], ["followup", `Perlu follow up${dueCount ? ` (${dueCount})` : ""}`], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])] as [string, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k as typeof filter)} className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${filter === k ? "bg-foreground text-background border-foreground" : "border-border hover:bg-surface-hover"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : shown.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-muted">Belum ada calon klien di sini. Jalankan agent di atas.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((l) => <LeadCard key={l.id} lead={l} onUpdate={(p) => update(l, p)} onSent={() => markSent(l)} onRemove={() => remove(l)} />)}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, onUpdate, onSent, onRemove }: { lead: Lead; onUpdate: (p: Partial<Lead>) => void; onSent: () => void; onRemove: () => void }) {
  const [message, setMessage] = useState(lead.message ?? "");
  const [copied, setCopied] = useState(false);
  const wa = waNumber(lead.phone);
  const score = lead.fit_score ?? 0;
  const scoreCls = score >= 7 ? "bg-emerald-500 text-white" : score >= 4 ? "bg-amber-500 text-white" : "bg-gray-400 text-white";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Gagal menyalin.");
    }
  };

  return (
    <article className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${scoreCls}`}>
          <span className="text-lg leading-none">{score}</span><span className="text-[9px] opacity-80">/10</span>
        </div>
        <div className="flex-1 min-w-56">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-foreground">{lead.name}</h2>
            <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${STATUS[lead.status].cls}`}>{STATUS[lead.status].label}</span>
          </div>
          <p className="text-xs text-text-muted flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {lead.category && <span>{lead.category}</span>}
            {lead.rating !== null && <span className="flex items-center gap-0.5"><Star className="w-3 h-3" /> {lead.rating} ({lead.reviews ?? 0} ulasan)</span>}
            {lead.address && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {lead.address}</span>}
          </p>
          <p className="text-xs mt-1 flex flex-wrap gap-3">
            {lead.website ? <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Website <ExternalLink className="w-3 h-3" /></a> : <span className="text-text-muted">Tanpa website</span>}
            {lead.instagram && <a href={lead.instagram.startsWith("http") ? lead.instagram : `https://instagram.com/${lead.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Instagram <ExternalLink className="w-3 h-3" /></a>}
            {lead.maps_url && <a href={lead.maps_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Google Maps <ExternalLink className="w-3 h-3" /></a>}
            {lead.phone ? <span className="text-text-muted">{lead.phone}</span> : <span className="text-text-muted">Tanpa nomor</span>}
          </p>
        </div>
        <button onClick={onRemove} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Analisis agent</p>
          <p>{lead.fit_reason}</p>
          {!!lead.observations?.length && (
            <ul className="list-disc pl-5 text-text-muted mt-1 space-y-0.5">{lead.observations.map((o) => <li key={o}>{o}</li>)}</ul>
          )}
          <p className="mt-2"><span className="font-semibold">Masalah:</span> {lead.problem}</p>
          <p className="mt-1"><span className="font-semibold">Tawarkan:</span> {lead.offer}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Pesan WhatsApp (bisa diedit)</p>
          <textarea rows={7} className={`${field} w-full`} value={message} onChange={(e) => setMessage(e.target.value)} onBlur={() => message !== lead.message && onUpdate({ message })} />
          <div className="flex flex-wrap gap-2 mt-2">
            {wa ? (
              <a href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
                <MessageCircle className="w-4 h-4" /> Buka WhatsApp
              </a>
            ) : (
              <span className="text-xs text-text-muted self-center">Nomor tidak ditemukan; kirim lewat DM Instagram atau cek Google Maps.</span>
            )}
            <button onClick={copy} className="flex items-center gap-1.5 border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover"><Copy className="w-4 h-4" /> {copied ? "Tersalin" : "Salin"}</button>
            {lead.status === "baru" && <button onClick={onSent} className="border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover">Tandai sudah dikirim</button>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border text-sm">
        <label className="flex items-center gap-2">Status
          <select className={field} value={lead.status} onChange={(e) => onUpdate({ status: e.target.value as LeadStatus })}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">Follow up
          <input type="date" className={field} value={lead.next_follow_up ?? ""} onChange={(e) => onUpdate({ next_follow_up: e.target.value || null })} />
        </label>
        <input className={`${field} flex-1 min-w-48`} defaultValue={lead.notes ?? ""} onBlur={(e) => e.target.value !== (lead.notes ?? "") && onUpdate({ notes: e.target.value || null })} placeholder="Catatan (misalnya: sudah dibalas, minta harga)" />
      </div>
    </article>
  );
}
