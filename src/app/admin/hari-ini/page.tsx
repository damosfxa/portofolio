"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, CalendarClock, Check, Clapperboard, Copy, MessageCircle, MessagesSquare, Plus, Save, Sun, Trash2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadSetting, saveSetting } from "@/lib/admin-data";
import { localDate } from "@/lib/local-date";
import { waLink } from "@/lib/wa";
import type { Lead } from "@/lib/types";

// Tugas Hari Ini: semua yang perlu dikerjakan hari ini dalam satu halaman, berurutan.

type Post = { date: string; time: string; title: string; pin?: string };
type Data = { leads: Lead[]; posts: Post[]; now: Date };

const TARGET_SENT = 50;
const FOLLOWED = "[followup";
// Kata kunci bergiliran per hari: usaha ramai yang biasanya masih serba manual lewat WhatsApp.
const QUERIES = [
  "rental motor Sleman",
  "catering harian Yogyakarta",
  "bengkel motor Sleman",
  "les privat Yogyakarta",
  "laundry kiloan Bantul",
  "toko kue rumahan Yogyakarta",
  "jasa cuci sepatu Jogja",
  "rental mobil Yogyakarta",
];

const field = "bg-background border border-border rounded-xl px-3 py-2 text-sm";
const card = "bg-surface border border-border rounded-2xl p-5";

async function loadData(): Promise<Data> {
  const [{ data }, posts] = await Promise.all([
    supabase.from("leads").select("*").neq("status", "lewati").order("updated_at", { ascending: false }),
    loadSetting<Post[]>("tiktok_schedule"),
  ]);
  return { leads: (data ?? []) as Lead[], posts: posts ?? [], now: new Date() };
}

const followUpText = (l: Lead) =>
  `Halo Kak, maaf menyapa lagi 🙏 Beberapa hari lalu saya kirim pesan soal ide kecil untuk ${l.name}. Kalau belum relevan sekarang, tidak apa-apa Kak, cukup dibalas "nanti" saja. Terima kasih!`;

const fmt = (date: string) => new Date(date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

/** Jam sopan untuk menghubungi pemilik usaha. */
function sendWindow(now: Date) {
  const h = now.getHours() + now.getMinutes() / 60;
  if ((h >= 9 && h < 11) || (h >= 13 && h < 15)) return { ok: true, text: "Sekarang jam yang pas untuk kirim WA." };
  return { ok: false, text: "Kirim WA nanti di jam 09.00 sampai 11.00 atau 13.00 sampai 15.00." };
}

function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="flex items-center gap-1.5 border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover"
    >
      <Copy className="w-4 h-4" /> {done ? "Tersalin" : label}
    </button>
  );
}

