"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2, Plus, X, Image as ImageIcon } from "lucide-react";

export default function AdminCertificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({ title: "", image: "", sort: 0 });

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("certificates").select("*").order("sort", { ascending: true }).order("id", { ascending: false });
      if (error) console.error("Supabase Error:", error);
      if (data) setCerts(data);
    } catch (e) {
      console.error("Exception fetching certificates:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from("images").upload(fileName, file);
    
    if (error) {
      alert("Gagal upload gambar (pastikan bucket 'images' sudah dibuat).");
    } else {
      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image: publicUrlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("Judul wajib diisi");

    if (editingId) {
      await supabase.from("certificates").update(formData).eq("id", editingId);
    } else {
      await supabase.from("certificates").insert([{ ...formData, sort: formData.sort || certs.length + 1 }]);
    }
    
    setShowForm(false);
    fetchCerts();
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({ title: c.title || "", image: c.image || "", sort: c.sort || 0 });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus sertifikat ini?")) return;
    await supabase.from("certificates").delete().eq("id", id);
    fetchCerts();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Certificates</h1>
          <p className="text-text-muted">Kelola sertifikat dan penghargaan yang tampil di portofolio.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ title: "", image: "", sort: certs.length + 1 }); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Sertifikat
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Sertifikat" : "Tambah Sertifikat"}</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Judul Sertifikat *</label>
                <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Contoh: Responsive Web Design" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Urutan (Sort)</label>
                <input type="number" value={formData.sort} onChange={(e) => setFormData({...formData, sort: parseInt(e.target.value) || 0})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="1" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Gambar URL (atau Upload)</label>
              <div className="flex gap-3">
                <input type="url" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
                <label className="cursor-pointer flex items-center justify-center gap-2 bg-surface-subtle border border-border px-4 py-2.5 rounded-xl hover:bg-surface-hover transition-colors text-sm font-semibold">
                  {uploading ? "Loading..." : <><ImageIcon className="w-4 h-4" /> Upload</>}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-48 h-auto object-cover rounded-lg border border-border shadow-sm" />}
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-sm">{editingId ? "Simpan Perubahan" : "Simpan Sertifikat"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : certs.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-text-muted mb-4">Belum ada sertifikat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {certs.map((c) => (
            <div key={c.id} className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-border-hover transition-colors shadow-sm">
              <div className="aspect-[4/3] bg-muted w-full relative overflow-hidden">
                {c.image ? <img src={c.image} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">No Image</div>}
              </div>
              <div className="p-4 flex flex-col">
                <h3 className="font-bold text-foreground text-sm line-clamp-2 min-h-[40px]">{c.title}</h3>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="text-xs font-semibold text-text-muted px-2 py-1 bg-surface-subtle rounded-md">Urutan: #{c.sort || '-'}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
