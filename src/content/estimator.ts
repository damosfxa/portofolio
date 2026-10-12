// Data kalkulator estimasi project (Admin → Kalkulator).
// Jam per fitur adalah perkiraan pengerjaan satu orang; ubah angkanya di sini setelah beberapa project
// supaya makin sesuai dengan kecepatan kerjamu sendiri.

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

const f = (id: string, label: string, hours: number, level: Level, phase: 1 | 2 = 1): Feature => ({ id, label, hours, level, phase });

export const MODULES: Module[] = [
  {
    id: "fondasi",
    label: "Fondasi",
    features: [
      f("setup", "Setup project, database, dan hosting", 6, "mudah"),
      f("design_custom", "Desain UI custom (bukan template), mobile-first", 35, "sedang"),
      f("design_template", "Desain berbasis template yang disesuaikan", 10, "mudah"),
      f("security", "Keamanan data dan login (RLS, validasi)", 10, "sulit"),
      f("perf", "Optimasi kecepatan dan gambar", 6, "sedang"),
      f("a11y", "Aksesibilitas dan halaman error yang rapi", 6, "mudah"),
      f("multilang", "Dua bahasa (Indonesia dan Inggris)", 10, "sedang", 2),
      f("qa", "Testing, deploy, dan pelatihan admin", 14, "sedang"),
    ],
  },
  {
    id: "konten",
    label: "Halaman & konten",
    features: [
      f("home_sections", "Homepage beberapa section (hero, unggulan, promo, CTA)", 16, "sedang"),
      f("landing_single", "Landing page satu halaman", 10, "mudah"),
      f("pages_static", "Halaman statis (tentang, FAQ, kebijakan)", 6, "mudah"),
      f("contact_form", "Form kontak ke email", 3, "mudah"),
      f("testimonials", "Bagian testimoni pelanggan", 3, "mudah"),
      f("gallery", "Galeri foto atau portofolio", 4, "mudah"),
      f("blog", "Blog atau artikel dengan editor", 12, "sedang", 2),
      f("maps", "Lokasi dengan Google Maps", 3, "mudah"),
      f("animation", "Animasi halus", 6, "sedang"),
    ],
  },
  {
    id: "katalog",
    label: "Katalog produk",
    features: [
      f("catalog_grid", "Grid produk (foto, harga, rating)", 6, "mudah"),
      f("catalog_filter", "Filter berlapis (kategori, harga, jenis, manfaat)", 10, "sedang"),
      f("catalog_sort", "Urutkan (harga, populer, terbaru)", 3, "mudah"),
      f("search_basic", "Pencarian produk", 4, "mudah"),
      f("search_autocomplete", "Saran otomatis saat mengetik (autocomplete)", 6, "sedang", 2),
      f("badges", "Badge best seller, baru, dan diskon", 2, "mudah"),
      f("product_detail", "Detail produk (galeri, deskripsi, kandungan, cara pakai)", 10, "mudah"),
      f("variants", "Varian produk dengan stok masing-masing", 10, "sulit"),
      f("reviews", "Rating dan ulasan pembeli", 10, "sedang", 2),
      f("related", "Produk terkait", 3, "mudah"),
    ],
  },
  {
    id: "transaksi",
    label: "Keranjang & pembayaran",
    features: [
      f("cart", "Keranjang tersimpan (ubah jumlah, hapus)", 10, "sedang"),
      f("checkout", "Checkout dan form alamat", 8, "sedang"),
      f("payment", "Payment gateway (QRIS, VA, e-wallet) dengan notifikasi otomatis", 20, "sulit"),
      f("shipping", "Ongkir otomatis berbagai kurir", 12, "sulit"),
      f("order_confirm", "Halaman konfirmasi dan email pesanan", 6, "sedang"),
      f("voucher", "Kode voucher dan diskon", 8, "sedang", 2),
    ],
  },
  {
    id: "akun",
    label: "Akun pelanggan",
    features: [
      f("auth", "Daftar dan login", 8, "sedang"),
      f("profile", "Profil dan alamat tersimpan", 8, "mudah"),
      f("order_history", "Riwayat dan status pesanan", 8, "sedang"),
      f("wishlist", "Wishlist", 6, "mudah", 2),
      f("tracking", "Lacak resi pengiriman", 8, "sedang", 2),
    ],
  },
  {
    id: "admin",
    label: "Dashboard admin",
    features: [
      f("admin_products", "Kelola produk, kategori, dan varian", 24, "sedang"),
      f("admin_stock", "Manajemen stok", 10, "sedang"),
      f("admin_orders", "Kelola pesanan dan status pengiriman", 16, "sedang"),
      f("admin_customers", "Data pelanggan", 6, "mudah"),
      f("admin_content", "Kelola isi website (teks, gambar) tanpa coding", 10, "sedang"),
      f("admin_vouchers", "Kelola voucher dan promo", 8, "mudah", 2),
      f("admin_reviews", "Moderasi ulasan", 6, "mudah", 2),
      f("admin_reports", "Laporan penjualan dan produk terlaris", 14, "sulit", 2),
      f("roles", "Beberapa admin dengan hak akses berbeda", 10, "sedang", 2),
      f("export_excel", "Ekspor data ke Excel", 5, "mudah", 2),
    ],
  },
  {
    id: "operasional",
    label: "Sistem stok & operasional",
    features: [
      f("inv_master", "Data barang dan kategori", 10, "mudah"),
      f("inv_ledger", "Barang masuk dan keluar tercatat (ledger)", 16, "sedang"),
      f("inv_opname", "Stok opname dan koreksi otomatis", 12, "sedang"),
      f("inv_batch", "Batch dan tanggal kedaluwarsa (FEFO)", 14, "sulit"),
      f("inv_warehouse", "Beberapa gudang atau cabang", 16, "sulit", 2),
      f("inv_qr", "Label QR atau barcode", 10, "sedang", 2),
      f("inv_report", "Laporan stok", 10, "sedang"),
      f("audit_log", "Riwayat perubahan data (audit log)", 8, "sedang", 2),
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard & CRM",
    features: [
      f("dash_charts", "Grafik dan ringkasan angka", 10, "sedang"),
      f("crm_clients", "Data klien atau pelanggan (CRM)", 12, "mudah"),
      f("targets", "Target dan progres", 6, "mudah"),
      f("notif_email", "Notifikasi email otomatis", 8, "sedang", 2),
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    features: [
      f("whatsapp", "Tombol chat WhatsApp", 2, "mudah"),
      f("seo", "SEO: metadata, sitemap, halaman ramah Google", 8, "sedang"),
      f("analytics", "Google Analytics dan Meta Pixel (event belanja)", 8, "sedang"),
      f("newsletter", "Newsletter dan pengumpulan email", 6, "mudah", 2),
    ],
  },
];

export const FEATURES: Record<string, Feature> = Object.fromEntries(MODULES.flatMap((m) => m.features.map((x) => [x.id, x])));

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

const BASE = ["setup", "security", "perf", "a11y", "qa"];
const STACK_WEB: StackItem[] = [
  { part: "Website", choice: "Next.js + Tailwind CSS", reason: "Cepat dibuka di HP, ramah SEO Google, gambar otomatis dioptimasi" },
  { part: "Database, login, dan file", choice: "Supabase (PostgreSQL)", reason: "Database andal dan aman, data dilindungi aturan akses per pengguna" },
  { part: "Hosting", choice: "Vercel", reason: "Website cepat di seluruh Indonesia dan stabil saat ramai" },
];
const EXT_BASE = ["Domain (±Rp150–250 ribu per tahun)", "Hosting Vercel paket Pro untuk website komersial (±US$20 per bulan)"];
const Q_BASE = ["Deadline website harus online?", "Kira-kira budget yang disiapkan berapa?", "Siapa yang menyiapkan teks dan foto?", "Sudah punya logo dan warna brand?", "Perlu bantuan perawatan setelah website online?"];

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: "ecommerce",
    label: "Toko online (e-commerce)",
    defaults: [
      ...BASE, "design_custom", "home_sections", "pages_static", "testimonials", "animation",
      "catalog_grid", "catalog_filter", "catalog_sort", "search_basic", "search_autocomplete", "badges", "product_detail", "variants", "reviews", "related",
      "cart", "checkout", "payment", "shipping", "order_confirm", "voucher",
      "auth", "profile", "order_history", "wishlist", "tracking",
      "admin_products", "admin_stock", "admin_orders", "admin_customers", "admin_vouchers", "admin_reviews", "admin_reports",
      "whatsapp", "seo", "analytics", "newsletter",
    ],
    stack: [
      ...STACK_WEB,
      { part: "Pembayaran", choice: "Midtrans atau Xendit", reason: "QRIS, transfer bank (VA), e-wallet, dan kartu kredit dalam satu tempat" },
      { part: "Ongkir dan resi", choice: "Biteship atau RajaOngkir", reason: "Ongkir dan pelacakan resi otomatis dari banyak kurir" },
      { part: "Email", choice: "Resend", reason: "Email konfirmasi pesanan dan newsletter terkirim otomatis" },
    ],
    external: [...EXT_BASE, "Supabase paket Pro (±US$25 per bulan)", "Potongan payment gateway per transaksi (misalnya QRIS ±0,7%)", "Layanan API ongkir dan resi", "Layanan email (gratis sampai batas tertentu)"],
    questions: ["Berapa jumlah produk dan variannya?", "Metode pembayaran dan kurir apa yang diinginkan?", "Stok dari satu gudang atau lebih?", "Perlu program poin atau membership?", ...Q_BASE],
  },
  {
    id: "company",
    label: "Website company profile",
    defaults: [...BASE, "design_custom", "home_sections", "pages_static", "contact_form", "testimonials", "gallery", "maps", "animation", "admin_content", "whatsapp", "seo", "analytics"],
    stack: STACK_WEB,
    external: EXT_BASE,
    questions: ["Berapa halaman yang dibutuhkan?", "Perlu blog atau artikel?", "Perlu dua bahasa?", ...Q_BASE],
  },
  {
    id: "landing",
    label: "Landing page",
    defaults: ["setup", "perf", "qa", "design_custom", "landing_single", "testimonials", "contact_form", "animation", "whatsapp", "seo", "analytics"],
    stack: [STACK_WEB[0], STACK_WEB[2]],
    external: EXT_BASE,
    questions: ["Produk atau layanan apa yang dipromosikan?", "Pengunjung diarahkan ke mana (WhatsApp, form, toko)?", "Akan dipakai untuk iklan berbayar?", ...Q_BASE],
  },
  {
    id: "inventory",
    label: "Sistem stok / inventaris",
    defaults: [...BASE, "design_template", "auth", "inv_master", "inv_ledger", "inv_opname", "inv_batch", "inv_report", "roles", "export_excel", "audit_log"],
    stack: [
      ...STACK_WEB,
      { part: "Alternatif", choice: "Laravel + MySQL", reason: "Bisa dipakai bila server atau tim IT klien sudah memakai PHP" },
    ],
    external: [...EXT_BASE, "Supabase paket Pro (±US$25 per bulan)"],
    questions: ["Berapa jumlah barang dan transaksi per hari?", "Ada beberapa gudang atau cabang?", "Barang punya tanggal kedaluwarsa?", "Siapa saja yang memakai sistem, dan hak aksesnya?", "Data lama di Excel perlu dipindahkan?", ...Q_BASE],
  },
  {
    id: "dashboard",
    label: "Dashboard / CRM",
    defaults: [...BASE, "design_template", "auth", "crm_clients", "dash_charts", "targets", "export_excel", "roles", "notif_email"],
    stack: [
      ...STACK_WEB,
      { part: "Grafik", choice: "Recharts", reason: "Grafik interaktif yang ringan dan jelas" },
    ],
    external: [...EXT_BASE, "Supabase paket Pro (±US$25 per bulan)"],
    questions: ["Data apa saja yang ingin dipantau?", "Data diambil dari mana (input manual, Excel, aplikasi lain)?", "Berapa orang yang akan memakai?", ...Q_BASE],
  },
  {
    id: "custom",
    label: "Lainnya (pilih manual)",
    defaults: [...BASE],
    stack: STACK_WEB,
    external: EXT_BASE,
    questions: Q_BASE,
  },
];

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

export const DEFAULT_SETTINGS: Settings = { rateLow: 50000, rateHigh: 80000, buffer: 20, hoursPerWeek: 30, dpPercent: 50, revisions: 2, supportDays: 30 };

export const LEVEL_STYLE: Record<Level, string> = {
  mudah: "bg-emerald-500/15 text-emerald-600",
  sedang: "bg-amber-500/15 text-amber-600",
  sulit: "bg-red-500/15 text-red-600",
};

/** Bulatkan ke kelipatan Rp100.000. */
export const roundPrice = (n: number) => Math.round(n / 100000) * 100000;
export const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
