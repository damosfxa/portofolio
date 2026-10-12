// Tipe dan alat bantu kalkulator estimasi (Admin → Kalkulator).
// Isi datanya (tarif, fitur, jam, jenis project) tersimpan di database tabel admin_settings
// dengan akses khusus admin, jadi tidak terlihat di repo publik. Ubah datanya lewat Admin.

export type Level = "mudah" | "sedang" | "sulit";

export type Feature = {
  id: string;
  label: string;
  hours: number;
  level: Level;
  /** 1 = tahap "siap pakai", 2 = tahap lanjutan (boleh ditunda saat negosiasi). */
  phase: 1 | 2;
};

export type Module = { id: string; label: string; features: Feature[] };

export type StackItem = { part: string; choice: string; reason: string };

export type ProjectType = {
  id: string;
  label: string;
  defaults: string[];
  stack: StackItem[];
  /** Biaya yang dibayar klien sendiri, di luar jasa. */
  external: string[];
  questions: string[];
};

export type Settings = {
  /** Tarif per jam untuk harga bawah (batas aman) dan harga atas (harga yang ditawarkan). */
  rateLow: number;
  rateHigh: number;
  /** Cadangan waktu untuk hal tak terduga, dalam persen. */
  buffer: number;
  /** Jam kerja efektif per minggu. */
  hoursPerWeek: number;
  dpPercent: number;
  revisions: number;
  supportDays: number;
};

export type EstimatorData = { settings: Settings; modules: Module[]; projectTypes: ProjectType[] };

export const LEVEL_STYLE: Record<Level, string> = {
  mudah: "bg-emerald-500/15 text-emerald-600",
  sedang: "bg-amber-500/15 text-amber-600",
  sulit: "bg-red-500/15 text-red-600",
};

/** Bulatkan ke kelipatan Rp100.000. */
export const roundPrice = (n: number) => Math.round(n / 100000) * 100000;
export const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

/** Kunci sessionStorage untuk draf invoice yang dikirim dari penawaran ke halaman Invoice. */
export const INVOICE_DRAFT_KEY = "rr_invoice_draft";
