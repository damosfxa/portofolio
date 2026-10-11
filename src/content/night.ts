import type { Line } from "@/components/game/scene";
import type { CastId } from "@/components/game/cast";
import type { Talk } from "@/content/dialogue";

// Kegiatan malam di setiap ruangan. Saat malam, tamu siang pulang dan rombongan malam datang
// bergantian: nobar di ruang tamu, lembur di ruang kerja, foto-foto di galeri, klub baca, dan ronda di teras.

const L = (id: string, en: string): Line => ({ id, en });

export const MORNING_BYE: Line[] = [
  L("Wah, udah pagi! Pulang dulu ya.", "Whoa, it's morning! Heading home."),
  L("Begadang lagi kita. Sampai nanti!", "Pulled an all-nighter again. See you!"),
  L("Matahari terbit, waktunya tidur, haha.", "Sunrise means bedtime, haha."),
];

export type NightRoom = {
  cast: CastId[];
  arrive: Line[];
  bye: Line[];
  solo: Line[];
  pairs: Talk[];
  /** Kalimat khusus kegiatan ruangan ini. */
  acts: Record<string, Line[]>;
};

export const NIGHT: Record<"living" | "projects" | "skills" | "certs" | "contact", NightRoom> = {
  // Ruang tamu: nonton film atau bola bareng, main konsol, ngemil.
  living: {
    cast: ["bayu", "dina", "lala", "raka"],
    arrive: [
      L("Malam! Jadi nobar kan?", "Evening! Movie night still on?"),
      L("Aku bawa camilan!", "I brought snacks!"),
      L("Malam ini nonton apa?", "What are we watching tonight?"),
    ],
    bye: [
      L("Udah larut, aku pulang ya.", "It's late, I'm heading home."),
      L("Seru! Besok lanjut episode berikutnya.", "Fun! Next episode tomorrow."),
    ],
    solo: [
      L("Remote-nya di mana sih?", "Where's the remote?"),
      L("Selimutnya hangat banget.", "This blanket is so warm."),
      L("Kucingnya ikut nonton tuh.", "The cat is watching too."),
    ],
    pairs: [
      [["a", L("Film horor atau komedi?", "Horror or comedy?")], ["b", L("Komedi aja, besok kerja.", "Comedy, we work tomorrow.")], ["a", L("Penakut.", "Scaredy-cat.")]],
      [["a", L("Bolanya mulai jam berapa?", "What time is the match?")], ["b", L("Jam sembilan. Masih sempat ngemil.", "Nine. Still time for snacks.")]],
      [["a", L("Kamu udah lihat portofolio Rizky?", "Seen Rizky's portfolio?")], ["b", L("Udah, ada kamarnya segala!", "Yep, it even has his bedroom!")]],
      [["a", L("Siapa yang habisin keripiknya?", "Who finished the chips?")], ["b", L("Bukan aku. Mungkin kucingnya.", "Not me. Maybe the cat.")]],
    ],
    acts: {
      movie: [
        L("Eh, ternyata pelakunya dia!", "Wait, he was the culprit!"),
        L("Jangan buka pintu itu!", "Don't open that door!"),
        L("Plot twist-nya keren banget.", "That plot twist was great."),
        L("Iklannya lama banget.", "These ads take forever."),
      ],
      football: [
        L("Gol! Lihat nggak tadi?", "Goal! Did you see that?"),
        L("Wasitnya nggak adil!", "That referee is unfair!"),
        L("Ayo serang terus!", "Keep attacking!"),
      ],
      doze: [L("Dia ketiduran duluan, haha.", "Someone fell asleep first, haha."), L("Ssst, jangan dibangunin.", "Shh, don't wake them.")],
      snack: [L("Popcorn-nya habis, ambil lagi.", "Popcorn's gone, getting more."), L("Ada es krim di kulkas!", "There's ice cream in the fridge!")],
    },
  },
  // Ruang kerja: lembur sprint menjelang demo.
  projects: {
    cast: ["raka", "nadia", "kevin"],
    arrive: [
      L("Lembur lagi. Ayo selesaikan sprint ini.", "Overtime again. Let's finish this sprint."),
      L("Aku bawa kopi buat semua.", "Coffee for everyone."),
      L("Demo besok pagi, masih ada yang kurang.", "Demo tomorrow morning, a few things left."),
    ],
    bye: [
      L("Fitur aman, aku pulang dulu.", "Feature's done, I'm heading out."),
      L("Besok demo jam sembilan, jangan telat.", "Demo at nine, don't be late."),
    ],
    solo: [
      L("Tinggal satu bug lagi...", "Just one more bug..."),
      L("Test-nya hijau semua!", "All tests are green!"),
      L("Siapa yang taruh console.log di sini?", "Who left a console.log here?"),
    ],
    pairs: [
      [["a", L("Fitur login udah di-merge?", "Is the login feature merged?")], ["b", L("Udah, tinggal review.", "Yes, just needs review.")], ["a", L("Aku review sekarang.", "Reviewing now.")]],
      [["a", L("Kliennya minta warna tombol diganti lagi.", "The client wants the button color changed again.")], ["b", L("Ketiga kalinya minggu ini.", "Third time this week.")]],
      [["a", L("Pesan martabak yuk.", "Let's order martabak.")], ["b", L("Setuju. Otak butuh gula.", "Agreed. Brains need sugar.")]],
      [["a", L("Deploy sekarang atau besok?", "Deploy now or tomorrow?")], ["b", L("Jangan deploy hari Jumat malam.", "Never deploy on a Friday night.")]],
    ],
    acts: {
      code: [L("Ngetik dulu, jangan diganggu.", "Typing, don't disturb."), L("Refactor dikit biar rapi.", "A little refactor to tidy up.")],
      coffee: [L("Kopi ketiga malam ini.", "Third coffee tonight."), L("Mesin kopinya penyelamat.", "This coffee machine is a lifesaver.")],
      deploy: [L("Deploy berhasil!", "Deploy succeeded!"), L("Server aman, lampu hijau.", "Servers are fine, all green.")],
      doze: [L("Zzz... merge conflict... zzz", "Zzz... merge conflict... zzz")],
    },
  },
  // Galeri skill: foto-foto dan curhat di bangku.
  skills: {
    cast: ["lala", "dina", "sari"],
    arrive: [
      L("Galerinya cakep kalau malam.", "The gallery looks great at night."),
      L("Foto-foto yuk, buat story.", "Let's take photos for our story."),
    ],
    bye: [L("Fotonya bagus-bagus! Pulang dulu.", "Great photos! Heading home."), L("Makasih udah dengerin curhatku.", "Thanks for listening to me vent.")],
    solo: [
      L("Lampunya pas banget buat foto.", "The lighting is perfect for photos."),
      L("Aku juga mau belajar skill ini.", "I want to learn this skill too."),
    ],
    pairs: [
      [["a", L("Kerjaan kamu gimana?", "How's work?")], ["b", L("Capek, tapi seru.", "Tiring, but fun.")], ["a", L("Sama. Semangat ya.", "Same. Hang in there.")]],
      [["a", L("Aku pengen belajar ngoding.", "I want to learn to code.")], ["b", L("Tanya Rizky aja, dia sabar ngajarin.", "Ask Rizky, he's a patient teacher.")]],
      [["a", L("Ini fotonya blur.", "This photo is blurry.")], ["b", L("Estetik namanya.", "It's called aesthetic.")]],
    ],
    acts: {
      photo: [L("Cekrek! Satu lagi.", "Click! One more."), L("Senyum dong!", "Smile!"), L("Pakai flash atau nggak?", "Flash or no flash?")],
      trophy: [L("Pose bareng trofi dulu.", "Pose with the trophy."), L("Pura-pura menang lomba.", "Pretending I won a contest.")],
    },
  },
  // Ruang sertifikat: klub baca malam.
  certs: {
    cast: ["tari", "sari", "kevin"],
    arrive: [
      L("Klub baca malam dimulai!", "Night book club begins!"),
      L("Aku bawa teh hangat.", "I brought warm tea."),
    ],
    bye: [L("Bab berikutnya minggu depan ya.", "Next chapter next week."), L("Bukunya kupinjam dulu.", "I'll borrow this book.")],
    solo: [
      L("Satu bab lagi, terus pulang.", "One more chapter, then home."),
      L("Raknya penuh buku bagus.", "This shelf is full of good books."),
    ],
    pairs: [
      [["a", L("Bukumu tentang apa?", "What's your book about?")], ["b", L("Cara bikin startup dari nol.", "Building a startup from scratch.")], ["a", L("Pinjam habis ini ya.", "Let me borrow it after.")]],
      [["a", L("Endingnya sedih banget.", "The ending was so sad.")], ["b", L("Jangan spoiler!", "No spoilers!")]],
      [["a", L("Sertifikat Rizky banyak juga ya.", "Rizky has quite a few certificates.")], ["b", L("Rajin belajar dia.", "He studies a lot.")]],
    ],
    acts: {
      read: [L("Ssst, lagi seru-serunya.", "Shh, it's getting good."), L("Kalimat ini bagus banget.", "This line is beautiful.")],
      tea: [L("Tehnya pas, nggak terlalu manis.", "Tea's just right, not too sweet.")],
      doze: [L("Zzz... halaman dua ratus...", "Zzz... page two hundred...")],
    },
  },
  // Teras: ronda, ngopi, lihat bintang, pesanan martabak datang.
  contact: {
    cast: ["budi", "joko", "bayu"],
    arrive: [
      L("Malam, ronda dulu.", "Evening, night watch time."),
      L("Ngopi di teras enak nih.", "Coffee on the porch sounds nice."),
    ],
    bye: [L("Aman terkendali. Pulang dulu.", "All quiet. Heading home."), L("Besok ronda lagi ya.", "Night watch again tomorrow.")],
    solo: [
      L("Bintangnya banyak malam ini.", "So many stars tonight."),
      L("Anginnya sejuk.", "The breeze is nice."),
      L("Plak! Nyamuknya gede banget.", "Slap! Huge mosquito."),
    ],
    pairs: [
      [["a", L("Pak, kopinya kurang gula.", "Sir, the coffee needs sugar.")], ["b", L("Biar melek, Mas.", "Keeps you awake.")]],
      [["a", L("Tadi ada suara apa?", "What was that noise?")], ["b", L("Cuma kucing.", "Just a cat.")], ["a", L("Syukurlah.", "Phew.")]],
      [["a", L("Rizky masih bangun tuh, lampunya nyala.", "Rizky's still up, his light is on.")], ["b", L("Lembur lagi pasti.", "Working late again for sure.")]],
    ],
    acts: {
      ronda: [L("Siskamling! Aman, aman.", "Night watch! All clear."), L("Kentongan dulu biar warga tenang.", "A few knocks so everyone feels safe.")],
      delivery: [L("Paket martabak!", "Martabak delivery!"), L("Pesanan tengah malam datang.", "Midnight order's here.")],
      coffee: [L("Kopi tubruk paling mantap.", "Nothing beats strong coffee.")],
    },
  },
};
