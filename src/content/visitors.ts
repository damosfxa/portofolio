import type { Line } from "@/components/game/scene";
import type { CastId } from "@/components/game/cast";
import type { Talk } from "@/content/dialogue";

// Tamu per ruangan. Setiap ruangan punya tamu, pertanyaan, dan obrolan sendiri,
// jadi isi percakapan berbeda di tiap halaman. Peran "a" = tamu yang bersangkutan,
// "b" = tamu lain di ruangan, "me" = pemilik rumah.

export type RoomId = "living" | "projects" | "skills" | "certs" | "contact";

export type VisitorScript = {
  id: CastId;
  /** Kalimat saat baru masuk. */
  arrive: Line[];
  /** Pertanyaan ke pemilik rumah, beserta jawabannya. */
  ask: Talk[];
  /** Gumaman sendiri. */
  solo: Line[];
  /** Pamit pulang di siang hari. */
  leave: Line[];
};

export type RoomContent = {
  visitors: VisitorScript[];
  /** Obrolan antar-tamu di ruangan ini. */
  pair: Talk[];
};

export type RoomData = {
  projects: { title: string; tags: string[] }[];
  skills: string[];
  certs: string[];
};

const L = (id: string, en: string): Line => ({ id, en });

/** Kalimat pamit saat malam tiba (dipakai semua tamu). */
export const NIGHT_BYE: Line[] = [
  L("Udah malem, aku pulang dulu ya.", "It's getting late, I'm heading home."),
  L("Wah, gelap. Pamit dulu!", "Oh, it's dark already. See you!"),
  L("Besok lanjut lagi ya. Dadah!", "Let's continue tomorrow. Bye!"),
  L("Aku duluan, takut kemalaman.", "I'll head out before it gets too late."),
];

/**
 * Isi obrolan satu ruangan. `seed` menentukan proyek/skill/sertifikat yang dibahas (acak di situs;
 * skrip pembuat rekaman suara memakai setiap seed supaya semua variasi kalimat ikut direkam).
 */
