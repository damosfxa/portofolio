"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Edit2, Plus, Printer, Receipt, RotateCcw, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadSetting, saveSetting } from "@/lib/admin-data";
import { INVOICE_DRAFT_KEY, rupiah } from "@/content/estimator";
import type { Invoice, InvoiceItem } from "@/lib/types";


type Bank = { bank: string; account: string; name: string };
type Draft = Omit<Invoice, "id" | "number" | "paid_at" | "status">;

const KIND_LABEL: Record<Invoice["kind"], string> = { dp: "DP (uang muka)", pelunasan: "Pelunasan", lainnya: "Lainnya" };

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(new Date(iso).getTime() + n * 86400000).toISOString().slice(0, 10);
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-");
const totalOf = (inv: Pick<Invoice, "items" | "discount">) => Math.max(0, inv.items.reduce((a, x) => a + x.qty * x.price, 0) - (inv.discount || 0));

const emptyDraft = (): Draft => ({
  client: "", project: "", kind: "dp", items: [{ desc: "", qty: 1, price: 0 }], discount: 0,
  issued_at: today(), due_at: addDays(today(), 7), notes: "",
});

async function loadInvoices() {
  const { data, error } = await supabase.from("invoices").select("*").order("issued_at", { ascending: false }).order("id", { ascending: false });
  if (error) {
    alert("Gagal memuat invoice: " + error.message + (/invoices/.test(error.message) ? "\n\nTabel invoice belum dibuat. Jalankan SQL pembuatan tabel di Supabase dulu." : ""));
  }
  return (data ?? []) as Invoice[];
}

// Nomor urut per bulan: INV/2026/10/001, INV/2026/10/002, dan seterusnya.
async function nextNumber(issued: string) {
  const [y, m] = issued.split("-");
  const prefix = `INV/${y}/${m}/`;
  const { data } = await supabase.from("invoices").select("number").like("number", `${prefix}%`);
  const last = (data ?? []).map((r) => Number(String(r.number).slice(prefix.length)) || 0).reduce((a, b) => Math.max(a, b), 0);
  return prefix + String(last + 1).padStart(3, "0");
}

const EMPTY_BANK: Bank = { bank: "", account: "", name: "" };

