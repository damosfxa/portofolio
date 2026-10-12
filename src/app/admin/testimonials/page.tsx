"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import type { TestimonialItem } from "@/lib/types";

const EMPTY = { quote: "", quote_en: "", name: "", role: "", role_en: "", link: "", sort: 0 };

async function loadTestimonials() {
  const { data, error } = await supabase.from("testimonials").select("*").order("sort", { ascending: true }).order("id", { ascending: false });
  if (error) alert("Gagal memuat testimoni: " + error.message + (/testimonials/.test(error.message) ? "\n\nTabel testimoni belum dibuat. Jalankan SQL pembuatan tabel di Supabase dulu." : ""));
  return (data ?? []) as TestimonialItem[];
}

export default function AdminTestimonials() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY);

  const fetchItems = async () => setItems(await loadTestimonials());

  useEffect(() => {
    let active = true;
    loadTestimonials().then((rows) => {
      if (!active) return;
      setItems(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.quote || !formData.name) return alert("Kutipan dan nama wajib diisi");

    // Kolom opsional yang kosong disimpan sebagai null.
    const payload = {
      quote: formData.quote.trim(),
      name: formData.name.trim(),
      quote_en: formData.quote_en.trim() || null,
      role: formData.role.trim() || null,
      role_en: formData.role_en.trim() || null,
      link: formData.link.trim() || null,
      sort: Number(formData.sort) || items.length + 1,
    };

    const { error } = editingId
      ? await supabase.from("testimonials").update(payload).eq("id", editingId)
      : await supabase.from("testimonials").insert([payload]);
    if (error) return alert("Gagal menyimpan testimoni: " + error.message);

    setShowForm(false);
    fetchItems();
  };

  const openEdit = (t: TestimonialItem) => {
    setEditingId(t.id);
    setFormData({
      quote: t.quote || "", quote_en: t.quote_en || "", name: t.name || "", role: t.role || "",
      role_en: t.role_en || "", link: t.link || "", sort: t.sort || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus testimoni ini?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    fetchItems();
  };

  const field = (name: keyof typeof EMPTY) => ({
    value: formData[name] as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [name]: e.target.value }),
    className: "bg-background border border-border rounded-xl px-4 py-2.5 text-sm",
  });

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Testimoni</h1>
          <p className="text-text-muted">Kata klien atau rekan. Tampil di ruangan Kontak dan versi ringkas; selama kosong, bagian testimoni disembunyikan.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setFormData({ ...EMPTY, sort: items.length + 1 }); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Testimoni
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Testimoni" : "Tambah Testimoni"}</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Kutipan (Indonesia) *</label>
              <textarea {...field("quote")} rows={3} placeholder="Contoh: Sistem stoknya bikin selisih barang langsung ketahuan." required />
              <p className="text-xs text-text-muted">Tulis persis seperti yang dikirim klien. Jangan mengarang atau mengubah maknanya.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Kutipan (Inggris, opsional)</label>
              <textarea {...field("quote_en")} rows={3} placeholder="Kosongkan untuk memakai versi Indonesia" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Nama *</label>
                <input {...field("name")} placeholder="Contoh: Ce Celo" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Link (opsional)</label>
                <input type="url" {...field("link")} placeholder="Situs usaha atau profil LinkedIn" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Peran (Indonesia)</label>
                <input {...field("role")} placeholder="Contoh: Pemilik Celo Beaute" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Peran (Inggris)</label>
                <input {...field("role_en")} placeholder="Contoh: Owner, Celo Beaute" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Urutan (Sort)</label>
                <input type="number" {...field("sort")} placeholder="1" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-sm">{editingId ? "Simpan Perubahan" : "Simpan Testimoni"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-text-muted mb-4">Belum ada testimoni. Bagian testimoni di portofolio tersembunyi sampai ada isinya.</p>
          <button onClick={() => { setFormData({ ...EMPTY, sort: 1 }); setShowForm(true); }} className="text-primary font-semibold text-sm hover:underline">+ Tambah Testimoni Pertama</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 p-4 bg-surface border border-border rounded-xl hover:border-border-hover transition-colors">
              <div>
                <p className="text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-text-muted mt-1">{t.name}{t.role ? ` · ${t.role}` : ""} • Urutan: #{t.sort || "-"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
