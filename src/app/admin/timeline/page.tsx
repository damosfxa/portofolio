"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2, Plus, X } from "lucide-react";

export default function AdminTimeline() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ year: "", title: "", description: "", sort: 0 });

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("timeline").select("*").order("sort", { ascending: true }).order("id", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.year) return alert("Tahun dan Judul wajib diisi");

    if (editingId) {
      await supabase.from("timeline").update(formData).eq("id", editingId);
    } else {
      await supabase.from("timeline").insert([{ ...formData, sort: formData.sort || items.length + 1 }]);
    }
    
    setShowForm(false);
    fetchTimeline();
  };

  const openEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({ year: t.year || "", title: t.title || "", description: t.description || "", sort: t.sort || 0 });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus timeline ini?")) return;
    await supabase.from("timeline").delete().eq("id", id);
    fetchTimeline();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Timeline</h1>
          <p className="text-text-muted">Kelola riwayat pendidikan atau pengalaman kerja.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ year: "", title: "", description: "", sort: items.length + 1 }); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Timeline
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Timeline" : "Tambah Timeline"}</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Tahun *</label>
                <input value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Contoh: 2021 - 2024" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Urutan (Sort)</label>
                <input type="number" value={formData.sort} onChange={(e) => setFormData({...formData, sort: parseInt(e.target.value) || 0})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="1" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Judul / Posisi *</label>
              <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Contoh: Universitas Brawijaya" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Deskripsi Singkat</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Detail kegiatan atau pencapaian..." />
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-sm">{editingId ? "Simpan Perubahan" : "Simpan Timeline"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-text-muted mb-4">Belum ada timeline.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((t) => (
            <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface border border-border rounded-xl hover:border-border-hover transition-colors gap-4">
              <div className="flex gap-4 sm:gap-6 items-start">
                <div className="w-24 shrink-0 mt-1"><span className="text-sm font-bold text-primary">{t.year}</span></div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-foreground text-lg">{t.title}</h3>
                  {t.description && <p className="text-sm text-text-muted mt-1">{t.description}</p>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0 self-start sm:self-center">
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
