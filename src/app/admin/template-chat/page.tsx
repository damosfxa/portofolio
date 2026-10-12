"use client";

import { useState } from "react";
import { Check, Copy, MessageSquareText, Search } from "lucide-react";
import { REPLIES, REPLY_GROUPS, REPLY_RULES } from "@/content/replies";

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

export default function AdminTemplateChat() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = REPLIES.filter((r) => (!group || r.group === group) && (!q || r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)));

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      alert("Gagal menyalin. Blok teksnya lalu salin manual.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3"><MessageSquareText className="w-7 h-7" /> Template Chat</h1>
        <p className="text-text-muted">Balasan siap salin untuk klien. Bagian yang <mark className="bg-amber-400/25 rounded px-1">[ditandai]</mark> harus diganti sebelum dikirim. Teks bisa diubah di file <code>src/content/replies.ts</code>.</p>
      </div>

      <section className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <p className="font-bold text-foreground mb-2">Pegangan utama</p>
        <ul className="list-disc pl-5 text-sm text-text-muted space-y-0.5">
          {REPLY_RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 mb-6">
        <label className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 flex-1 min-w-56">
          <Search className="w-4 h-4 text-text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari, misalnya: mahal, revisi, DP" className="bg-transparent outline-none text-sm flex-1" />
        </label>
        {[null, ...REPLY_GROUPS].map((g) => (
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
        {shown.map((r) => (
          <article key={r.id} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{r.group}</p>
                <h2 className="font-bold text-foreground">{r.title}</h2>
              </div>
              <button onClick={() => copy(r.id, r.text)} className="flex items-center gap-1.5 shrink-0 border border-border rounded-xl px-3 py-1.5 text-sm font-semibold hover:bg-surface-hover">
                {copied === r.id ? <><Check className="w-4 h-4 text-emerald-600" /> Tersalin</> : <><Copy className="w-4 h-4" /> Salin</>}
              </button>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed bg-background border border-border rounded-xl p-4"><Highlighted text={r.text} /></p>
            {r.note && <p className="text-xs text-text-muted mt-2">💡 {r.note}</p>}
          </article>
        ))}
        {shown.length === 0 && <p className="text-center text-text-muted py-8">Tidak ada template yang cocok.</p>}
      </div>
    </div>
  );
}
