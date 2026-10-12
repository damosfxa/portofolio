"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Edit2, MessageSquareText, Plus, Save, Search, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadSetting, saveSetting } from "@/lib/admin-data";
import type { ReplyTemplate } from "@/lib/types";

// Template dan aturan tersimpan di database (khusus admin), jadi tidak terlihat di repo publik.

async function loadTemplates() {
  const { data, error } = await supabase.from("reply_templates").select("*").order("sort", { ascending: true }).order("id", { ascending: true });
  if (error) alert("Gagal memuat template: " + error.message + (/reply_templates/.test(error.message) ? "\n\nTabel template belum dibuat. Jalankan SQL pembuatan tabel dan file docs/pribadi/isi-data-admin.sql di Supabase dulu." : ""));
  return (data ?? []) as ReplyTemplate[];
}

/** Tandai bagian [dalam kurung] yang harus diganti sebelum dikirim. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        part.startsWith("[") ? <mark key={i} className="bg-amber-400/25 text-inherit rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

type Form = { grp: string; title: string; body: string; note: string };
const EMPTY: Form = { grp: "", title: "", body: "", note: "" };
const field = "bg-background border border-border rounded-xl px-3 py-2 text-sm w-full";

export default function AdminTemplateChat() {
  const [items, setItems] = useState<ReplyTemplate[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [rulesDraft, setRulesDraft] = useState<string | null>(null);

  const refresh = async () => setItems(await loadTemplates());

  useEffect(() => {
    let active = true;
    Promise.all([loadTemplates(), loadSetting<string[]>("reply_rules")]).then(([rows, r]) => {
      if (!active) return;
      setItems(rows);
      setRules(r ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const groups = [...new Set(items.map((r) => r.grp))];
  const q = query.trim().toLowerCase();
  const shown = items.filter((r) => (!group || r.grp === group) && (!q || r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)));

  const copy = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      alert("Gagal menyalin. Blok teksnya lalu salin manual.");
    }
  };

  const startEdit = (r: ReplyTemplate) => {
    setEditing(r.id);
    setForm({ grp: r.grp, title: r.title, body: r.body, note: r.note ?? "" });
  };
  const startNew = () => {
    setEditing("new");
    setForm({ ...EMPTY, grp: group ?? groups[0] ?? "Lainnya" });
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.grp.trim()) return alert("Kelompok, judul, dan isi wajib diisi.");
    const payload = { grp: form.grp.trim(), title: form.title.trim(), body: form.body.trim(), note: form.note.trim() || null };
    const { error } = editing === "new"
      ? await supabase.from("reply_templates").insert([{ ...payload, sort: items.length + 1 }])
      : await supabase.from("reply_templates").update(payload).eq("id", editing);
    if (error) return alert("Gagal menyimpan: " + error.message);
    setEditing(null);
    refresh();
  };

  const remove = async (r: ReplyTemplate) => {
    if (!confirm(`Hapus template "${r.title}"?`)) return;
    await supabase.from("reply_templates").delete().eq("id", r.id);
    refresh();
  };

  const saveRules = async () => {
    if (rulesDraft === null) return;
    const next = rulesDraft.split("\n").map((l) => l.trim()).filter(Boolean);
    if (await saveSetting("reply_rules", next)) {
      setRules(next);
      setRulesDraft(null);
    }
  };

  const editor = (
    <div className="bg-surface border-2 border-primary rounded-2xl p-5 flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-[200px_1fr]">
        <input className={field} list="reply-groups" value={form.grp} onChange={(e) => setForm({ ...form, grp: e.target.value })} placeholder="Kelompok" />
        <datalist id="reply-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
        <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul, contoh: Klien minta diskon" />
      </div>
      <textarea rows={8} className={field} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Isi pesan. Tulis bagian yang harus diganti di dalam [kurung siku]." />
      <input className={field} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Tips untuk diri sendiri (opsional)" />
      <div className="flex justify-end gap-2">
        <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
        <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white"><Save className="w-4 h-4" /> Simpan</button>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center p-24"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3"><MessageSquareText className="w-7 h-7" /> Template Chat</h1>
          <p className="text-text-muted">Balasan siap salin untuk klien. Bagian yang <mark className="bg-amber-400/25 rounded px-1">[ditandai]</mark> harus diganti sebelum dikirim.</p>
        </div>
        {editing === null && <button onClick={startNew} className="flex items-center gap-2 bg-foreground text-background font-bold px-4 py-2 rounded-xl text-sm"><Plus className="w-4 h-4" /> Tambah Template</button>}
      </div>

      <section className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-foreground">Pegangan utama</p>
          {rulesDraft === null ? (
            <button onClick={() => setRulesDraft(rules.join("\n"))} className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover" aria-label="Edit pegangan"><Edit2 className="w-4 h-4" /></button>
          ) : (
            <div className="flex gap-1">
              <button onClick={saveRules} className="p-1.5 rounded-lg text-emerald-600 hover:bg-surface-hover" aria-label="Simpan pegangan"><Save className="w-4 h-4" /></button>
              <button onClick={() => setRulesDraft(null)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover" aria-label="Batal"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
        {rulesDraft === null ? (
          <ul className="list-disc pl-5 text-sm text-text-muted space-y-0.5">
            {rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
        ) : (
          <textarea rows={6} className={field} value={rulesDraft} onChange={(e) => setRulesDraft(e.target.value)} placeholder="Satu pegangan per baris" />
        )}
      </section>

      {editing === "new" && <div className="mb-6">{editor}</div>}

      <div className="flex flex-wrap gap-2 mb-6">
        <label className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 flex-1 min-w-56">
          <Search className="w-4 h-4 text-text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari, misalnya: mahal, revisi, DP" className="bg-transparent outline-none text-sm flex-1" />
        </label>
        {[null, ...groups].map((g) => (
          <button
            key={g ?? "semua"}
            onClick={() => setGroup(g)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold border ${group === g ? "bg-foreground text-background border-foreground" : "border-border hover:bg-surface-hover"}`}
          >
            {g ?? "Semua"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {shown.map((r) =>
          editing === r.id ? (
            <div key={r.id}>{editor}</div>
          ) : (
            <article key={r.id} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{r.grp}</p>
                  <h2 className="font-bold text-foreground">{r.title}</h2>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => copy(r.id, r.body)} className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-1.5 text-sm font-semibold hover:bg-surface-hover">
                    {copied === r.id ? <><Check className="w-4 h-4 text-emerald-600" /> Tersalin</> : <><Copy className="w-4 h-4" /> Salin</>}
                  </button>
                  <button onClick={() => startEdit(r)} className="p-2 rounded-lg text-text-muted hover:bg-surface-hover" aria-label="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => remove(r)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed bg-background border border-border rounded-xl p-4"><Highlighted text={r.body} /></p>
              {r.note && <p className="text-xs text-text-muted mt-2">💡 {r.note}</p>}
            </article>
          ),
        )}
        {shown.length === 0 && <p className="text-center text-text-muted py-8">{items.length ? "Tidak ada template yang cocok." : "Belum ada template."}</p>}
      </div>
    </div>
  );
}
