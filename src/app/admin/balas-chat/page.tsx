"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Loader2, MessageCircle, MessagesSquare, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/lib/types";

// Agent Balas Chat: tempel chat dari calon klien, Claude menyiapkan 2 pilihan balasan.
// Balasan tidak pernah dikirim otomatis; kamu yang menyalin dan menekan kirim di WhatsApp.

type Suggestion = {
  situation: string;
  options: { label: string; message: string }[];
  next_step: string;
  warnings: string[];
  status: Extract<LeadStatus, "dibalas" | "deal" | "tidak_tertarik">;
};

const STATUS_LABEL: Record<Suggestion["status"], string> = { dibalas: "Dibalas", deal: "Deal", tidak_tertarik: "Tidak tertarik" };
const field = "bg-background border border-border rounded-xl px-3 py-2 text-sm";

async function loadActiveLeads() {
  const { data } = await supabase
    .from("leads")
    .select("*")
    .in("status", ["baru", "dikirim", "dibalas", "deal"])
    .order("updated_at", { ascending: false });
  return (data ?? []) as Lead[];
}

/** Nomor Indonesia ke format wa.me (62...). */
function waNumber(phone: string | null) {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return d.length >= 9 ? d : null;
}

export default function BalasChat() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState<number | "">("");
  const [chat, setChat] = useState("");
  const [note, setNote] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Suggestion | null>(null);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [statusSaved, setStatusSaved] = useState(false);

  useEffect(() => {
    let active = true;
    loadActiveLeads().then((rows) => active && setLeads(rows));
    return () => {
      active = false;
    };
  }, []);

  const lead = leads.find((l) => l.id === leadId) ?? null;
  const wa = waNumber(lead?.phone ?? null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    setStatusSaved(false);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sesi login habis. Logout lalu login lagi.");
      const res = await fetch("/api/agents/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chat, note, leadId: leadId || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Gagal (${res.status})`);
      const s = json.suggestion as Suggestion;
      setResult(s);
      setDrafts(s.options.map((o) => o.message));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const copy = async (i: number) => {
    await navigator.clipboard.writeText(drafts[i]);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const saveStatus = async () => {
    if (!lead || !result) return;
    const { error: err } = await supabase.from("leads").update({ status: result.status, updated_at: new Date().toISOString() }).eq("id", lead.id);
    if (err) return alert("Gagal menyimpan status: " + err.message);
    setLeads((rows) => rows.map((l) => (l.id === lead.id ? { ...l, status: result.status } : l)));
    setStatusSaved(true);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3"><MessagesSquare className="w-7 h-7" /> Balas Chat</h1>
        <p className="text-text-muted">Tempel chat dari calon klien, agent menyiapkan 2 pilihan balasan yang santai, tidak kaku, dan mengikuti aturan negosiasimu. Kamu tinggal pilih, ubah bila perlu, lalu kirim sendiri.</p>
      </div>

      <section className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Dari calon klien (opsional)
          <select className={field} value={leadId} onChange={(e) => setLeadId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Bukan dari Agent Klien / pilih nanti</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <span className="text-xs font-normal text-text-muted">Bila dipilih, agent ikut membaca pesan pembuka yang dulu kamu kirim.</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">Chat dari klien *
          <textarea rows={7} className={field} value={chat} onChange={(e) => setChat(e.target.value)} placeholder={"Tempel beberapa pesan terakhir dari WhatsApp. Contoh:\nKlien: Halo kak, boleh tau harganya berapa ya?"} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">Catatan tambahan (opsional)
          <input className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: hasil Kalkulator 3,5 sampai 5 juta; bisa ketemu Sabtu siang" />
          <span className="text-xs font-normal text-text-muted">Agent hanya menyebut harga bila kamu menuliskannya di sini.</span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={running || !chat.trim()} className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {running ? "Menyiapkan balasan..." : "Buat balasan"}
          </button>
          <span className="text-xs text-text-muted">Sekitar $0,03 per balasan, dihitung ke budget agent.</span>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </section>

      {result && (
        <section className="mt-6 flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Situasinya</p>
            <p>{result.situation}</p>
            {result.warnings.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1">
                {result.warnings.map((w) => <li key={w} className="flex gap-2 text-amber-600"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {w}</li>)}
              </ul>
            )}
          </div>

          {result.options.map((o, i) => (
            <article key={i} className="bg-surface border border-border rounded-2xl p-5">
              <p className="font-bold text-foreground mb-2">Pilihan {i + 1}: {o.label}</p>
              <textarea rows={6} className={`${field} w-full`} value={drafts[i] ?? ""} onChange={(e) => setDrafts((d) => d.map((x, k) => (k === i ? e.target.value : x)))} />
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => copy(i)} className="flex items-center gap-1.5 border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover"><Copy className="w-4 h-4" /> {copied === i ? "Tersalin" : "Salin"}</button>
                {wa && (
                  <a href={`https://wa.me/${wa}?text=${encodeURIComponent(drafts[i] ?? "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
                    <MessageCircle className="w-4 h-4" /> Buka WhatsApp
                  </a>
                )}
              </div>
            </article>
          ))}

          <div className="bg-surface border border-border rounded-2xl p-5 text-sm flex flex-col gap-2">
            <p><span className="font-semibold">Langkah berikutnya:</span> {result.next_step}</p>
            {lead && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-muted">Status {lead.name} sebaiknya jadi <b>{STATUS_LABEL[result.status]}</b>.</span>
                {statusSaved ? (
                  <span className="text-emerald-600 font-semibold">Tersimpan</span>
                ) : (
                  <button onClick={saveStatus} className="border border-border font-semibold px-3 py-1.5 rounded-xl hover:bg-surface-hover">Simpan status</button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
