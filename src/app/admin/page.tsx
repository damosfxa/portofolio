"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2, Plus, X, Image as ImageIcon } from "lucide-react";

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "", category: "Web App", description: "", tags: "", link: "", github: "", thumbnail: "", sort: 0
  });

  useEffect(() => {
    fetchProjects();
    fetchGithubRepos();
  }, []);

  const fetchGithubRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch("https://api.github.com/users/damosfxa/repos?sort=updated&per_page=100");
      if (res.ok) {
        const data = await res.json();
        setGithubRepos(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingRepos(false);
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("sort", { ascending: true }).order("id", { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRepoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repoName = e.target.value;
    if (!repoName) return;
    
    const repo = githubRepos.find(r => r.name === repoName);
    if (repo) {
      setFormData(prev => ({
        ...prev,
        title: repo.name || prev.title,
        description: repo.description || prev.description,
        github: repo.html_url || prev.github,
        link: repo.homepage || prev.link,
        tags: repo.topics && repo.topics.length > 0 ? repo.topics.join(", ") : prev.tags
      }));
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
      alert("Gagal upload gambar (pastikan kamu sudah membuat bucket 'images' di menu Storage Supabase, dan mengubah policynya jadi public).");
    } else {
      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, thumbnail: publicUrlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return alert("Judul dan deskripsi wajib diisi");

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      sort: parseInt(formData.sort as any) || 0,
    };

    if (editingId) {
      await supabase.from("projects").update(payload).eq("id", editingId);
    } else {
      await supabase.from("projects").insert([{ ...payload }]);
    }
    
    setShowForm(false);
    fetchProjects();
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      title: p.title || "", category: p.category || "Web App", description: p.description || "",
      tags: p.tags ? p.tags.join(", ") : "", link: p.link || "", github: p.github || "", thumbnail: p.thumbnail || "", sort: p.sort || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus project ini?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Projects</h1>
          <p className="text-text-muted">Kelola semua project yang tampil di portofolio.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ title: "", category: "Web App", description: "", tags: "", link: "", github: "", thumbnail: "", sort: 0 }); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Project" : "Tambah Project Baru"}</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 p-4 bg-surface-subtle border border-border rounded-xl">
              <label className="text-sm font-semibold flex justify-between items-center">
                <span>⚡ Auto-fill dari GitHub</span>
                {loadingRepos && <span className="text-xs text-blue-500 animate-pulse">Loading repos...</span>}
              </label>
              <select onChange={handleRepoSelect} defaultValue="" className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                <option value="" disabled>- select a public repo -</option>
                {githubRepos.map(repo => (
                  <option key={repo.id} value={repo.name}>{repo.full_name}</option>
                ))}
              </select>
              <p className="text-xs text-text-muted">Pilih repository untuk mengisi Judul, Deskripsi, Link, dan Tags otomatis.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Judul Project *</label>
                <input name="title" value={formData.title} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Nama project..." required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Kategori *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm">
                  <option value="Web App">Web App</option>
                  <option value="UI Design">UI Design</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Deskripsi *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Ceritakan tentang project ini..." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Tags (pisahkan dengan koma)</label>
                <input name="tags" value={formData.tags} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="React, Tailwind, Supabase" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Urutan (Sort)</label>
                <input type="number" name="sort" value={formData.sort} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="1" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Link Live Project</label>
                <input type="url" name="link" value={formData.link} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Link Github</label>
                <input type="url" name="github" value={formData.github} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Thumbnail URL (atau Upload)</label>
              <div className="flex gap-3">
                <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleInputChange} className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
                <label className="cursor-pointer flex items-center justify-center gap-2 bg-surface-subtle border border-border px-4 py-2.5 rounded-xl hover:bg-surface-hover transition-colors text-sm font-semibold">
                  {uploading ? "Loading..." : <><ImageIcon className="w-4 h-4" /> Upload</>}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {formData.thumbnail && <img src={formData.thumbnail} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded-lg border border-border" />}
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-hover">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-sm">{editingId ? "Simpan Perubahan" : "Simpan Project"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-text-muted mb-4">Belum ada project.</p>
          <button onClick={() => setShowForm(true)} className="text-primary font-semibold text-sm hover:underline">+ Tambah Project Pertama</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-border-hover transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-background rounded-lg border border-border overflow-hidden shrink-0">
                  {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">No Img</div>}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{p.title}</h3>
                  <p className="text-xs text-text-muted">{p.category} • Urutan: #{p.sort || '-'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