export default function HariIni() {
  const [data, setData] = useState<Data | null>(null);
  const [editing, setEditing] = useState<Post[] | null>(null);

  useEffect(() => {
    let active = true;
    loadData().then((d) => active && setData(d));
    return () => {
      active = false;
    };
  }, []);

  if (!data) return <div className="p-8 text-text-muted">Memuat tugas hari ini...</div>;

  const today = localDate(0, data.now);
  const dayIndex = Math.floor(data.now.getTime() / 86400000);
  const query = QUERIES[dayIndex % QUERIES.length];
  const win = sendWindow(data.now);

  const sent = data.leads.filter((l) => ["dikirim", "dibalas", "deal", "tidak_tertarik"].includes(l.status)).length;
  const toSend = data.leads.filter((l) => l.status === "baru");
  const due = data.leads.filter((l) => l.status === "dikirim" && l.next_follow_up && l.next_follow_up <= today);
  const replied = data.leads.filter((l) => l.status === "dibalas");
  const todayPosts = data.posts.filter((p) => p.date === today);
  const nextPosts = data.posts.filter((p) => p.date > today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3);

  const patchLead = async (lead: Lead, patch: Partial<Lead>) => {
    setData((d) => d && { ...d, leads: d.leads.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)) });
    const { error } = await supabase.from("leads").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", lead.id);
    if (error) alert("Gagal menyimpan: " + error.message);
  };

  const savePosts = async () => {
    if (!editing) return;
    const clean = editing.filter((p) => p.date && p.title.trim()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (await saveSetting("tiktok_schedule", clean)) {
      setData((d) => d && { ...d, posts: clean });
      setEditing(null);
    }
  };

  const tasks = toSend.length + due.length + replied.length + todayPosts.length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-3"><Sun className="w-7 h-7" /> Tugas Hari Ini</h1>
        <p className="text-text-muted capitalize">{fmt(today)}</p>
      </div>

      {/* Progres menuju 50 pesan */}
      <section className={card}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="font-bold flex items-center gap-2"><Users className="w-4 h-4" /> Pesan ke calon klien</p>
          <p className="text-sm text-text-muted"><b className="text-foreground">{sent}</b> dari target {TARGET_SENT}</p>
        </div>
        <div className="h-3 rounded-full bg-background border border-border overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (sent / TARGET_SENT) * 100)}%` }} />
        </div>
        <p className="text-xs text-text-muted mt-2">Klien pertama biasanya datang setelah puluhan pesan. Cukup 2 sampai 5 pesan sehari, yang penting rutin.</p>
      </section>

      {/* 1. Cari calon klien */}
      <section className={card}>
        <p className="font-bold flex items-center gap-2 mb-1"><Bot className="w-4 h-4" /> 1. Cari calon klien baru</p>
        <p className="text-sm text-text-muted mb-3">Jalankan agent sekali untuk 5 usaha. Yang skornya 6 ke bawah otomatis disembunyikan.</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Kata kunci hari ini:</span>
          <code className="text-sm bg-background border border-border rounded-lg px-2 py-1">{query}</code>
          <Link href={`/admin/agent-klien?q=${encodeURIComponent(query)}`} className="flex items-center gap-1.5 bg-primary text-white font-bold px-3 py-1.5 rounded-xl text-sm">
            <Bot className="w-4 h-4" /> Buka Agent Klien
          </Link>
        </div>
      </section>

      {/* 2. Kirim pesan pembuka */}
      <section className={card}>
        <p className="font-bold flex items-center gap-2 mb-1"><MessageCircle className="w-4 h-4" /> 2. Kirim pesan pembuka ({toSend.length})</p>
        <p className={`text-sm mb-3 ${win.ok ? "text-emerald-600" : "text-amber-600"}`}>{win.text}</p>
        {toSend.length === 0 ? (
          <p className="text-sm text-text-muted">Tidak ada pesan yang menunggu. Jalankan agent di langkah 1.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {toSend.map((l) => {
              const link = waLink(l.phone, l.message ?? "");
              return (
                <div key={l.id} className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="flex-1 min-w-40 text-sm"><b>{l.name}</b> <span className="text-text-muted">· skor {l.fit_score}</span></span>
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm"><MessageCircle className="w-4 h-4" /> Buka WhatsApp</a>
                  ) : (
                    <CopyButton text={l.message ?? ""} label="Salin pesan (nomor tidak ada)" />
                  )}
                  <button onClick={() => patchLead(l, { status: "dikirim", next_follow_up: localDate(4, data.now) })} className="flex items-center gap-1.5 border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover">
                    <Check className="w-4 h-4" /> Sudah dikirim
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Follow up */}
      <section className={card}>
        <p className="font-bold flex items-center gap-2 mb-1"><CalendarClock className="w-4 h-4" /> 3. Follow up ({due.length})</p>
        <p className="text-sm text-text-muted mb-3">Belum dibalas setelah beberapa hari. Follow up cukup sekali; kalau tetap diam, tandai tidak tertarik.</p>
        {due.length === 0 ? (
          <p className="text-sm text-text-muted">Tidak ada follow up hari ini.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {due.map((l) => {
              const already = (l.notes ?? "").includes(FOLLOWED);
              const link = waLink(l.phone, followUpText(l));
              return (
                <div key={l.id} className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="flex-1 min-w-40 text-sm">
                    <b>{l.name}</b> <span className="text-text-muted">· {already ? "sudah di-follow up, tetap belum dibalas" : `dikirim, follow up ${fmt(l.next_follow_up!)}`}</span>
                  </span>
                  {already ? (
                    <button onClick={() => patchLead(l, { status: "tidak_tertarik", next_follow_up: null })} className="border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover">Tandai tidak tertarik</button>
                  ) : (
                    <>
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm"><MessageCircle className="w-4 h-4" /> Kirim follow up</a>
                      ) : (
                        <CopyButton text={followUpText(l)} label="Salin follow up" />
                      )}
                      <button
                        onClick={() => patchLead(l, { next_follow_up: localDate(5, data.now), notes: `${FOLLOWED} ${today}] ${l.notes ?? ""}`.trim() })}
                        className="flex items-center gap-1.5 border border-border font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-surface-hover"
                      >
                        <Check className="w-4 h-4" /> Sudah follow up
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Balas yang membalas */}
      <section className={card}>
        <p className="font-bold flex items-center gap-2 mb-1"><MessagesSquare className="w-4 h-4" /> 4. Balas calon klien yang membalas ({replied.length})</p>
        <p className="text-sm text-text-muted mb-3">Ada balasan WA? Ubah status lead-nya ke Dibalas di Agent Klien, lalu siapkan jawaban di Balas Chat.</p>
        {replied.length === 0 ? (
          <Link href="/admin/balas-chat" className="text-sm font-semibold text-primary hover:underline">Buka Balas Chat</Link>
        ) : (
          <div className="flex flex-col gap-3">
            {replied.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <span className="flex-1 min-w-40 text-sm font-bold">{l.name}</span>
                <Link href={`/admin/balas-chat?lead=${l.id}`} className="flex items-center gap-1.5 bg-primary text-white font-bold px-3 py-1.5 rounded-xl text-sm"><MessagesSquare className="w-4 h-4" /> Siapkan balasan</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. TikTok */}
      <section className={card}>
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="font-bold flex items-center gap-2"><Clapperboard className="w-4 h-4" /> 5. TikTok</p>
          {!editing && <button onClick={() => setEditing(structuredClone(data.posts))} className="text-xs font-semibold text-primary hover:underline">Atur jadwal</button>}
        </div>
        {editing ? (
          <div className="flex flex-col gap-2 mt-2">
            {editing.map((p, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center border-t border-border pt-2">
                <input type="date" className={field} value={p.date} onChange={(e) => setEditing(editing.map((x, k) => (k === i ? { ...x, date: e.target.value } : x)))} />
                <input type="time" className={field} value={p.time} onChange={(e) => setEditing(editing.map((x, k) => (k === i ? { ...x, time: e.target.value } : x)))} />
                <input className={`${field} flex-1 min-w-40`} placeholder="Judul video" value={p.title} onChange={(e) => setEditing(editing.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
                <input className={`${field} w-full`} placeholder="Komentar yang di-pin setelah tayang (opsional)" value={p.pin ?? ""} onChange={(e) => setEditing(editing.map((x, k) => (k === i ? { ...x, pin: e.target.value } : x)))} />
                <button onClick={() => setEditing(editing.filter((_, k) => k !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => setEditing([...editing, { date: today, time: "19:00", title: "", pin: "" }])} className="flex items-center gap-1.5 border border-border font-semibold px-3 py-1.5 rounded-xl text-sm"><Plus className="w-4 h-4" /> Tambah video</button>
              <button onClick={savePosts} className="flex items-center gap-1.5 bg-primary text-white font-bold px-3 py-1.5 rounded-xl text-sm"><Save className="w-4 h-4" /> Simpan</button>
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-text-muted">Batal</button>
            </div>
          </div>
        ) : (
          <>
            {todayPosts.length === 0 ? (
              <p className="text-sm text-text-muted mb-2">Tidak ada video yang tayang hari ini.</p>
            ) : (
              todayPosts.map((p) => (
                <div key={p.title} className="text-sm border-t border-border pt-3 mt-2 flex flex-col gap-2">
                  <p><b>{p.title}</b> tayang jam {p.time}. Setelah tayang, balas semua komentar di 1 jam pertama.</p>
                  {p.pin && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-text-muted">Pin komentar:</span>
                      <code className="bg-background border border-border rounded-lg px-2 py-1">{p.pin}</code>
                      <CopyButton text={p.pin} />
                    </div>
                  )}
                </div>
              ))
            )}
            {nextPosts.length > 0 && (
              <p className="text-xs text-text-muted mt-3">Berikutnya: {nextPosts.map((p) => `${p.title} (${fmt(p.date)} ${p.time})`).join(" · ")}</p>
            )}
            {data.posts.length === 0 && <p className="text-xs text-text-muted">Jadwal belum diisi. Klik Atur jadwal.</p>}
          </>
        )}
      </section>

      <p className="text-center text-sm text-text-muted">{tasks === 0 ? "Semua beres untuk hari ini 🎉" : `${tasks} hal menunggu hari ini. Kerjakan dari atas ke bawah.`}</p>
    </div>
  );
}
