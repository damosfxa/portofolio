// Template balasan chat untuk klien (Admin → Template Chat). Ganti bagian [dalam kurung] sebelum dikirim.

export type Reply = { id: string; group: string; title: string; text: string; note?: string };

export const REPLY_RULES = [
  "Jangan menyebut harga sebelum tahu kebutuhannya.",
  "Jangan langsung setuju di chat. Hitung dulu di Kalkulator, baru kirim angka.",
  "Kalau klien minta turun harga: kurangi fitur atau bagi tahap, bukan memotong tarif.",
  "Semua kesepakatan (fitur, harga, jadwal, revisi) harus tertulis di penawaran.",
  "Jangan mulai kerja sebelum DP masuk.",
];

export const REPLIES: Reply[] = [
  {
    id: "harga-awal", group: "Awal", title: "Ditanya harga, tapi belum ada detail",
    text: `Halo Kak, terima kasih sudah menghubungi 🙏
Harganya tergantung fitur yang dibutuhkan, Kak. Website sederhana dan toko online dengan pembayaran otomatis tentu beda jauh.

Boleh ceritakan sedikit?
1. Usahanya bergerak di bidang apa?
2. Website-nya untuk apa (profil usaha, jualan online, sistem internal)?
3. Fitur apa saja yang dibutuhkan?
4. Kira-kira kapan harus jadi?

Setelah itu saya kirim rincian harga dan jadwalnya. Konsultasinya gratis ya, Kak.`,
  },
  {
    id: "terima-brief", group: "Awal", title: "Setelah menerima brief",
    text: `Terima kasih briefnya lengkap sekali, Kak 🙏 Saya pelajari dan hitung dulu ya, nanti saya kirim penawaran tertulis berisi rincian fitur, harga, dan jadwal.

Sambil itu, boleh saya tanya beberapa hal supaya hitungannya tepat?
[salin 3 sampai 5 pertanyaan dari "Tanyakan ke klien dulu" di Kalkulator]`,
  },
  {
    id: "kirim-penawaran", group: "Awal", title: "Mengirim penawaran",
    text: `Halo Kak, ini penawarannya untuk [nama project] (PDF terlampir).

Ringkasnya:
• Tahap 1 (siap pakai): [harga], sekitar [x] minggu
• Tahap 2 (lanjutan, opsional): [harga], sekitar [x] minggu

Tahap 1 sudah cukup untuk [mulai jualan / mulai dipakai]. Tahap 2 bisa dilanjutkan kapan saja.
Kalau ada fitur yang mau disesuaikan atau budgetnya perlu diatur, kabari saja, Kak, nanti saya sesuaikan.`,
    note: "Kalau tidak dibagi tahap, ganti dua baris tahap dengan: Total [harga], sekitar [x] minggu.",
  },
  {
    id: "mahal", group: "Negosiasi", title: "\"Kok mahal?\"",
    text: `Saya paham, Kak 🙏 Harganya dihitung dari jumlah fitur dan waktu pengerjaan. Yang paling banyak makan waktu itu [contoh: pembayaran otomatis, ongkir otomatis, dan dashboard admin], karena harus tersambung ke layanan luar dan diuji supaya aman.

Supaya lebih pas dengan budget, ada dua pilihan:
1. Mulai dari tahap 1 dulu ([harga tahap 1]), fitur lain menyusul.
2. Beberapa fitur saya tunda atau sederhanakan, misalnya [fitur].

Kira-kira budget yang disiapkan berapa, Kak? Nanti saya susunkan fitur yang paling penting dengan budget itu.`,
    note: "Bagian tersulit bisa dilihat di Kalkulator.",
  },
  {
    id: "kurang", group: "Negosiasi", title: "\"Bisa kurang?\" (kurangi fitur)",
    text: `Bisa saya bantu sesuaikan, Kak. Biar kualitasnya tetap terjaga, yang saya kurangi lingkup fiturnya, bukan pengerjaannya. Misalnya [fitur] ditunda dulu, harganya jadi [harga baru].`,
    note: "Jangan pernah turun di bawah Harga bawah di Kalkulator.",
  },
  {
    id: "potongan-lunas", group: "Negosiasi", title: "Potongan kecil dengan syarat lunas di awal",
    text: `Kalau pembayaran bisa langsung lunas di awal, saya bisa kasih potongan [5%] jadi [harga].`,
  },
  {
    id: "potongan-portofolio", group: "Negosiasi", title: "Potongan kecil dengan syarat portofolio dan testimoni",
    text: `Saya bisa kasih potongan [5%] kalau project ini boleh saya tampilkan di portofolio dan Kakak bersedia memberi testimoni setelah selesai.`,
  },
  {
    id: "budget-kecil", group: "Negosiasi", title: "Budget jauh di bawah",
    text: `Terima kasih sudah terbuka soal budgetnya, Kak 🙏 Jujur, dengan budget [budget] fitur yang Kakak butuhkan belum bisa saya kerjakan dengan baik.

Ada beberapa pilihan yang lebih cocok:
• [Untuk toko online] Mulai dengan Shopify atau marketplace dulu. Biaya awalnya jauh lebih murah, dan saya bisa bantu setup tampilannya.
• [Untuk website] Mulai dari landing page satu halaman ([harga]), lalu dikembangkan saat usaha makin besar.

Kalau nanti budgetnya sudah siap, saya senang sekali membantu, Kak.`,
  },
  {
    id: "lama", group: "Pertanyaan umum", title: "\"Berapa lama?\"",
    text: `Untuk fitur yang Kakak butuhkan, sekitar [x–y] minggu, Kak. Setiap minggu saya kirim update dan link demo, jadi Kakak bisa lihat dan coba progresnya langsung, tidak menunggu sampai jadi.`,
  },
  {
    id: "revisi", group: "Pertanyaan umum", title: "\"Bisa revisi?\"",
    text: `Bisa, Kak. Sudah termasuk [2] kali revisi untuk fitur yang disepakati, misalnya warna, tata letak, atau teks. Karena ada demo tiap minggu, biasanya masukan sudah tertampung sejak awal.
Kalau ada fitur baru di luar daftar, nanti saya hitungkan terpisah dan saya kabari dulu sebelum dikerjakan.`,
  },
  {
    id: "garansi", group: "Pertanyaan umum", title: "\"Ada garansi?\" / \"Kalau error setelah jadi?\"",
    text: `Ada, Kak. Setelah website online, saya bantu perbaikan bug gratis selama [30] hari. Setelah itu, kalau butuh perawatan atau penambahan fitur, bisa lanjut dengan biaya bulanan atau per pekerjaan.`,
  },
  {
    id: "teknologi", group: "Pertanyaan umum", title: "\"Pakai teknologi apa?\"",
    text: `Saya pakai [Next.js] untuk website-nya, supaya cepat dibuka di HP dan bagus untuk Google. Database-nya [Supabase], yang aman dan andal. [Pembayaran lewat Midtrans/Xendit, bisa QRIS, transfer bank, dan e-wallet.]
Semuanya teknologi yang dipakai perusahaan besar juga, jadi website Kakak siap berkembang.`,
    note: "Detail dan alasannya ada di Kalkulator, bagian Tech stack.",
  },
  {
    id: "contoh", group: "Pertanyaan umum", title: "\"Ada contoh hasil kerjanya?\"",
    text: `Ada, Kak. Portofolio saya di rizkyrhamadani.com, dan versi ringkasnya di rizkyrhamadani.com/ringkas.
Salah satu project saya sistem stok untuk brand skincare yang menang bounty VibeDev. Gambar isi aplikasinya bisa dilihat di bagian Proyek.`,
  },
  {
    id: "followup-1", group: "Menunggu jawaban", title: "Klien menghilang: follow up hari ke-3",
    text: `Halo Kak, mau tanya kabar penawaran [nama project] yang saya kirim kemarin 🙏 Kalau ada bagian yang kurang jelas atau mau disesuaikan, saya siap bantu.`,
  },
  {
    id: "followup-2", group: "Menunggu jawaban", title: "Klien menghilang: follow up terakhir hari ke-7",
    text: `Halo Kak, saya follow up sekali lagi ya. Kalau rencananya ditunda dulu, tidak apa-apa. Kapan pun Kakak siap, kabari saja. Semoga usahanya lancar 🙏`,
    note: "Setelah ini, berhenti follow up.",
  },
  {
    id: "setuju", group: "Deal", title: "Klien setuju",
    text: `Terima kasih, Kak, senang bisa bantu 🙏

Saya rangkum dulu supaya kita sepakat:
• Lingkup: sesuai penawaran [nomor] ([tahap 1 / semua tahap])
• Biaya: [harga], DP [50%] = [nominal] sebelum mulai, sisanya saat serah terima
• Jadwal: mulai [tanggal], perkiraan selesai [tanggal]
• Revisi: [2] kali, dukungan bug [30] hari setelah online

Invoice DP saya lampirkan ya, Kak. Setelah DP masuk, saya kirim jadwal kerja dan mulai dikerjakan. Sambil itu, mohon disiapkan [logo, foto produk, dan teks].`,
    note: "Buat invoice DP lewat tombol \"Buat invoice DP\" di penawaran Kalkulator, atau di menu Invoice.",
  },
  {
    id: "fitur-tambahan", group: "Deal", title: "Minta fitur tambahan di tengah jalan",
    text: `Boleh, Kak, idenya bagus 👍 Fitur ini di luar lingkup awal, jadi saya hitungkan dulu ya: perkiraan [x] hari kerja dengan biaya [harga].
Mau dimasukkan sekarang (jadwal mundur [x] hari), atau dikerjakan setelah yang utama selesai?`,
  },
  {
    id: "tanpa-dp", group: "Deal", title: "Minta mulai tanpa DP",
    text: `Saya paham, Kak 🙏 DP ini untuk mengunci jadwal saya khusus untuk project Kakak, dan berlaku sama untuk semua klien. Sebagai gantinya, Kakak bisa lihat progres dan coba demo setiap minggu, jadi pekerjaannya selalu terlihat jelas.`,
  },
  {
    id: "pelunasan", group: "Selesai", title: "Menagih pelunasan",
    text: `Halo Kak, [nama project] sudah selesai dan sudah online di [link] 🎉
Sesuai kesepakatan, invoice pelunasan sebesar [nominal] saya lampirkan. Setelah pembayaran masuk, saya serahkan semua akses dan kode, dan dukungan bug [30] hari mulai berjalan.
Terima kasih banyak atas kepercayaannya, Kak.`,
  },
  {
    id: "ingatkan-bayar", group: "Selesai", title: "Mengingatkan pelunasan (3 hari kemudian)",
    text: `Halo Kak, mengingatkan pelunasan [nama project] sebesar [nominal] ya 🙏 Kalau sudah ditransfer, boleh kirim buktinya supaya saya catat.`,
  },
  {
    id: "testimoni", group: "Selesai", title: "Minta testimoni dan rekomendasi",
    text: `Halo Kak, semoga websitenya lancar dipakai 🙏
Boleh minta 1–2 kalimat pendapat Kakak tentang kerja sama kita? Rencananya saya tampilkan di portofolio (nama boleh anonim kalau lebih nyaman).
Dan kalau ada teman atau kenalan yang butuh website, saya senang sekali kalau direkomendasikan 😊`,
    note: "Testimoni yang masuk diisi lewat Admin → Testimoni, persis seperti yang dikirim klien.",
  },
];

export const REPLY_GROUPS = [...new Set(REPLIES.map((r) => r.group))];
