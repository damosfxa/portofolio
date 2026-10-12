import { supabase } from "@/lib/supabase";

// Data khusus admin di tabel admin_settings (kunci → nilai JSON). Aturan RLS hanya mengizinkan
// akun admin membaca dan mengubahnya, jadi isinya tidak terlihat publik.

const SETUP_HINT = "\n\nTabel data admin belum dibuat. Jalankan SQL pembuatan tabel dan file isi-data-admin.sql (folder CODINGAN/bisnis) di Supabase dulu.";

export async function loadSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase.from("admin_settings").select("value").eq("key", key).maybeSingle();
  if (error) {
    alert(`Gagal memuat data "${key}": ${error.message}${/admin_settings/.test(error.message) ? SETUP_HINT : ""}`);
    return null;
  }
  return (data?.value ?? null) as T | null;
}

export async function saveSetting(key: string, value: unknown) {
  const { error } = await supabase.from("admin_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) alert(`Gagal menyimpan data "${key}": ${error.message}`);
  return !error;
}
