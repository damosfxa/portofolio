"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";

type GithubRepo = { id: number; name: string; full_name: string; description: string | null; html_url: string; homepage: string | null; topics?: string[] };

async function loadProjects() {
  const { data, error } = await supabase.from("projects").select("*").order("sort", { ascending: true }).order("id", { ascending: false });
  if (error) console.error("Gagal memuat project:", error.message);
  return (data ?? []) as Project[];
}

// Daftar repo publik untuk isi otomatis form (repo private tidak ikut).
async function loadGithubRepos() {
  try {
    const res = await fetch("https://api.github.com/users/damosfxa/repos?sort=updated&per_page=100");
    return res.ok ? ((await res.json()) as GithubRepo[]) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}
import { Edit2, Trash2, Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight, Lock } from "lucide-react";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ title: "", category: "Web App", description: "", tags: "", link: "", github: "", thumbnail: "", sort: 0, gallery: [] as string[], code_private: false });

  const fetchProjects = async () => setProjects(await loadProjects());

  useEffect(() => {
    let active = true;
    loadProjects().then((rows) => {
      if (!active) return;
      setProjects(rows);
      setLoading(false);
    });
    loadGithubRepos().then((repos) => {
      if (!active) return;
      setGithubRepos(repos);
      setLoadingRepos(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const t = e.target;
    const value = t instanceof HTMLInputElement && t.type === "checkbox" ? t.checked : t.value;
    setFormData(prev => ({ ...prev, [t.name]: value }));
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
      alert("Gagal upload gambar: " + error.message);
    } else {
      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, thumbnail: publicUrlData.publicUrl }));
    }
    setUploading(false);
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from("images").upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
  };

  // Galeri: bisa memilih banyak gambar sekaligus.
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadFile(f));
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
    } catch (err) {
      alert("Gagal upload gambar galeri: " + (err instanceof Error ? err.message : String(err)));
    }
    setUploadingGallery(false);
  };

  const moveGallery = (i: number, dir: -1 | 1) => {
    setFormData(prev => {
      const g = [...prev.gallery];
      const j = i + dir;
      if (j < 0 || j >= g.length) return prev;
      [g[i], g[j]] = [g[j], g[i]];
      return { ...prev, gallery: g };
    });
  };

  const removeGallery = (i: number) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, k) => k !== i) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return alert("Judul dan deskripsi wajib diisi");

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      sort: Number(formData.sort) || 0,
    };

    let errorObj = null;

    if (editingId) {
      const { error } = await supabase.from("projects").update(payload).eq("id", editingId);
      errorObj = error;
    } else {
      const { error } = await supabase.from("projects").insert([{ ...payload }]);
      errorObj = error;
    }
    
    if (errorObj) {
      const missing = /gallery|code_private/.test(errorObj.message);
      alert("Gagal menyimpan project: " + errorObj.message + (missing ? "\n\nKolom galeri belum ada di database. Jalankan SQL penambahan kolom di Supabase dulu." : ""));
      return;
    }
    
    setShowForm(false);
    fetchProjects();
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setFormData({
      title: p.title || "", category: p.category || "Web App", description: p.description || "",
      tags: p.tags ? p.tags.join(", ") : "", link: p.link || "", github: p.github || "", thumbnail: p.thumbnail || "", sort: p.sort || 0,
      gallery: p.gallery || [], code_private: !!p.code_private
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
            onClick={() => { setEditingId(null); setFormData({ title: "", category: "Web App", description: "", tags: "", link: "", github: "", thumbnail: "", sort: 0, gallery: [] as string[], code_private: false }); setShowForm(true); }}
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
                <label className="flex items-start gap-2 text-sm cursor-pointer mt-1">
                  <input type="checkbox" name="code_private" checked={formData.code_private} onChange={handleInputChange} className="mt-0.5" />
                  <span>
                    <span className="font-semibold inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Kode privat (milik klien)</span>
                    <span className="block text-xs text-text-muted">Link GitHub tetap tersimpan di sini, tapi di portofolio tombol &quot;Kode&quot; diganti label &quot;Kode privat · milik klien&quot;.</span>
                  </span>
                </label>
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Galeri isi aplikasi</label>
              <p className="text-xs text-text-muted">Screenshot halaman di dalam aplikasi (dashboard, form, laporan). Pengunjung bisa melihatnya tanpa login. Bisa pilih banyak gambar sekaligus, lalu atur urutannya dengan tombol panah.</p>
              <div className="flex flex-wrap gap-3">
                {formData.gallery.map((url, i) => (
                  <div key={url} className="relative w-36 rounded-lg border border-border overflow-hidden bg-background">
                    <img src={url} alt={`Galeri ${i + 1}`} className="w-36 h-24 object-cover" />
                    <div className="flex items-center justify-between px-1 py-1 text-xs">
                      <button type="button" onClick={() => moveGallery(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-surface-hover disabled:opacity-30" aria-label="Geser ke kiri"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-text-muted">{i + 1}</span>
                      <button type="button" onClick={() => moveGallery(i, 1)} disabled={i === formData.gallery.length - 1} className="p-1 rounded hover:bg-surface-hover disabled:opacity-30" aria-label="Geser ke kanan"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <button type="button" onClick={() => removeGallery(i)} className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600" aria-label="Hapus gambar"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <label className="cursor-pointer w-36 h-[124px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-lg hover:bg-surface-hover transition-colors text-sm font-semibold text-text-muted">
                  {uploadingGallery ? "Mengunggah..." : <><Plus className="w-5 h-5" /> Tambah gambar</>}
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploadingGallery} />
                </label>
              </div>
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
                  <p className="text-xs text-text-muted">{p.category} • Urutan: #{p.sort || '-'}{p.gallery?.length ? ` • ${p.gallery.length} gambar galeri` : ""}{p.code_private ? " • Kode privat" : ""}</p>
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
