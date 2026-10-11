// Data identitas yang dipakai di halaman utama.
// Setiap nilai di sini sengaja hanya ditampilkan di satu tempat.
export const site = {
  name: "Rizky Rhamadani",
  initials: "RR",
  email: "ryzkirham@gmail.com",
  github: "https://github.com/damosfxa",
  linkedin: "https://www.linkedin.com/in/rizky-rhamadani-/",
  // CV per bahasa (file di folder public). Versi ini tanpa nomor HP karena bisa diunduh siapa saja;
  // versi lengkap untuk melamar ada di docs/cv-pribadi (tidak ikut di-commit).
  // Bila null, tombol CV tidak ditampilkan.
  cv: {
    id: "/assets/cv/cv-rizky-rhamadani-id.pdf",
    en: "/assets/cv/cv-rizky-rhamadani-en.pdf",
  } as Record<"id" | "en", string> | null,
  // Foto profil untuk hero, misalnya "/assets/images/profile.jpg". Null = tanpa foto.
  photo: null as string | null,
};

// Thumbnail cadangan untuk proyek yang kolom thumbnail-nya kosong di admin.
// Kunci = URL demo proyek. Gambar diambil dari demo live masing-masing.
export const fallbackThumbnails: Record<string, string> = {
  "https://celo-skincare.vercel.app": "/assets/images/projects/celo-skincare.jpg",
};
