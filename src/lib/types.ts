export type Project = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  thumbnail: string | null;
  link: string | null;
  github: string | null;
  sort: number | null;
  /** Gambar tambahan isi aplikasi (diunggah lewat Admin). */
  gallery?: string[] | null;
  /** Repo tidak publik (misalnya milik klien): tombol kode diganti label "Kode privat". */
  code_private?: boolean | null;
};

export type Skill = {
  id: number;
  name: string;
  category: string | null;
  sort: number | null;
};

export type Certificate = {
  id: number;
  title: string;
  image: string | null;
  sort: number | null;
};

export type TimelineItem = {
  id: number;
  year: string | null;
  title: string;
  description: string | null;
  sort: number | null;
};

export type TestimonialItem = {
  id: number;
  /** Kutipan dalam bahasa Indonesia; versi Inggris opsional (kosong = pakai versi Indonesia). */
  quote: string;
  quote_en: string | null;
  name: string;
  role: string | null;
  role_en: string | null;
  link: string | null;
  sort: number | null;
};

export type InvoiceItem = { desc: string; qty: number; price: number };

export type Invoice = {
  id: number;
  /** Contoh: INV/2026/10/001 */
  number: string;
  client: string;
  project: string | null;
  kind: "dp" | "pelunasan" | "lainnya";
  items: InvoiceItem[];
  discount: number;
  issued_at: string;
  due_at: string | null;
  status: "belum" | "lunas";
  paid_at: string | null;
  notes: string | null;
};