export function roomContent(room: RoomId, data: RoomData, seed = Math.floor(Math.random() * 1e6)): RoomContent {
  const at = <T,>(items: T[], offset = 0) => items[(seed + offset) % items.length];
  const project = data.projects.length ? at(data.projects) : { title: "proyek ini", tags: [] };
  const tags = project.tags.slice(0, 3).join(", ") || "Next.js";
  const skill = data.skills.length ? at(data.skills) : "React";
  const skill2 = data.skills.length > 1 ? at(data.skills, 1) : "PostgreSQL";
  const cert = data.certs.length ? at(data.certs) : "sertifikat";
  const nProjects = data.projects.length;
  const nSkills = data.skills.length;
  const nCerts = data.certs.length;

  switch (room) {
    /* ================= Ruang tamu: teman-teman nongkrong ================= */
    case "living":
      return {
        visitors: [
          {
            id: "dina",
            arrive: [L("Haii, aku mampir bentar ya.", "Hiii, just dropping by."), L("Permisi, ada orang?", "Hello, anyone home?")],
            ask: [
              [
                ["a", L("Riz, logo klienku boleh dibikinin landing page?", "Riz, could you build a landing page for my client's brand?")],
                ["me", L("Boleh. Desainnya dari kamu, aku yang ngoding.", "Sure. You design it, I'll code it.")],
                ["a", L("Deal! Kolaborasi lagi kita.", "Deal! Another collab.")],
              ],
              [
                ["a", L("Kamu lagi sibuk nggak minggu ini?", "Are you busy this week?")],
                ["me", L("Lumayan, tapi masih bisa nyelip satu proyek.", "Pretty busy, but I can squeeze in one more project.")],
              ],
            ],
            solo: [L("Warna sofa ini cakep juga.", "This sofa color is actually nice."), L("Moodboard dulu ah.", "Time for a moodboard.")],
            leave: [L("Aku ke kantor dulu ya!", "Off to the office!")],
          },
          {
            id: "bayu",
            arrive: [L("Yo! Ada makanan nggak?", "Yo! Got any food?"), L("Main game yuk!", "Let's play a game!")],
            ask: [
              [
                ["a", L("Bisa bikinin web buat komunitas game-ku?", "Can you build a site for my gaming community?")],
                ["me", L("Bisa, sekalian leaderboard-nya kalau mau.", "Sure, with a leaderboard if you want.")],
                ["a", L("Wah, mantap. Nanti kubayar pakai traktiran.", "Sweet. I'll pay you in snacks.")],
                ["me", L("...Bayar pakai uang aja, Bay.", "...Real money would be better, Bay.")],
              ],
              [
                ["a", L("Kamu nggak capek ngoding terus?", "Don't you get tired of coding all day?")],
                ["me", L("Capek sih, makanya ada kopi.", "I do, that's what coffee is for.")],
              ],
            ],
            solo: [L("Satu ronde lagi...", "One more round..."), L("Wifinya kenceng, cocok buat mabar.", "Fast wifi, perfect for gaming.")],
            leave: [L("Cabut dulu, ada janji mabar.", "Gotta go, I have a gaming session.")],
          },
          {
            id: "lala",
            arrive: [L("Kak, aku boleh numpang belajar di sini?", "Can I study here for a bit?")],
            ask: [
              [
                ["a", L("Kak, belajar backend mulai dari mana sih?", "Where should I start learning backend?")],
                ["me", L("Mulai dari database dulu. Ngerti datanya, baru deh bikin API.", "Start with databases. Understand the data, then the API.")],
                ["a", L("Siap, kucatat.", "Got it, writing that down.")],
              ],
              [
                ["a", L("Kak, kodeku error terus...", "My code keeps erroring...")],
                ["me", L("Coba baca error-nya pelan-pelan. Biasanya jawabannya udah ada di situ kok.", "Read the error message slowly. The answer is usually there.")],
              ],
            ],
            solo: [L("Hmm, kenapa undefined lagi...", "Hmm, why is it undefined again..."), L("Tugas kuliah numpuk.", "So much homework.")],
            leave: [L("Makasih kak, aku pulang dulu!", "Thanks, I'm heading home!")],
          },
          {
            id: "raka",
            arrive: [L("Bro, numpang nge-charge laptop ya.", "Mind if I charge my laptop?")],
            ask: [
              [
                ["a", L("Kamu biasanya deploy pakai apa?", "What do you usually deploy with?")],
                ["me", L("Biasanya Vercel buat frontend, database-nya Supabase atau Neon.", "Vercel for the frontend, Supabase or Neon for the database.")],
                ["a", L("Sama, praktis.", "Same, it's convenient.")],
              ],
              [
                ["a", L("Ada lowongan freelance nggak, bagi-bagi dong.", "Got any freelance gigs to share?")],
                ["me", L("Kalau lagi kebanyakan, nanti kuoper ke kamu deh.", "If I get too many, I'll pass some to you.")],
              ],
            ],
            solo: [L("Merge conflict lagi...", "Merge conflict again..."), L("Tinggal tulis test-nya.", "Just need to write the tests.")],
            leave: [L("Oke bro, aku cabut.", "Alright, I'm off.")],
          },
        ],
        pair: [
          [
            ["a", L("Macet banget tadi di jalan.", "Traffic was brutal today.")],
            ["b", L("Jakarta, bro. Untung bisa kerja dari sini.", "That's Jakarta. Good thing we can work from here.")],
          ],
          [
            ["a", L("Laper nih. Masak apa ya?", "I'm hungry. What should we cook?")],
            ["b", L("Mie instan pakai telur. Klasik.", "Instant noodles with an egg. A classic.")],
            ["a", L("Setuju.", "Agreed.")],
          ],
          [
            ["a", L("Kamu udah nonton film yang kemarin?", "Did you watch that movie yesterday?")],
            ["b", L("Belum, jangan spoiler!", "Not yet, no spoilers!")],
          ],
          [
            ["a", L("Hujan lagi di luar.", "It's raining again.")],
            ["b", L("Pas, nyalain musik lo-fi aja.", "Perfect, let's put on some lo-fi.")],
          ],
        ],
      };

    /* ================= Ruang kerja: klien dan pemilik usaha ================= */
    case "projects":
      return {
        visitors: [
          {
            id: "client",
            arrive: [L("Selamat siang, saya ada janji sama Rizky.", "Good afternoon, I have a meeting with Rizky.")],
            ask: [
              [
                ["a", L(`Ini ${project.title}, ya? Bisa saya coba?`, `Is this ${project.title}? Can I try it?`)],
                ["me", L("Bisa, Pak. Klik aja tombol demo di layarnya.", "Sure, there's a demo button on the screen.")],
                ["a", L("Rapi juga. Saya suka.", "Clean work. I like it.")],
              ],
              [
                ["a", L("Kantor saya butuh dashboard laporan keuangan.", "My office needs a finance reporting dashboard.")],
                ["me", L("Bisa banget, Pak. Laporannya nanti bisa langsung diunduh ke Excel.", "Can do. Reports can be exported to Excel too.")],
                ["a", L("Nah, itu yang saya cari.", "That's exactly what I need.")],
              ],
            ],
            solo: [L("Hmm, menarik.", "Hmm, interesting."), L("Nanti saya obrolin dulu sama tim.", "I'll discuss this with my team.")],
            leave: [L("Terima kasih, nanti saya kabari.", "Thank you, I'll be in touch.")],
          },
          {
            id: "kevin",
            arrive: [L("Hai! Aku Kevin, lagi bangun startup.", "Hi! I'm Kevin, building a startup.")],
            ask: [
              [
                ["a", L("Kalau bikin MVP, kira-kira berapa lama?", "How long would an MVP take?")],
                ["me", L("Tergantung fiturnya sih. Kita pilih yang paling penting dulu, ya.", "Depends on the features. Let's pick the essentials first.")],
                ["a", L("Masuk akal. Fokus dulu.", "Makes sense. Focus first.")],
              ],
              [
                ["a", L(`${project.title} pakai stack apa?`, `What's ${project.title} built with?`)],
                ["me", L(`${tags}.`, `${tags}.`)],
                ["a", L("Mirip stack kami. Cocok.", "Similar to our stack. Good fit.")],
              ],
            ],
            solo: [L("Investor nanya traction lagi...", "Investors asking about traction again..."), L("Pitch deck belum beres.", "Pitch deck isn't done yet.")],
            leave: [L("Oke, aku follow up lewat email ya.", "Okay, I'll follow up by email.")],
          },
          {
            id: "rina",
            arrive: [L("Permisi, saya Rina, jualan skincare online.", "Hi, I'm Rina, I sell skincare online.")],
            ask: [
              [
                ["a", L("Stok saya di Shopee sama di gudang suka nggak cocok.", "My Shopee stock never matches the warehouse.")],
                ["me", L("Wah, itu pernah aku beresin, Kak. Nanti keluar-masuk stok kecatat otomatis.", "I've solved that before. Every stock movement gets recorded.")],
                ["a", L("Wah, pas banget buat saya!", "That's perfect for me!")],
              ],
              [
                ["a", L("Bisa sekalian label QR buat gudang?", "Can you add QR labels for the warehouse?")],
                ["me", L("Bisa dong, tinggal scan pakai HP.", "Yes, just scan with a phone.")],
              ],
            ],
            solo: [L("Pesanan lagi rame nih.", "Orders are booming."), L("Duh, retur lagi...", "Ugh, another return...")],
            leave: [L("Saya pikir-pikir dulu ya, makasih!", "Let me think it over, thanks!")],
          },
          {
            id: "budi",
            arrive: [L("Assalamualaikum, saya Budi, punya rumah makan.", "Hello, I'm Budi, I run a restaurant.")],
            ask: [
              [
                ["a", L("Bisa bikin sistem kasir buat warung saya?", "Can you build a cashier system for my restaurant?")],
                ["me", L("Bisa, Pak. Sekalian laporan penjualan tiap harinya.", "Yes, sir. With daily sales reports too.")],
                ["a", L("Biar saya nggak ngitung pakai kalkulator lagi.", "So I can stop using a calculator.")],
              ],
              [
                ["a", L("Saya nggak ngerti teknologi, nanti susah dipakai nggak?", "I'm not tech-savvy. Will it be hard to use?")],
                ["me", L("Tenang aja, Pak. Nanti saya bikin yang gampang banget dipakai.", "Don't worry, sir. I'll keep it as simple as possible.")],
              ],
            ],
            solo: [L("Wah, layarnya canggih.", "Wow, fancy screen."), L("Anak saya pasti ngerti ini.", "My kid would understand this.")],
            leave: [L("Nanti saya mampir lagi ya, Mas.", "I'll come by again.")],
          },
        ],
        pair: [
          [
            ["a", L(`Proyeknya ada ${nProjects}, ya?`, `There are ${nProjects} projects, right?`)],
            ["b", L("Iya, tapi isinya serius semua.", "Yep, but they're all solid.")],
          ],
          [
            ["a", L("Antre juga ya mau konsultasi.", "There's a queue for consultations.")],
            ["b", L("Namanya juga laris.", "Popular guy.")],
          ],
          [
            ["a", L("Mas juga mau bikin aplikasi?", "Are you getting an app built too?")],
            ["b", L("Iya, buat usaha saya.", "Yes, for my business.")],
            ["a", L("Semoga lancar, ya.", "Good luck with it.")],
          ],
        ],
      };

    /* ================= Galeri skill: orang tech dan HR ================= */
    case "skills":
      return {
        visitors: [
          {
            id: "raka",
            arrive: [L("Wih, galeri skill. Keren.", "Whoa, a skill gallery. Nice.")],
            ask: [
              [
                ["a", L(`Kamu lebih suka ${skill} atau ${skill2}?`, `Do you prefer ${skill} or ${skill2}?`)],
                ["me", L("Tergantung proyeknya sih.", "Depends on what the project needs.")],
                ["a", L("Jawaban senior banget.", "Spoken like a senior.")],
              ],
            ],
            solo: [L(`${skill}? Aku juga lagi belajar itu.`, `${skill}? I'm learning that too.`)],
            leave: [L("Oke, lanjut ngoding dulu.", "Okay, back to coding.")],
          },
          {
            id: "nadia",
            arrive: [L("Halo, aku Nadia, product manager.", "Hi, I'm Nadia, a product manager.")],
            ask: [
              [
                ["a", L("Kamu nyaman kerja bareng desainer dan PM?", "Are you comfortable working with designers and PMs?")],
                ["me", L("Nyaman banget. Aku malah suka diskusi dulu sebelum ngoding.", "Yes. I like discussing things before I start coding.")],
                ["a", L("Nah, itu yang tim kami cari.", "That's what our team is looking for.")],
              ],
              [
                ["a", L("Biasanya kamu estimasi task gimana?", "How do you usually estimate tasks?")],
                ["me", L("Aku pecah jadi tugas kecil-kecil, terus kasih waktu cadangan.", "Break them down small, then add a buffer.")],
              ],
            ],
            solo: [L("Hmm, cocok buat roadmap kita.", "Hmm, fits our roadmap."), L("Catat dulu di Notion.", "Let me note that in Notion.")],
            leave: [L("Nanti aku kontak lagi ya.", "I'll reach out again.")],
          },
          {
            id: "sari",
            arrive: [L("Permisi, saya Sari dari tim rekrutmen.", "Hello, I'm Sari from recruiting.")],
            ask: [
              [
                ["a", L("Kamu terbuka buat posisi full-time nggak?", "Are you open to a full-time role?")],
                ["me", L("Terbuka kok, Kak. Freelance juga bisa.", "Yes, freelance works too.")],
                ["a", L("Oke, saya catat ya.", "Great, noted.")],
              ],
              [
                ["a", L(`Dari ${nSkills} skill ini, mana yang paling dikuasai?`, `Of these ${nSkills} skills, which is your strongest?`)],
                ["me", L("Paling sering pakai Next.js, TypeScript, sama PostgreSQL.", "Next.js, TypeScript, and PostgreSQL. I use them the most.")],
              ],
            ],
            solo: [L("Profilnya cocok nih.", "This profile looks like a fit."), L("Kirim ke hiring manager dulu.", "Forwarding to the hiring manager.")],
            leave: [L("Terima kasih, nanti saya hubungi.", "Thank you, I'll get in touch.")],
          },
          {
            id: "lala",
            arrive: [L("Kak, aku mau lihat-lihat galerinya!", "Can I look around the gallery?")],
            ask: [
              [
                ["a", L(`Kak, ${skill} susah nggak dipelajari?`, `Is ${skill} hard to learn?`)],
                ["me", L("Awalnya iya. Bikin proyek kecil aja dulu.", "At first. Just build something small.")],
              ],
            ],
            solo: [L("Banyak banget yang harus kupelajari...", "So much to learn..."), L(`Aku mau bisa ${skill} juga.`, `I want to learn ${skill} too.`)],
            leave: [L("Aku belajar dulu ya, kak!", "Off to study!")],
          },
        ],
        pair: [
          [
            ["a", L(`Wih, ada ${skill} juga.`, `Oh, ${skill} too.`)],
            ["b", L("Dipajang semua, pamer banget.", "All framed up, what a show-off.")],
          ],
          [
            ["a", L("Bingkai yang itu miring.", "That frame is crooked.")],
            ["b", L("Biarin, biar artsy.", "Leave it, it's artsy.")],
          ],
          [
            ["a", L(`${skill2} itu buat apa sih?`, `What's ${skill2} for?`)],
            ["b", L("Tanya yang punya rumah aja.", "Ask the host.")],
          ],
        ],
      };

    /* ================= Ruang sertifikat ================= */
    case "certs":
      return {
        visitors: [
          {
            id: "sari",
            arrive: [L("Saya mau cek sertifikatnya sebentar.", "I'd like to check the certificates.")],
            ask: [
              [
                ["a", L(`Sertifikat ${cert} ini dari program apa?`, `What program is the ${cert} certificate from?`)],
                ["me", L("Itu dari bootcamp, Kak. Materinya langsung praktik, jadi kepake banget.", "An intensive course. Very hands-on.")],
                ["a", L("Oke, saya lampirin ke berkasnya.", "Good, I'll attach it to your file.")],
              ],
            ],
            solo: [L("Dokumennya lengkap juga, ya.", "The documents look complete.")],
            leave: [L("Baik, terima kasih.", "Alright, thank you.")],
          },
          {
            id: "bayu",
            arrive: [L("Mana nih ruangan pamerannya?", "Where's the trophy room?")],
            ask: [
              [
                ["a", L(`Kok sertifikatnya cuma ${nCerts}?`, `Why only ${nCerts} certificates?`)],
                ["me", L("Yang penting skill-nya kepake, Bay.", "What matters is the skill, Bay.")],
                ["a", L("Bilang aja nggak ada duit buat bimbel, hahaha.", "Just admit you ran out of course money, haha.")],
              ],
            ],
            solo: [L("Dipigura segala, bangga banget dia.", "He even framed them. So proud."), L("Aku juga punya sertifikat... lomba makan kerupuk.", "I have a certificate too... from a cracker-eating contest.")],
            leave: [L("Udah ah, aku ke ruang tamu.", "I'm going back to the living room.")],
          },
          {
            id: "tari",
            arrive: [L("Halo, aku Tari. Lagi cari developer.", "Hi, I'm Tari. Looking for a developer.")],
            ask: [
              [
                ["a", L("Ini sertifikatnya asli kan?", "These certificates are legit, right?")],
                ["me", L("Asli dong. Tapi mending lihat proyeknya langsung, lebih kebayang.", "Yes. But the projects say more than the paper.")],
                ["a", L("Oke, nanti kulihat ruang kerjamu.", "Okay, I'll check out your workroom.")],
              ],
              [
                ["a", L("Bisa bikin website pesan kue online?", "Can you build an online cake ordering site?")],
                ["me", L("Bisa, sekalian ada jadwal ambil kuenya juga.", "Yes, with pickup scheduling too.")],
              ],
            ],
            solo: [L("Aku juga dulu ikut kursus bikin kue.", "I took a baking course once.")],
            leave: [L("Aku balik ke toko dulu ya.", "Heading back to my shop.")],
          },
          {
            id: "kevin",
            arrive: [L("Boleh lihat background-nya?", "Mind if I look at your background?")],
            ask: [
              [
                ["a", L("Bootcamp-nya berapa lama?", "How long was the bootcamp?")],
                ["me", L("Beberapa minggu. Tapi belajarnya ya nggak berhenti di situ.", "A few weeks, but the learning didn't stop there.")],
                ["a", L("Wah, mindset-nya bagus.", "Good mindset.")],
              ],
            ],
            solo: [L("Hmm, cocok buat tim awal.", "Hmm, good fit for an early team.")],
            leave: [L("Oke, nice to meet you!", "Okay, nice to meet you!")],
          },
        ],
        pair: [
          [
            ["a", L(`Kok cuma ${nCerts}, ya?`, `Only ${nCerts}, huh?`)],
            ["b", L("Nggak bimbel lagi apa nggak ada duit, hahaha.", "No more courses or no more money, haha.")],
          ],
          [
            ["a", L("Nanti kalau nambah, dindingnya muat?", "Will the wall fit more later?")],
            ["b", L("Tenang, pakunya masih banyak.", "Relax, plenty of nails.")],
          ],
          [
            ["a", L("Bootcamp itu berat lho.", "Bootcamps are tough.")],
            ["b", L("Pantes dia jarang keluar kamar.", "That's why he never leaves his room.")],
          ],
        ],
      };

    /* ================= Teras: kurir dan calon klien ================= */
    case "contact":
      return {
        visitors: [
          {
            id: "joko",
            arrive: [L("Paket! Paket untuk Mas Rizky!", "Package! Package for Rizky!")],
            ask: [
              [
                ["a", L("Mas, paketnya taruh di mana?", "Where should I leave the package?")],
                ["me", L("Di situ aja, Mas. Makasih ya.", "Right there is fine. Thanks!")],
                ["a", L("Siap. Bintang lima ya, Mas!", "You got it. Five stars, please!")],
              ],
            ],
            solo: [L("Alamatnya bener kan ini...", "This is the right address, right..."), L("Masih ada sepuluh paket lagi.", "Ten more packages to go.")],
            leave: [L("Mari, Mas!", "See you!")],
          },
          {
            id: "tari",
            arrive: [L("Permisi, Rizky-nya ada?", "Excuse me, is Rizky home?")],
            ask: [
              [
                ["a", L("Kalau mau pesan website, mulainya gimana?", "How do I start if I want a website?")],
                ["me", L("Isi form di sebelah aja, ceritain butuhnya apa.", "Fill in the form over there and tell me what you need.")],
                ["a", L("Oke, aku isi sekarang.", "Okay, I'll fill it in now.")],
              ],
            ],
            solo: [L("Bawa kue buat oleh-oleh, ah.", "Brought some cake as a gift.")],
            leave: [L("Formnya udah kuisi. Ditunggu ya!", "I filled in the form. Looking forward to it!")],
          },
          {
            id: "budi",
            arrive: [L("Mas, saya mau tanya-tanya dulu.", "I'd like to ask a few things first.")],
            ask: [
              [
                ["a", L("Kalau saya chat, dibalasnya cepat nggak?", "If I message you, do you reply quickly?")],
                ["me", L("Biasanya cepet kok, Pak. Paling lama besoknya udah saya balas.", "Usually fast, sir. By the next day at the latest.")],
              ],
            ],
            solo: [L("Teras rumahnya adem.", "Nice, shady porch.")],
            leave: [L("Nanti saya kirim pesan ya.", "I'll send you a message.")],
          },
          {
            id: "dina",
            arrive: [L("Aku nganterin klien baru, nih!", "I brought you a new client!")],
            ask: [
              [
                ["a", L("Temenku butuh web portofolio. Kamu terima?", "My friend needs a portfolio site. Interested?")],
                ["me", L("Terima dong. Suruh isi form aja ya.", "Sure. Have them fill in the form.")],
              ],
            ],
            solo: [L("Ayo ayo, hubungi dia sekarang!", "Come on, reach out now!")],
            leave: [L("Oke, aku kabarin temenku!", "Okay, I'll tell my friend!")],
          },
        ],
        pair: [
          [
            ["a", L("Kamu juga mau ketemu Rizky?", "You're here to see Rizky too?")],
            ["b", L("Iya, mau konsultasi.", "Yes, for a consultation.")],
          ],
          [
            ["a", L("Kotak suratnya kosong.", "The mailbox is empty.")],
            ["b", L("Makanya kirim pesan dong.", "So send him a message.")],
          ],
          [
            ["a", L("Balasnya cepat nggak sih?", "Does he reply fast?")],
            ["b", L("Cepat, kecuali lagi tidur.", "Fast, unless he's asleep.")],
          ],
        ],
      };
  }
}
