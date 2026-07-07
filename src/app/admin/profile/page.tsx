"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProfile() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "about">("home");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profile").select("*").limit(1).single();
    if (!error && data) setProfile(data);
    setLoading(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    if (profile.id) {
      await supabase.from("profile").update(profile).eq("id", profile.id);
    } else {
      await supabase.from("profile").insert([profile]);
    }
    
    setSaving(false);
    alert("Profil berhasil disimpan!");
    fetchProfile();
  };

  if (loading) return <div className="flex justify-center p-24"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Profile Settings</h1>
        <p className="text-text-muted">Kelola konten untuk halaman utama portofoliomu.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Tabs Header */}
        <div className="flex border-b border-border bg-background/50">
          <button 
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "home" ? "text-primary border-b-2 border-primary bg-surface" : "text-text-muted hover:text-foreground hover:bg-surface-hover"}`}
          >
            🏠 Home (Hero Section)
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "about" ? "text-primary border-b-2 border-primary bg-surface" : "text-text-muted hover:text-foreground hover:bg-surface-hover"}`}
          >
            📖 About (Tentang Saya)
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {activeTab === "home" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Nama Lengkap</label>
                  <input name="name" value={profile.name || ""} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Rizky Rhamadani" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Tagline / Profesi (ID)</label>
                    <input name="tagline" value={profile.tagline || ""} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Pengembang Fullstack" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Tagline / Profession (EN)</label>
                    <input name="tagline_en" value={profile.tagline_en || ""} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Fullstack Developer" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Headline (Teks Besar di Home) - ID</label>
                  <textarea name="headline" value={profile.headline || ""} onChange={handleInputChange} rows={2} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Merancang Ekosistem Digital..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Headline (Large Text on Home) - EN</label>
                  <textarea name="headline_en" value={profile.headline_en || ""} onChange={handleInputChange} rows={2} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Crafting Elite Digital Experiences That Drive Growth." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">GitHub URL</label>
                    <input type="url" name="github" value={profile.github || ""} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="https://github.com/..." />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Email</label>
                    <input type="email" name="email" value={profile.email || ""} onChange={handleInputChange} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="nama@email.com" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Bio Singkat (ID)</label>
                  <textarea name="bio" value={profile.bio || ""} onChange={handleInputChange} rows={5} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Ceritakan tentang diri Anda dalam Bahasa Indonesia..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Short Bio (EN)</label>
                  <textarea name="bio_en" value={profile.bio_en || ""} onChange={handleInputChange} rows={5} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Tell about yourself in English..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Visi / Pendekatan Kerja (ID)</label>
                  <textarea name="vision" value={profile.vision || ""} onChange={handleInputChange} rows={3} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Filosofi kerja atau pendekatan profesional Anda (ID)..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Vision / Approach (EN)</label>
                  <textarea name="vision_en" value={profile.vision_en || ""} onChange={handleInputChange} rows={3} className="bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Your work philosophy or professional approach (EN)..." />
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-4 pt-6 border-t border-border">
              <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-sm disabled:opacity-50 transition-all">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
