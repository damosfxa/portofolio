"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Calculator, Copy, FileText, Pencil, Plus, Printer, Receipt, RotateCcw, Save, Trash2, X } from "lucide-react";
import {
  INVOICE_DRAFT_KEY, LEVEL_STYLE, roundPrice, rupiah,
  type EstimatorData, type Feature, type Level, type ProjectType, type Settings,
} from "@/content/estimator";
import { loadSetting, saveSetting } from "@/lib/admin-data";

type CustomFeature = Feature & { custom: true };

const input = "bg-background border border-border rounded-xl px-3 py-2 text-sm w-full";
const small = "bg-background border border-border rounded-lg px-2 py-1 text-sm";

export default function AdminEstimatorPage() {
  const [data, setData] = useState<EstimatorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadSetting<EstimatorData>("estimator").then((d) => {
      if (!active) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const save = async (next: EstimatorData) => {
    if (await saveSetting("estimator", next)) setData(next);
  };

  if (loading) return <div className="flex justify-center p-24"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data?.modules?.length || !data.projectTypes?.length) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-3">Kalkulator Estimasi</h1>
        <p className="text-text-muted">Data kalkulator belum ada di database. Jalankan SQL pembuatan tabel lalu file <code>docs/pribadi/isi-data-admin.sql</code> di Supabase SQL Editor, kemudian muat ulang halaman ini.</p>
      </div>
    );
  }
  return <Estimator data={data} onSave={save} />;
}

