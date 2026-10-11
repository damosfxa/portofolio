import type { Line } from "@/components/game/scene";

// Isi bagian "Cara kerja sama" dan testimoni di ruangan Kontak.
// Ubah teksnya di sini; tampilannya ada di components/contact-section.tsx.

const L = (id: string, en: string): Line => ({ id, en });

/** Langkah kerja sama dengan klien, dari kontak pertama sampai serah terima. */
export const WORKFLOW: { title: Line; desc: Line }[] = [
  {
    title: L("Konsultasi", "Consultation"),
    desc: L("Ceritakan kebutuhanmu lewat chat atau call. Gratis, tanpa komitmen.", "Tell me what you need over chat or a call. Free, no commitment."),
  },
  {
    title: L("Penawaran", "Proposal"),
    desc: L("Kamu dapat rincian fitur, biaya, dan jadwal tertulis sebelum mulai.", "You get the features, cost, and schedule in writing before we start."),
  },
  {
    title: L("Pengerjaan", "Build"),
    desc: L("Setelah sepakat, aplikasi langsung dikerjakan.", "Once we agree, the work starts right away."),
  },
  {
    title: L("Update rutin", "Weekly updates"),
    desc: L("Lihat progres dan coba demonya setiap minggu.", "See the progress and try the demo every week."),
  },
  {
    title: L("Revisi", "Revisions"),
    desc: L("Masukanmu diperbaiki sampai sesuai kebutuhan.", "Your feedback is applied until it fits your needs."),
  },
  {
    title: L("Serah terima", "Handover"),
    desc: L("Aplikasi online, kode diserahkan, dan dibantu 30 hari setelahnya.", "The app goes live, you get the code, plus 30 days of support."),
  },
];

export type Testimonial = {
  quote: Line;
  name: string;
  /** Peran atau usaha, misalnya "Pemilik toko kue". */
  role: Line;
  /** Opsional: tautan ke situs/usaha atau profil LinkedIn pemberi testimoni. */
  link?: string;
};

/**
 * Testimoni asli dari klien atau rekan. Selama kosong, bagian testimoni tidak ditampilkan.
 * Contoh format (hapus tanda komentar dan ganti isinya):
 *
 *   {
 *     quote: L("Sistem stoknya bikin selisih barang langsung ketahuan.", "The stock system makes discrepancies obvious right away."),
 *     name: "Nama Klien",
 *     role: L("Pemilik toko online", "Online shop owner"),
 *     link: "https://contoh.com",
 *   },
 */
export const TESTIMONIALS: Testimonial[] = [];
