"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2, Plus, X } from "lucide-react";

export default function AdminSkills() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: "", category: "Frontend - Language" });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("skills").select("*").order("sort", { ascending: true }).order("id", { ascending: false });
      if (error) console.error("Supabase Error:", error);
      if (data) setSkills(data);
    } catch (e: any) {
      console.error("Exception fetching skills:", e);
      alert("Error fetching skills: " + (e.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      await supabase.from("skills").update(formData).eq("id", editingId);
    } else {
      await supabase.from("skills").insert([{ ...formData, sort: skills.length }]);
    }
    
    setShowForm(false);
    fetchSkills();
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({ name: s.name, category: s.category || "Frontend - Language" });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus skill ini?")) return;
    await supabase.from("skills").delete().eq("id", id);
    fetchSkills();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Skills</h1>
          <p className="text-text-muted">Kelola tech stack yang tampil di halaman utama.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ name: "", category: "Frontend - Language" }); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Skill
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Skill" : "Tambah Skill"}</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Nama Skill *</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Contoh: ReactJS" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Kategori *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm">
                  <optgroup label="Frontend">
                    <option value="Frontend - Language">Language</option>
                    <option value="Frontend - Framework">Framework</option>
                    <option value="Frontend - Libraries">Libraries</option>
                  </optgroup>
                  <optgroup label="Backend">
                    <option value="Backend - Language">Language</option>
                    <option value="Backend - Database">Database</option>
                    <option value="Backend - API">API</option>
                  </optgroup>
                  <optgroup label="Legacy / Others">
                    <option value="Core">Core</option>
                    <option value="Framework">Framework</option>
                    <option value="Tools">Tools</option>
                    <option value="Others">Others</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-sm">{editingId ? "Simpan Perubahan" : "Simpan Skill"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : skills.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-text-muted mb-4">Belum ada skill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-border-hover transition-colors">
              <div>
                <h3 className="font-bold text-foreground">{s.name}</h3>
                <p className="text-xs text-text-muted">{s.category}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