function Estimator({ data, onSave }: { data: EstimatorData; onSave: (next: EstimatorData) => Promise<void> }) {
  const MODULES = data.modules;
  const PROJECT_TYPES = data.projectTypes;
  const [typeId, setTypeId] = useState(PROJECT_TYPES[0].id);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(PROJECT_TYPES[0].defaults));
  const [custom, setCustom] = useState<CustomFeature[]>([]);
  const [settings, setSettings] = useState<Settings>(data.settings);
  const [client, setClient] = useState("");
  const [projectName, setProjectName] = useState("");
  const [newFeature, setNewFeature] = useState({ label: "", hours: 4, phase: 1 as 1 | 2 });
  const [showQuote, setShowQuote] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<EstimatorData | null>(null);
  const [saving, setSaving] = useState(false);
  const settingsChanged = JSON.stringify(settings) !== JSON.stringify(data.settings);

  const type = PROJECT_TYPES.find((t) => t.id === typeId) ?? PROJECT_TYPES[0];

  const patchSettings = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const saveSettings = async () => {
    setSaving(true);
    await onSave({ ...data, settings });
    setSaving(false);
  };

  const chooseType = (id: string) => {
    const t = PROJECT_TYPES.find((x) => x.id === id);
    if (!t) return;
    if (selected.size > 0 && !confirm("Ganti jenis project? Centang fitur akan diatur ulang sesuai jenis yang dipilih.")) return;
    setTypeId(id);
    setSelected(new Set(t.defaults));
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addCustom = () => {
    if (!newFeature.label.trim() || newFeature.hours <= 0) return;
    setCustom((prev) => [...prev, { id: `custom-${Date.now()}`, label: newFeature.label.trim(), hours: newFeature.hours, level: "sedang", phase: newFeature.phase, custom: true }]);
    setNewFeature({ label: "", hours: 4, phase: 1 });
  };

  const result = useMemo(() => {
    const chosen: Feature[] = [...MODULES.flatMap((m) => m.features.filter((x) => selected.has(x.id))), ...custom];
    const factor = 1 + settings.buffer / 100;
    const calc = (list: Feature[]) => {
      const hours = list.reduce((a, x) => a + x.hours, 0);
      const withBuffer = hours * factor;
      return {
        list,
        hours,
        low: roundPrice(withBuffer * settings.rateLow),
        high: roundPrice(withBuffer * settings.rateHigh),
        weeksMin: Math.max(1, Math.ceil(hours / settings.hoursPerWeek)),
        weeksMax: Math.max(1, Math.ceil(withBuffer / settings.hoursPerWeek)),
      };
    };
    return {
      all: calc(chosen),
      phase1: calc(chosen.filter((x) => x.phase === 1)),
      phase2: calc(chosen.filter((x) => x.phase === 2)),
      hard: chosen.filter((x) => x.level === "sulit"),
      bothDesigns: selected.has("design_custom") && selected.has("design_template"),
    };
  }, [selected, custom, settings, MODULES]);

  const summaryText = () => {
    const { all, phase1, phase2 } = result;
    const lines = [
      `Estimasi ${projectName || type.label}${client ? ` untuk ${client}` : ""}`,
      "",
      `Total: ${rupiah(all.low)} – ${rupiah(all.high)}, sekitar ${all.weeksMin}–${all.weeksMax} minggu`,
      phase2.hours > 0 ? `Tahap 1 (siap pakai): ${rupiah(phase1.low)} – ${rupiah(phase1.high)}, ${phase1.weeksMin}–${phase1.weeksMax} minggu` : "",
      phase2.hours > 0 ? `Tahap 2 (lanjutan): ${rupiah(phase2.low)} – ${rupiah(phase2.high)}, ${phase2.weeksMin}–${phase2.weeksMax} minggu` : "",
      "",
      "Teknologi:",
      ...type.stack.map((s) => `• ${s.part}: ${s.choice} (${s.reason})`),
    ];
    return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Gagal menyalin. Salin manual dari ringkasan di layar.");
    }
  };

  const { all, phase1, phase2 } = result;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3"><Calculator className="w-7 h-7" /> Kalkulator Estimasi</h1>
          <p className="text-text-muted">Pilih jenis project dan fitur dari brief klien. Hasilnya: kisaran harga, lama pengerjaan, tech stack, dan dokumen penawaran. Hanya kamu yang bisa melihat halaman ini.</p>
        </div>
        {!draft && (
          <button onClick={() => setDraft(structuredClone(data))} className="flex items-center gap-2 border border-border font-semibold px-4 py-2 rounded-xl text-sm hover:bg-surface-hover shrink-0">
            <Pencil className="w-4 h-4" /> Atur fitur & jam
          </button>
        )}
      </div>

      {draft && (
        <DataEditor
          draft={draft}
          setDraft={setDraft}
          currentType={typeId}
          selected={selected}
          saving={saving}
          onCancel={() => setDraft(null)}
          onSave={async () => {
            setSaving(true);
            await onSave(draft);
            setSaving(false);
            setDraft(null);
          }}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Kiri: input */}
        <div className="flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-2xl p-5 grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Nama klien / usaha
              <input className={input} value={client} onChange={(e) => setClient(e.target.value)} placeholder="Contoh: Velora Skin" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Nama project
              <input className={input} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Contoh: Website e-commerce" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Jenis project
              <select className={input} value={typeId} onChange={(e) => chooseType(e.target.value)}>
                {PROJECT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
          </section>

          {MODULES.map((m) => {
            const count = m.features.filter((x) => selected.has(x.id)).length;
            return (
              <section key={m.id} className="bg-surface border border-border rounded-2xl p-5">
                <h2 className="font-bold text-foreground mb-3 flex justify-between">
                  <span>{m.label}</span>
                  {count > 0 && <span className="text-xs font-semibold text-text-muted">{count} dipilih</span>}
                </h2>
                <div className="flex flex-col gap-1">
                  {m.features.map((x) => (
                    <label key={x.id} className={`flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-surface-hover ${selected.has(x.id) ? "" : "opacity-60"}`}>
                      <input type="checkbox" checked={selected.has(x.id)} onChange={() => toggle(x.id)} />
                      <span className="flex-1 text-sm">{x.label}</span>
                      {x.phase === 2 && <span className="text-[10px] font-bold uppercase tracking-wide text-blue-500">Tahap 2</span>}
                      <span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${LEVEL_STYLE[x.level]}`}>{x.level}</span>
                      <span className="w-12 text-right text-xs text-text-muted tabular-nums">{x.hours} jam</span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}

          <section className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-bold text-foreground mb-1">Fitur tambahan dari brief</h2>
            <p className="text-xs text-text-muted mb-3">Untuk permintaan khusus yang tidak ada di daftar. Perkirakan jamnya sendiri.</p>
            {custom.map((x) => (
              <div key={x.id} className="flex items-center gap-3 px-2 py-1.5 text-sm">
                <span className="flex-1">{x.label}</span>
                {x.phase === 2 && <span className="text-[10px] font-bold uppercase text-blue-500">Tahap 2</span>}
                <span className="text-xs text-text-muted">{x.hours} jam</span>
                <button onClick={() => setCustom((prev) => prev.filter((c) => c.id !== x.id))} className="p-1 text-red-500 hover:bg-red-500/10 rounded" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-2">
              <input className={`${input} flex-1 min-w-48`} value={newFeature.label} onChange={(e) => setNewFeature({ ...newFeature, label: e.target.value })} placeholder="Contoh: Program poin member" />
              <input type="number" min={1} className={`${input} w-24`} value={newFeature.hours} onChange={(e) => setNewFeature({ ...newFeature, hours: Number(e.target.value) })} aria-label="Jam" />
              <select className={`${input} w-28`} value={newFeature.phase} onChange={(e) => setNewFeature({ ...newFeature, phase: Number(e.target.value) as 1 | 2 })}>
                <option value={1}>Tahap 1</option>
                <option value={2}>Tahap 2</option>
              </select>
              <button onClick={addCustom} className="flex items-center gap-1 bg-foreground text-background font-bold px-4 py-2 rounded-xl text-sm"><Plus className="w-4 h-4" /> Tambah</button>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-bold text-foreground mb-3">Pengaturan tarif</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold">Tarif bawah / jam
                <input type="number" step={5000} className={input} value={settings.rateLow} onChange={(e) => patchSettings({ rateLow: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold">Tarif atas / jam
                <input type="number" step={5000} className={input} value={settings.rateHigh} onChange={(e) => patchSettings({ rateHigh: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold">Cadangan waktu (%)
                <input type="number" className={input} value={settings.buffer} onChange={(e) => patchSettings({ buffer: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold">Jam kerja / minggu
                <input type="number" className={input} value={settings.hoursPerWeek} onChange={(e) => patchSettings({ hoursPerWeek: Math.max(1, Number(e.target.value)) })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold">DP (%)
                <input type="number" className={input} value={settings.dpPercent} onChange={(e) => patchSettings({ dpPercent: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold">Jatah revisi
                <input type="number" className={input} value={settings.revisions} onChange={(e) => patchSettings({ revisions: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold">Dukungan setelah online (hari)
                <input type="number" className={input} value={settings.supportDays} onChange={(e) => patchSettings({ supportDays: Number(e.target.value) })} />
              </label>
              <div className="flex items-end gap-3">
                <button onClick={saveSettings} disabled={!settingsChanged || saving} className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white rounded-lg px-3 py-2 disabled:opacity-40"><Save className="w-3.5 h-3.5" /> Simpan</button>
                <button onClick={() => setSettings(data.settings)} disabled={!settingsChanged} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-foreground disabled:opacity-40"><RotateCcw className="w-3.5 h-3.5" /> Batal</button>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">Perubahan langsung dipakai untuk hitungan. Klik Simpan supaya jadi bawaan berikutnya (tersimpan di database, khusus admin).</p>
          </section>
        </div>

        {/* Kanan: hasil */}
        <aside className="lg:sticky lg:top-6 h-fit flex flex-col gap-4">
          <section className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Total estimasi</p>
            <p className="text-2xl font-bold text-foreground mt-1">{rupiah(all.low)} – {rupiah(all.high)}</p>
            <p className="text-sm text-text-muted mt-1">{all.hours} jam kerja (+{settings.buffer}% cadangan) · {all.weeksMin}–{all.weeksMax} minggu</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-background border border-border p-3">
                <p className="text-xs text-text-muted">Harga bawah</p>
                <p className="font-bold">{rupiah(all.low)}</p>
                <p className="text-[11px] text-text-muted">Jangan turun di bawah ini</p>
              </div>
              <div className="rounded-xl bg-background border border-border p-3">
                <p className="text-xs text-text-muted">Harga atas</p>
                <p className="font-bold">{rupiah(all.high)}</p>
                <p className="text-[11px] text-text-muted">Tawarkan ini dulu</p>
              </div>
            </div>
            {result.bothDesigns && <p className="mt-3 text-xs text-amber-600">Desain custom dan desain template sama-sama dicentang. Biasanya cukup salah satu.</p>}
          </section>

          {phase2.hours > 0 && (
            <section className="bg-surface border border-border rounded-2xl p-5 text-sm">
              <p className="font-bold text-foreground mb-2">Saran negosiasi: bagi dua tahap</p>
              <div className="flex justify-between py-1"><span>Tahap 1 · siap pakai ({phase1.list.length} fitur)</span><span className="font-semibold">{rupiah(phase1.low)} – {rupiah(phase1.high)}</span></div>
              <p className="text-xs text-text-muted">{phase1.weeksMin}–{phase1.weeksMax} minggu</p>
              <div className="flex justify-between py-1 mt-2"><span>Tahap 2 · lanjutan ({phase2.list.length} fitur)</span><span className="font-semibold">{rupiah(phase2.low)} – {rupiah(phase2.high)}</span></div>
              <p className="text-xs text-text-muted">{phase2.weeksMin}–{phase2.weeksMax} minggu</p>
              <p className="text-xs text-text-muted mt-3">Kalau klien bilang kemahalan, tawarkan tahap 1 dulu. Kurangi fitur, bukan harga.</p>
            </section>
          )}

          {result.hard.length > 0 && (
            <section className="bg-surface border border-border rounded-2xl p-5 text-sm">
              <p className="font-bold text-foreground mb-2">Bagian tersulit ({result.hard.length})</p>
              <ul className="list-disc pl-5 text-text-muted space-y-0.5">
                {result.hard.map((x) => <li key={x.id}>{x.label}</li>)}
              </ul>
            </section>
          )}

          <section className="bg-surface border border-border rounded-2xl p-5 text-sm">
            <p className="font-bold text-foreground mb-2">Tech stack (jawaban kalau klien bertanya)</p>
            <ul className="space-y-2">
              {type.stack.map((s) => (
                <li key={s.part}><span className="font-semibold">{s.part}:</span> {s.choice}<br /><span className="text-xs text-text-muted">{s.reason}</span></li>
              ))}
            </ul>
          </section>

          <section className="bg-surface border border-border rounded-2xl p-5 text-sm">
            <p className="font-bold text-foreground mb-2">Tanyakan ke klien dulu</p>
            <ul className="list-disc pl-5 text-text-muted space-y-0.5">
              {type.questions.map((q) => <li key={q}>{q}</li>)}
            </ul>
          </section>

          <div className="flex flex-col gap-2">
            <button onClick={() => setShowQuote(true)} disabled={all.hours === 0} className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 py-3 rounded-xl text-sm disabled:opacity-40"><FileText className="w-4 h-4" /> Buat penawaran</button>
            <button onClick={copySummary} disabled={all.hours === 0} className="flex items-center justify-center gap-2 border border-border font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-surface-hover disabled:opacity-40"><Copy className="w-4 h-4" /> {copied ? "Tersalin!" : "Salin ringkasan untuk chat"}</button>
          </div>
        </aside>
      </div>

      {showQuote && (
        <Quote
          client={client}
          projectName={projectName || type.label}
          type={type}
          settings={settings}
          phase1={phase1}
          phase2={phase2}
          onClose={() => setShowQuote(false)}
        />
      )}
    </div>
  );
}

type PhaseResult = { list: Feature[]; hours: number; low: number; high: number; weeksMin: number; weeksMax: number };

/** Dokumen penawaran yang bisa diubah harganya lalu dicetak atau disimpan sebagai PDF. */
function Quote({
  client, projectName, type, settings, phase1, phase2, onClose,
}: {
  client: string;
  projectName: string;
  type: ProjectType;
  settings: Settings;
  phase1: PhaseResult;
  phase2: PhaseResult;
  onClose: () => void;
}) {
  const hasPhase2 = phase2.hours > 0;
  const [price1, setPrice1] = useState(hasPhase2 ? phase1.high : phase1.high + phase2.high);
  const [price2, setPrice2] = useState(phase2.high);
  const [includePhase2, setIncludePhase2] = useState(hasPhase2);
  const [number] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `PNW/${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}${pad(d.getHours())}`;
  });
  const today = new Date();
  const fmtDate = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const validUntil = new Date(today.getTime() + 14 * 86400000);

  // Bila tahap 2 tidak dipisah, semua fitur masuk satu lingkup kerja.
  const scope1 = hasPhase2 ? phase1.list : [...phase1.list, ...phase2.list];
  const weeks1 = hasPhase2 ? `${phase1.weeksMin}–${phase1.weeksMax}` : `${phase1.weeksMin + phase2.weeksMin}–${phase1.weeksMax + phase2.weeksMax}`;
  const total = price1 + (hasPhase2 && includePhase2 ? price2 : 0);
  const dp = roundPrice((price1 * settings.dpPercent) / 100);
  const router = useRouter();

  // Lanjutkan ke halaman Invoice dengan tagihan DP yang sudah terisi.
  const toInvoice = () => {
    const draft = {
      client,
      project: projectName,
      kind: "dp",
      items: [{ desc: `DP ${settings.dpPercent}% ${projectName}${hasPhase2 ? " (tahap 1)" : ""}`, qty: 1, price: dp }],
      notes: `Sesuai penawaran ${number}`,
    };
    try {
      sessionStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify(draft));
    } catch {}
    router.push("/admin/invoice");
  };


  return createPortal(
    <div className="quote-print fixed inset-0 z-[200] overflow-y-auto bg-black/60 p-4 print:static print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 print:hidden">
          <p className="text-white text-sm">Harga bisa diubah langsung di dokumen. Klik Cetak, lalu pilih <b>Save as PDF</b>.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-lg text-sm"><Printer className="w-4 h-4" /> Cetak / PDF</button>
            <button onClick={toInvoice} className="flex items-center gap-2 bg-[#F2A33A] text-black font-bold px-4 py-2 rounded-lg text-sm"><Receipt className="w-4 h-4" /> Buat invoice DP</button>
            <button onClick={onClose} className="flex items-center gap-1 bg-white/20 text-white px-3 py-2 rounded-lg text-sm"><X className="w-4 h-4" /> Tutup</button>
          </div>
        </div>

        <p className="sm:hidden text-white/80 text-xs mb-2 print:hidden">Geser ke samping untuk melihat seluruh dokumen.</p>
        <div className="overflow-x-auto print:overflow-visible">
        <article className="min-w-[640px] print:min-w-0 bg-white text-[#2B1E16] p-6 sm:p-10 shadow-xl print:shadow-none print:p-0 text-[13px] leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>
          <header className="flex justify-between gap-6 border-b-4 border-[#F2A33A] pb-5">
            <div>
              <p className="text-2xl font-bold">Penawaran Harga</p>
              <p className="text-[#6B5646]">{number}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-base">Rizky Rhamadani</p>
              <p>Fullstack Developer</p>
              <p>rizkyrhamadani.com · ryzkirham@gmail.com</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#6B5646]">Untuk</p>
              <p className="font-bold">{client || "(nama klien)"}</p>
              <p>{projectName}</p>
            </div>
            <div className="text-right">
              <p><span className="text-[#6B5646]">Tanggal:</span> {fmtDate(today)}</p>
              <p><span className="text-[#6B5646]">Berlaku sampai:</span> {fmtDate(validUntil)}</p>
            </div>
          </section>

          <PhaseBlock title={hasPhase2 ? "Tahap 1 · siap pakai" : "Lingkup pekerjaan"} list={scope1} weeks={weeks1} price={price1} onPrice={setPrice1} />

          {hasPhase2 && (
            <div className={includePhase2 ? "" : "print:hidden opacity-40"}>
              <label className="flex items-center gap-2 mt-6 text-xs text-[#6B5646] print:hidden">
                <input type="checkbox" checked={includePhase2} onChange={(e) => setIncludePhase2(e.target.checked)} /> Sertakan tahap 2 di penawaran (opsional untuk klien)
              </label>
              <PhaseBlock title="Tahap 2 · lanjutan (opsional)" list={phase2.list} weeks={`${phase2.weeksMin}–${phase2.weeksMax}`} price={price2} onPrice={setPrice2} />
            </div>
          )}

          <section className="mt-6 flex justify-end">
            <table className="text-sm">
              <tbody>
                <tr><td className="pr-6">{hasPhase2 && includePhase2 ? "Total bila tahap 1 dan 2 diambil" : "Total"}</td><td className="font-bold text-right">{rupiah(total)}</td></tr>
                <tr><td className="pr-6 text-[#6B5646]">DP {settings.dpPercent}% sebelum mulai{hasPhase2 ? " (tahap 1)" : ""}</td><td className="text-right">{rupiah(dp)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="mt-6">
            <p className="font-bold mb-1">Teknologi</p>
            <ul className="list-disc pl-5">
              {type.stack.map((s) => <li key={s.part}><b>{s.part}:</b> {s.choice}. {s.reason}.</li>)}
            </ul>
          </section>

          <section className="mt-6">
            <p className="font-bold mb-1">Ketentuan</p>
            <ol className="list-decimal pl-5 space-y-0.5">
              <li>Pembayaran: DP {settings.dpPercent}% sebelum pengerjaan dimulai, sisanya saat serah terima{hasPhase2 ? " setiap tahap" : ""}.</li>
              <li>Termasuk {settings.revisions} kali revisi untuk fitur di atas. Fitur di luar daftar dihitung terpisah.</li>
              <li>Progres dan demo bisa dicoba setiap minggu selama pengerjaan.</li>
              <li>Kode dan akses diserahkan setelah pelunasan, dengan dukungan perbaikan bug selama {settings.supportDays} hari setelah website online.</li>
              <li>Teks, foto produk, dan logo disiapkan oleh klien, kecuali disepakati lain.</li>
            </ol>
          </section>

          <section className="mt-6">
            <p className="font-bold mb-1">Biaya di luar jasa (dibayar langsung oleh klien)</p>
            <ul className="list-disc pl-5">
              {type.external.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </section>

          <footer className="mt-10 border-t border-gray-200 pt-4 text-[#6B5646]">
            Terima kasih atas kepercayaannya. Untuk pertanyaan atau penyesuaian fitur, hubungi ryzkirham@gmail.com.
          </footer>
        </article>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PhaseBlock({ title, list, weeks, price, onPrice }: { title: string; list: Feature[]; weeks: string; price: number; onPrice: (n: number) => void }) {
  return (
    <section className="mt-6 break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 pb-1 mb-2">
        <p className="font-bold">{title}</p>
        <div className="font-bold">
          <span className="hidden print:inline">{rupiah(price)}</span>
          <label className="flex items-center gap-2 print:hidden">
            Rp
            <input type="number" step={100000} value={price} onChange={(e) => onPrice(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 w-40 text-right" />
          </label>
        </div>
      </div>
      <p className="text-[11px] text-[#6B5646] -mt-1 mb-2 print:hidden">Tampil di PDF sebagai {rupiah(price)}</p>
      <ul className="columns-2 gap-6 list-disc pl-5">
        {list.map((x) => <li key={x.id} className="break-inside-avoid">{x.label}</li>)}
      </ul>
      <p className="mt-2 text-[#6B5646]">Perkiraan pengerjaan: {weeks} minggu</p>
    </section>
  );
}

const LEVELS: Level[] = ["mudah", "sedang", "sulit"];
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 30) || "fitur";

/** Mode atur data: ubah fitur, jam, kesulitan, tahap, dan isi tiap jenis project. Disimpan ke database. */
function DataEditor({
  draft, setDraft, currentType, selected, saving, onCancel, onSave,
}: {
  draft: EstimatorData;
  setDraft: React.Dispatch<React.SetStateAction<EstimatorData | null>>;
  currentType: string;
  selected: Set<string>;
  saving: boolean;
  onCancel: () => void;
  onSave: () => Promise<void>;
}) {
  const [typeId, setTypeId] = useState(currentType);
  const type = draft.projectTypes.find((t) => t.id === typeId) ?? draft.projectTypes[0];

  const editFeature = (mi: number, fi: number, patch: Partial<Feature>) =>
    setDraft((d) => d && { ...d, modules: d.modules.map((m, i) => (i !== mi ? m : { ...m, features: m.features.map((x, k) => (k === fi ? { ...x, ...patch } : x)) })) });
  const removeFeature = (mi: number, fi: number) =>
    setDraft((d) => d && { ...d, modules: d.modules.map((m, i) => (i !== mi ? m : { ...m, features: m.features.filter((_, k) => k !== fi) })) });
  const addFeature = (mi: number) =>
    setDraft((d) => {
      if (!d) return d;
      const label = "Fitur baru";
      const all = new Set(d.modules.flatMap((m) => m.features.map((x) => x.id)));
      let id = slug(label);
      while (all.has(id)) id = `${slug(label)}_${Math.random().toString(36).slice(2, 5)}`;
      return { ...d, modules: d.modules.map((m, i) => (i !== mi ? m : { ...m, features: [...m.features, { id, label, hours: 4, level: "sedang", phase: 1 }] })) };
    });
  const editType = (patch: Partial<ProjectType>) =>
    setDraft((d) => d && { ...d, projectTypes: d.projectTypes.map((t) => (t.id === type.id ? { ...t, ...patch } : t)) });

  const lines = (arr: string[]) => arr.join("\n");
  const fromLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);
  const stackText = type.stack.map((x) => `${x.part} | ${x.choice} | ${x.reason}`).join("\n");
  const stackFrom = (text: string) =>
    fromLines(text).map((l) => {
      const [part = "", choice = "", reason = ""] = l.split("|").map((v) => v.trim());
      return { part, choice, reason };
    });

  return (
    <section className="bg-surface border-2 border-primary rounded-2xl p-6 mb-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Atur fitur & jam</h2>
          <p className="text-xs text-text-muted">Perubahan baru dipakai setelah klik Simpan. Data tersimpan di database dan hanya bisa dibaca akun admin.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
          <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </div>

      {draft.modules.map((m, mi) => (
        <div key={m.id}>
          <input className={`${small} font-bold mb-2`} value={m.label} onChange={(e) => setDraft((d) => d && { ...d, modules: d.modules.map((x, i) => (i === mi ? { ...x, label: e.target.value } : x)) })} />
          <div className="flex flex-col gap-1.5">
            {m.features.map((x, fi) => (
              <div key={x.id} className="flex flex-wrap items-center gap-2">
                <input className={`${small} flex-1 min-w-56`} value={x.label} onChange={(e) => editFeature(mi, fi, { label: e.target.value })} />
                <input type="number" min={1} className={`${small} w-20`} value={x.hours} onChange={(e) => editFeature(mi, fi, { hours: Number(e.target.value) })} aria-label="Jam" />
                <select className={small} value={x.level} onChange={(e) => editFeature(mi, fi, { level: e.target.value as Level })}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select className={small} value={x.phase} onChange={(e) => editFeature(mi, fi, { phase: Number(e.target.value) as 1 | 2 })}>
                  <option value={1}>Tahap 1</option>
                  <option value={2}>Tahap 2</option>
                </select>
                <button onClick={() => removeFeature(mi, fi)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded" aria-label="Hapus fitur"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => addFeature(mi)} className="mt-1.5 text-xs font-semibold text-primary hover:underline">+ Tambah fitur di {m.label}</button>
        </div>
      ))}

      <div className="border-t border-border pt-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-bold">Jenis project:</p>
          <select className={small} value={type.id} onChange={(e) => setTypeId(e.target.value)}>
            {draft.projectTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input className={`${small} flex-1 min-w-48`} value={type.label} onChange={(e) => editType({ label: e.target.value })} aria-label="Nama jenis project" />
        </div>
        <button onClick={() => editType({ defaults: [...selected] })} className="self-start text-xs font-semibold text-primary hover:underline">
          Jadikan centang fitur yang sekarang ({selected.size}) sebagai bawaan jenis ini
        </button>
        <label className="flex flex-col gap-1 text-xs font-semibold">Tech stack (satu baris: Bagian | Pilihan | Alasan)
          <textarea rows={5} className={input} defaultValue={stackText} key={`stack-${type.id}`} onBlur={(e) => editType({ stack: stackFrom(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">Biaya di luar jasa (satu per baris)
          <textarea rows={4} className={input} defaultValue={lines(type.external)} key={`ext-${type.id}`} onBlur={(e) => editType({ external: fromLines(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">Pertanyaan untuk klien (satu per baris)
          <textarea rows={6} className={input} defaultValue={lines(type.questions)} key={`q-${type.id}`} onBlur={(e) => editType({ questions: fromLines(e.target.value) })} />
        </label>
      </div>
    </section>
  );
}
