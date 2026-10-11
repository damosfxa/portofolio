# Analisa Update Portofolio

Konsep: **rumah pixel lo-fi yang hidup**. Setiap bagian portofolio adalah ruangan sendiri,
dihuni karakter yang bergerak dan mengobrol sendiri tanpa perlu dikendalikan pengunjung.

## 1. Masalah versi sebelumnya

| Area | Masalah |
|---|---|
| Interaksi | Karakter harus dikendalikan dengan keyboard; tidak terasa hidup dengan sendirinya. |
| Hero | Isinya mengarah ke proyek (stok, keuangan), bukan ke diri pemilik. |
| Font | Press Start 2P melelahkan mata untuk dibaca. |
| Performa | Setiap sprite digambar sebagai ratusan elemen SVG (9.000+ elemen DOM). |

## 2. Ruangan

| Ruangan | Isi | Penghuni dan kegiatan |
|---|---|---|
| Ruang tamu (hero) | Tentang saya: perkenalan, jasa, status, tombol | Dina dan Bayu membaca, main HP, buka kulkas lalu makan, main game di TV (kadang berantem lalu baikan), keluar masuk pintu, mengobrol soal jasa dan bisnis. Pemilik masuk lewat pintu dan kadang duduk di depan komputer. |
| Ruang kerja (proyek) | Layar laptop berisi proyek | Pemilik masuk, duduk, membuka laptop; layar proyek terbuka dan digeser otomatis oleh karakternya. Pengunjung bisa menggeser manual atau membuka langsung. Klien sesekali datang dan bertanya soal proyek. |
| Galeri (skill) | Skill dipajang dalam bingkai di dinding | Dina dan Bayu jalan-jalan, duduk di bangku, mengomentari skill. |
| Ruang sertifikat | Sertifikat dalam pigura besar | Bayu dan klien bercanda soal jumlah sertifikat. |
| Teras (kontak) | Surat, email, form | Dina dan Bayu mengajak menghubungi, mengetuk pintu, cek kotak surat. Pemilik keluar menyapa. |

- Pintu kanan setiap ruangan mengarah ke ruangan berikutnya; pintu teras kembali ke ruang tamu.
- Obrolan diambil acak dari kumpulan dialog per ruangan (dua bahasa), tanpa urutan tetap. Dialog di ruang proyek, skill, dan sertifikat memakai data asli dari admin (judul proyek, jumlah skill, jumlah sertifikat).
- Karakter yang diklik akan menyapa.
- Tokoh selain pemilik (Dina, Bayu, Klien) fiktif.

## 3. Suara dan tampilan
- Musik lo-fi dibuat langsung di browser (akor, bass, drum, melodi acak, desis piringan). Tombol ♫ di HUD.
- Efek suara lembut (gelombang segitiga), termasuk suara kucing.
- Font: Pixelify Sans untuk judul dan label, Nunito untuk teks panjang.
- Mode malam: dinding ungu tua, lampu menyala, jendela menampilkan bulan.

## 4. Performa
- Sprite dirender sebagai satu gambar per objek: elemen DOM turun dari sekitar 9.000 menjadi sekitar 900.
- Adegan hanya berjalan saat ruangannya terlihat di layar.
- Gerakan karakter memakai transform dan atribut DOM, tanpa render ulang React per frame.
- Smooth scroll native (Lenis sudah dihapus).

## 5. Yang masih butuh dari Anda
1. Foto profil (opsional): isi `photo` di `src/content/site.ts`.
2. File CV (PDF): isi `cv` di file yang sama; tombol muncul di hero.
3. Screenshot dashboard proyek stok (thumbnail saat ini halaman login demo).
4. Jika ingin menambah atau mengubah obrolan: `src/content/dialogue.ts`.