// Draf dari Kalkulator dibaca sekali saat halaman dibuka, lalu dihapus.
function takeDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(INVOICE_DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(INVOICE_DRAFT_KEY);
    return { ...emptyDraft(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

const field = "bg-background border border-border rounded-xl px-3 py-2 text-sm w-full";

export default function AdminInvoice() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialDraft] = useState(takeDraft);
  const [form, setForm] = useState<Draft | null>(initialDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [bank, setBankState] = useState<Bank>(EMPTY_BANK);
  const [savedBank, setSavedBank] = useState<Bank>(EMPTY_BANK);
  const [printing, setPrinting] = useState<Invoice | null>(null);

  const refresh = async () => setItems(await loadInvoices());

  useEffect(() => {
    let active = true;
    Promise.all([loadInvoices(), loadSetting<Bank>("invoice_bank")]).then(([rows, b]) => {
      if (!active) return;
      setItems(rows);
      const nextBank = { ...EMPTY_BANK, ...(b ?? {}) };
      setBankState(nextBank);
      setSavedBank(nextBank);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const setBank = (patch: Partial<Bank>) => setBankState((prev) => ({ ...prev, ...patch }));
  const bankChanged = JSON.stringify(bank) !== JSON.stringify(savedBank);
  const saveBank = async () => {
    if (await saveSetting("invoice_bank", bank)) setSavedBank(bank);
  };

  const patchForm = (patch: Partial<Draft>) => setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  const patchItem = (i: number, patch: Partial<InvoiceItem>) =>
    setForm((prev) => (prev ? { ...prev, items: prev.items.map((x, k) => (k === i ? { ...x, ...patch } : x)) } : prev));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyDraft());
  };

  const openEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      client: inv.client, project: inv.project ?? "", kind: inv.kind, items: inv.items.length ? inv.items : [{ desc: "", qty: 1, price: 0 }],
      discount: inv.discount || 0, issued_at: inv.issued_at, due_at: inv.due_at, notes: inv.notes ?? "",
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const items = form.items.filter((x) => x.desc.trim() && x.price > 0);
    if (!form.client.trim() || !items.length) return alert("Isi nama klien dan minimal satu item dengan harga.");
    setSaving(true);
    const payload = {
      client: form.client.trim(), project: form.project?.trim() || null, kind: form.kind, items,
      discount: Number(form.discount) || 0, issued_at: form.issued_at, due_at: form.due_at || null, notes: form.notes?.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from("invoices").update(payload).eq("id", editingId)
      : await supabase.from("invoices").insert([{ ...payload, number: await nextNumber(form.issued_at), status: "belum" }]);
    setSaving(false);
    if (error) return alert("Gagal menyimpan invoice: " + error.message);
    setForm(null);
    refresh();
  };

  const togglePaid = async (inv: Invoice) => {
    const lunas = inv.status !== "lunas";
    const { error } = await supabase.from("invoices").update({ status: lunas ? "lunas" : "belum", paid_at: lunas ? today() : null }).eq("id", inv.id);
    if (error) return alert("Gagal mengubah status: " + error.message);
    refresh();
  };

  const remove = async (inv: Invoice) => {
    if (!confirm(`Hapus invoice ${inv.number}?`)) return;
    await supabase.from("invoices").delete().eq("id", inv.id);
    refresh();
  };

  const unpaid = items.filter((x) => x.status !== "lunas").reduce((a, x) => a + totalOf(x), 0);
  const paid = items.filter((x) => x.status === "lunas").reduce((a, x) => a + totalOf(x), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3"><Receipt className="w-7 h-7" /> Invoice</h1>
          <p className="text-text-muted">Tagihan DP dan pelunasan. Simpan, cetak sebagai PDF, lalu tandai lunas saat pembayaran masuk.</p>
        </div>
        {!form && (
          <button onClick={openNew} className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl text-sm shrink-0"><Plus className="w-4 h-4" /> Buat Invoice</button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-4"><p className="text-xs text-text-muted">Belum dibayar</p><p className="text-xl font-bold text-amber-600">{rupiah(unpaid)}</p></div>
        <div className="bg-surface border border-border rounded-2xl p-4"><p className="text-xs text-text-muted">Sudah lunas</p><p className="text-xl font-bold text-emerald-600">{rupiah(paid)}</p></div>
      </div>

      {form && (
        <form onSubmit={save} className="bg-surface border border-border rounded-2xl p-6 mb-8 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Invoice" : "Invoice Baru"}</h2>
            <button type="button" onClick={() => setForm(null)} className="text-text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          {initialDraft && !editingId && <p className="text-xs text-blue-500 -mt-3">Terisi dari penawaran di Kalkulator. Cek lagi sebelum disimpan.</p>}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Nama klien *
              <input className={field} value={form.client} onChange={(e) => patchForm({ client: e.target.value })} required />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Project
              <input className={field} value={form.project ?? ""} onChange={(e) => patchForm({ project: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Jenis tagihan
              <select className={field} value={form.kind} onChange={(e) => patchForm({ kind: e.target.value as Invoice["kind"] })}>
                {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Tanggal terbit
              <input type="date" className={field} value={form.issued_at} onChange={(e) => patchForm({ issued_at: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Jatuh tempo
              <input type="date" className={field} value={form.due_at ?? ""} onChange={(e) => patchForm({ due_at: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Diskon (Rp)
              <input type="number" step={50000} className={field} value={form.discount} onChange={(e) => patchForm({ discount: Number(e.target.value) })} />
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Item tagihan *</p>
            <div className="flex flex-col gap-2">
              {form.items.map((x, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-center">
                  <input className={`${field} flex-1 min-w-56`} placeholder="Contoh: DP 50% website e-commerce" value={x.desc} onChange={(e) => patchItem(i, { desc: e.target.value })} />
                  <input type="number" min={1} className={`${field} !w-20`} value={x.qty} onChange={(e) => patchItem(i, { qty: Number(e.target.value) })} aria-label="Jumlah" />
                  <input type="number" step={100000} className={`${field} !w-40`} value={x.price} onChange={(e) => patchItem(i, { price: Number(e.target.value) })} aria-label="Harga" />
                  <span className="w-32 text-right text-sm tabular-nums">{rupiah(x.qty * x.price)}</span>
                  <button type="button" onClick={() => patchForm({ items: form.items.filter((_, k) => k !== i) })} disabled={form.items.length === 1} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-30" aria-label="Hapus item"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => patchForm({ items: [...form.items, { desc: "", qty: 1, price: 0 }] })} className="mt-2 text-sm font-semibold text-primary hover:underline">+ Tambah item</button>
            <p className="mt-3 text-right font-bold">Total: {rupiah(totalOf(form))}</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">Catatan (opsional)
            <textarea rows={2} className={field} value={form.notes ?? ""} onChange={(e) => patchForm({ notes: e.target.value })} placeholder="Contoh: Sesuai penawaran PNW/2026/10/1214" />
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setForm(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white disabled:opacity-50">{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Invoice"}</button>
          </div>
        </form>
      )}

      <section className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-foreground mb-1">Rekening pembayaran</h2>
        <p className="text-xs text-text-muted mb-3">Tampil di setiap invoice. Tersimpan di database, hanya bisa dibaca akun admin.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input className={field} placeholder="Nama bank (contoh: BCA)" value={bank.bank} onChange={(e) => setBank({ bank: e.target.value })} />
          <input className={field} placeholder="Nomor rekening" value={bank.account} onChange={(e) => setBank({ account: e.target.value })} />
          <input className={field} placeholder="Atas nama" value={bank.name} onChange={(e) => setBank({ name: e.target.value })} />
        </div>
        {bankChanged && (
          <button onClick={saveBank} className="mt-3 flex items-center gap-1.5 text-xs font-bold bg-primary text-white rounded-lg px-3 py-2"><Save className="w-3.5 h-3.5" /> Simpan rekening</button>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-muted">Belum ada invoice.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center gap-4 p-4 bg-surface border border-border rounded-xl">
              <div className="flex-1 min-w-48">
                <p className="font-bold text-foreground">{inv.number} <span className="font-normal text-text-muted">· {KIND_LABEL[inv.kind]}</span></p>
                <p className="text-xs text-text-muted">{inv.client}{inv.project ? ` · ${inv.project}` : ""} · {fmtDate(inv.issued_at)}</p>
              </div>
              <p className="font-bold tabular-nums">{rupiah(totalOf(inv))}</p>
              <span className={`text-xs font-bold rounded-full px-3 py-1 ${inv.status === "lunas" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
                {inv.status === "lunas" ? `Lunas ${fmtDate(inv.paid_at)}` : "Belum dibayar"}
              </span>
              <div className="flex gap-1">
                <button onClick={() => togglePaid(inv)} title={inv.status === "lunas" ? "Batalkan status lunas" : "Tandai lunas"} className="p-2 rounded-lg hover:bg-surface-hover text-emerald-600">
                  {inv.status === "lunas" ? <RotateCcw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setPrinting(inv)} title="Cetak / PDF" className="p-2 rounded-lg hover:bg-surface-hover"><Printer className="w-4 h-4" /></button>
                <button onClick={() => openEdit(inv)} title="Edit" className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => remove(inv)} title="Hapus" className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {printing && <InvoiceDoc inv={printing} bank={bank} onClose={() => setPrinting(null)} />}
    </div>
  );
}

/** Dokumen invoice untuk dicetak atau disimpan sebagai PDF. */
function InvoiceDoc({ inv, bank, onClose }: { inv: Invoice; bank: Bank; onClose: () => void }) {
  const subtotal = inv.items.reduce((a, x) => a + x.qty * x.price, 0);
  const lunas = inv.status === "lunas";
  return createPortal(
    <div className="quote-print fixed inset-0 z-[200] overflow-y-auto bg-black/60 p-4 print:static print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-center gap-3 mb-3 print:hidden">
          <p className="text-white text-sm">Klik Cetak, lalu pilih <b>Save as PDF</b>.</p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-lg text-sm"><Printer className="w-4 h-4" /> Cetak / PDF</button>
            <button onClick={onClose} className="flex items-center gap-1 bg-white/20 text-white px-3 py-2 rounded-lg text-sm"><X className="w-4 h-4" /> Tutup</button>
          </div>
        </div>

        <article className="relative bg-white text-[#2B1E16] p-10 shadow-xl print:shadow-none print:p-0 text-[13px] leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>
          {lunas && (
            <div className="absolute right-10 top-28 rotate-[-12deg] border-4 border-emerald-600 text-emerald-600 font-bold text-3xl px-4 py-1 rounded opacity-80">LUNAS</div>
          )}
          <header className="flex justify-between gap-6 border-b-4 border-[#F2A33A] pb-5">
            <div>
              <p className="text-2xl font-bold">Invoice</p>
              <p className="text-[#6B5646]">{inv.number}</p>
              <p className="text-[#6B5646]">{KIND_LABEL[inv.kind]}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-base">Rizky Rhamadani</p>
              <p>Fullstack Developer</p>
              <p>rizkyrhamadani.com · ryzkirham@gmail.com</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#6B5646]">Ditagihkan kepada</p>
              <p className="font-bold">{inv.client}</p>
              {inv.project && <p>{inv.project}</p>}
            </div>
            <div className="text-right">
              <p><span className="text-[#6B5646]">Tanggal:</span> {fmtDate(inv.issued_at)}</p>
              {inv.due_at && <p><span className="text-[#6B5646]">Jatuh tempo:</span> {fmtDate(inv.due_at)}</p>}
              {lunas && <p><span className="text-[#6B5646]">Dibayar:</span> {fmtDate(inv.paid_at)}</p>}
            </div>
          </section>

          <table className="w-full mt-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-[#2B1E16] text-left">
                <th className="py-2">Deskripsi</th>
                <th className="py-2 text-right w-16">Jml</th>
                <th className="py-2 text-right w-36">Harga</th>
                <th className="py-2 text-right w-36">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((x, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-2">{x.desc}</td>
                  <td className="py-2 text-right">{x.qty}</td>
                  <td className="py-2 text-right">{rupiah(x.price)}</td>
                  <td className="py-2 text-right">{rupiah(x.qty * x.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <table className="text-sm">
              <tbody>
                {inv.discount > 0 && (
                  <>
                    <tr><td className="pr-8">Subtotal</td><td className="text-right">{rupiah(subtotal)}</td></tr>
                    <tr><td className="pr-8">Diskon</td><td className="text-right">-{rupiah(inv.discount)}</td></tr>
                  </>
                )}
                <tr className="text-base"><td className="pr-8 font-bold pt-1">Total</td><td className="text-right font-bold pt-1">{rupiah(totalOf(inv))}</td></tr>
              </tbody>
            </table>
          </div>

          {!lunas && (bank.bank || bank.account) && (
            <section className="mt-8 rounded border border-gray-200 p-4">
              <p className="font-bold mb-1">Pembayaran melalui transfer</p>
              <p>{bank.bank} · {bank.account}</p>
              {bank.name && <p>a.n. {bank.name}</p>}
              <p className="text-[#6B5646] mt-1">Mohon kirim bukti transfer setelah pembayaran.</p>
            </section>
          )}

          {inv.notes && <p className="mt-6 text-[#6B5646]">Catatan: {inv.notes}</p>}

          <footer className="mt-10 border-t border-gray-200 pt-4 text-[#6B5646]">Terima kasih atas kepercayaannya.</footer>
        </article>
      </div>
    </div>,
    document.body,
  );
}
