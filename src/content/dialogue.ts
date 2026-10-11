import type { Line } from "@/components/game/scene";

// Kumpulan obrolan per ruangan. Mesin adegan memilih secara acak tanpa pengulangan berturut-turut,
// jadi urutan percakapan selalu berubah. Peran "a" dan "b" diisi tokoh yang sedang ada di ruangan.
// Gaya bahasanya santai seperti teman serumah; jasa disebut sambil lalu, bukan seperti iklan.

export type Role = "a" | "b" | "me";
export type Talk = [Role, Line][];

const L = (id: string, en: string): Line => ({ id, en });

/* ---------- Ruang tamu (hero) ---------- */

export const LIVING_TALKS: Talk[] = [
  [
    ["a", L("Eh, Rizky dari tadi ngetik terus. Lagi ngapain sih?", "Rizky's been typing nonstop. What's he doing?")],
    ["b", L("Katanya bikin dashboard buat orang.", "Building a dashboard for someone, apparently.")],
    ["a", L("Dashboard yang ada grafik-grafiknya itu?", "The kind with all the charts?")],
    ["b", L("Iya. Biar laporannya nggak ngetik manual lagi.", "Yep. So the reports don't get typed by hand anymore.")],
  ],
  [
    ["a", L("Sepupuku mau jualan online, tapi bingung bikin webnya.", "My cousin wants to sell online but doesn't know how to build a site.")],
    ["b", L("Lho, suruh ngobrol sama Rizky aja.", "Just have them talk to Rizky.")],
    ["a", L("Emang dia ngerjain yang begituan?", "Does he even do that kind of thing?")],
    ["b", L("Dari database sampai tampilannya, dia semua.", "Database to UI, all of it.")],
  ],
  [
    ["a", L("Macet banget tadi di jalan.", "Traffic was brutal today.")],
    ["b", L("Jakarta, bro. Untung kerjaan bisa remote.", "That's Jakarta. Good thing work can be remote.")],
    ["a", L("Rizky juga remote kan?", "Rizky works remote too, right?")],
    ["b", L("Bisa remote, bisa ke kantor juga katanya. Fleksibel.", "Remote or on-site, he said. Flexible.")],
  ],
  [
    ["a", L("Kantorku masih nyatet stok pakai buku tulis.", "My office still tracks stock in a notebook.")],
    ["b", L("Serius? Tahun segini?", "Seriously? In this day and age?")],
    ["a", L("Serius. Tiap akhir bulan pasti selisih.", "Seriously. Every month-end it never adds up.")],
    ["b", L("Itu mah lahannya Rizky. Dia pernah bikin sistem stok.", "That's right up Rizky's alley. He's built a stock system before.")],
  ],
  [
    ["a", L("Laper nih. Masak apa ya?", "I'm hungry. What should we cook?")],
    ["b", L("Mie instan, pakai telur.", "Instant noodles, with an egg.")],
    ["a", L("Klasik. Setuju.", "A classic. Agreed.")],
  ],
  [
    ["a", L("Hujan lagi di luar.", "It's raining again.")],
    ["b", L("Pas. Enaknya ngopi sambil dengerin lo-fi.", "Perfect. Coffee and lo-fi time.")],
    ["a", L("Musiknya bisa dinyalain di atas tuh.", "You can turn the music on up top.")],
  ],
  [
    ["a", L("Kamu nonton film yang kemarin?", "Did you watch that movie yesterday?")],
    ["b", L("Belum, jangan spoiler!", "Not yet, no spoilers!")],
    ["a", L("Oke oke. Tapi endingnya...", "Okay okay. But the ending...")],
    ["b", L("Diaaam!", "Shhh!")],
  ],
  [
    ["me", L("Ada yang lihat kopiku?", "Anyone seen my coffee?")],
    ["a", L("Nggak tahu tuh...", "No idea...")],
    ["me", L("Kok mulutmu ada busanya?", "Then why is there foam on your lip?")],
    ["a", L("Hehe. Nanti kuganti.", "Hehe. I'll buy you another.")],
  ],
  [
    ["a", L("Klien nanya progress lagi.", "The client is asking for an update again.")],
    ["me", L("Bilang aja tinggal deploy.", "Tell them it's just deploying.")],
    ["a", L("Beneran tinggal deploy?", "Is it actually just deploying?")],
    ["me", L("...Tinggal deploy kok. Hampir.", "...Almost deploying. Basically.")],
  ],
  [
    ["a", L("Kamu bisa bikin API juga?", "Can you build APIs too?")],
    ["me", L("Bisa. Sama database dan halaman admin-nya sekalian.", "Yep. Database and admin pages included.")],
    ["a", L("Paket lengkap ya.", "The whole package, huh.")],
  ],
  [
    ["a", L("Kucingnya tidur lagi.", "The cat's asleep again.")],
    ["b", L("Dari pagi kerjaannya cuma tidur.", "That's all it's done since morning.")],
    ["a", L("Iri banget. Nggak ada deadline.", "So jealous. No deadlines.")],
  ],
  [
    ["a", L("Website kantorku lemot banget dibuka.", "My company site is so slow to load.")],
    ["b", L("Mungkin gambarnya kegedean, atau query-nya berantakan.", "Maybe huge images, or messy queries.")],
    ["a", L("Kamu ngerti gituan?", "You understand that stuff?")],
    ["b", L("Nggak. Rizky yang ngerti, hahaha.", "Nope. Rizky does, haha.")],
  ],
];

export const LIVING_SOLO: Line[] = [
  L("Bab ini seru juga ternyata.", "This chapter is actually good."),
  L("Grup kantor rame banget, astaga.", "The office group chat is wild."),
  L("Satu level lagi, abis itu udahan.", "One more level, then I'll stop."),
  L("Kok makanannya cepet habis ya.", "Why does food disappear so fast."),
  L("Hmm, enaknya ngapain ya sekarang.", "Hmm, what should I do now."),
  L("Notif apaan sih ini dari tadi.", "What's with all these notifications."),
];

export const ME_SOLO: Line[] = [
  L("Commit dulu, baru istirahat.", "Commit first, then rest."),
  L("Akhirnya bug-nya ketemu!", "Finally found the bug!"),
  L("Siapa yang naruh kaus kaki di sini?", "Who left socks here?"),
  L("Oke, fitur ini beres. Selanjutnya...", "Okay, this feature's done. Next..."),
  L("Kopinya habis lagi.", "Out of coffee again."),
];

export const FIGHT_TALKS: Talk[] = [
  [
    ["a", L("Itu stik game-ku!", "That's my controller!")],
    ["b", L("Enak aja, aku duluan!", "No way, I had it first!")],
    ["a", L("Sini nggak!", "Give it here!")],
  ],
  [
    ["a", L("Kamu curang tadi!", "You cheated!")],
    ["b", L("Mana ada! Kamu aja yang kalah!", "Did not! You just lost!")],
  ],
];
export const MAKE_UP: Line[] = [
  L("Oke oke, gantian aja.", "Okay okay, let's take turns."),
  L("Seri deh. Aku traktir kopi.", "Call it a draw. Coffee's on me."),
  L("Aduh, capek. Damai ya.", "Ugh, I'm tired. Truce?"),
];

export const GREETINGS: Line[] = [
  L("Halo! Santai aja, lihat-lihat dulu.", "Hi! Make yourself at home."),
  L("Eh, ada tamu.", "Oh, we have a guest."),
  L("Jangan lupa mampir ke ruang kerja ya.", "Don't forget to check out the workroom."),
  L("Psst, musiknya bisa dinyalain di atas.", "Psst, you can turn on the music up top."),
  L("Mau minum? Kulkasnya di sana.", "Want a drink? The fridge is over there."),
];

/* ---------- Tidur ---------- */

export const SLEEP_TALK: Line[] = [
  L("Zzz... lima menit lagi...", "Zzz... five more minutes..."),
  L("Mmh... jangan berisik...", "Mmh... keep it down..."),
  L("Zzz... deploy... berhasil...", "Zzz... deploy... succeeded..."),
  L("...besok aja ya...", "...tomorrow, okay..."),
];

export const WAKE_LINES: Line[] = [
  L("Hoaam... udah pagi?", "Yawn... is it morning already?"),
  L("Siapa yang matiin alarm?", "Who turned off the alarm?"),
  L("Kopi. Butuh kopi.", "Coffee. Need coffee."),
  L("Wah, ketiduran.", "Oops, I dozed off."),
];

/** Pemilik rumah pamit ke kamar saat malam. */
export const BEDTIME: Line[] = [
  L("Udah malem, aku ke kamar dulu ya.", "It's late, I'm heading to my room."),
  L("Ngantuk. Lanjut besok aja.", "Sleepy. Let's continue tomorrow."),
  L("Waktunya tidur. Kodenya kabur nggak ke mana.", "Bedtime. The code isn't going anywhere."),
  L("Aku tidur dulu, pesannya kubalas besok pagi.", "Off to bed, I'll reply to messages in the morning."),
];

/** Pemilik rumah kembali ke ruangan di pagi hari. */
export const MORNING_BACK: Line[] = [
  L("Pagi! Lanjut kerja.", "Morning! Back to work."),
  L("Udah mandi, udah ngopi. Gas.", "Showered, caffeinated. Let's go."),
  L("Pagi! Ada yang bisa kubantu?", "Good morning, anything I can help with?"),
  L("Pagi! Semalam mimpi bug, untung cuma mimpi.", "Morning! Dreamt about a bug, glad it was just a dream."),
];

/* ---------- Kamar Rizky ---------- */

export const BEDROOM_NIGHT: Line[] = [
  L("Alarm jam enam. Oke.", "Alarm at six. Okay."),
  L("Satu episode lagi... eh, nggak deh, tidur.", "One more episode... no, sleep."),
  L("Selamat malam, rumah.", "Good night, house."),
  L("Besok mau ngerjain apa ya... ah, besok aja mikirnya.", "What's on tomorrow... eh, I'll think tomorrow."),
];

export const BEDROOM_MORNING: Line[] = [
  L("Hoaam... pagi!", "Yawn... morning!"),
  L("Rapihin kasur dulu, biar produktif.", "Make the bed first, stay productive."),
  L("Cek HP... nggak ada bug darurat. Aman.", "Checking phone... no urgent bugs. Nice."),
  L("Hari ini pasti lancar.", "Today's going to go smoothly."),
];

export const BEDROOM_GUITAR: Line[] = [
  L("Baru bisa tiga kunci, tapi pede.", "I only know three chords, but I'm confident."),
  L("Genjrang genjreng...", "Strum strum..."),
  L("Lagu ini cocok buat nunggu build selesai.", "Perfect song for waiting on a build."),
];

export const BEDROOM_GAME: Line[] = [
  L("Satu ronde aja. Beneran satu.", "Just one round. Really, one."),
  L("Main dulu bentar, otak butuh istirahat.", "Quick game, my brain needs a break."),
  L("Yah kalah. Balik ngoding aja deh.", "Lost. Back to coding then."),
];

export const BEDROOM_MISC: Line[] = [
  L("Push up sepuluh kali dulu.", "Ten push-ups first."),
  L("Kaos ini atau kemeja ya? Ada meeting klien.", "This tee or a shirt? Client meeting today."),
  L("Posternya miring dikit, biarin.", "The poster's a bit crooked. Whatever."),
  L("Kamar ini tempat ide-ide aneh lahir.", "This room is where the weird ideas are born."),
];

/* ---------- Ruang kerja (proyek) ---------- */

export type ProjectInfo = { title: string; tags: string[] };

export function projectTalks(projects: ProjectInfo[]): Talk[] {
  const p = projects[Math.floor(Math.random() * projects.length)];
  const tags = p.tags.slice(0, 3).join(", ");
  return [
    [
      ["a", L("Permisi, ini lagi ngerjain apa?", "Excuse me, what are you working on?")],
      ["me", L(`Lagi lihat ${p.title}.`, `Looking over ${p.title}.`)],
      ["a", L("Bisa dicoba langsung?", "Can I try it?")],
      ["me", L("Bisa, ada tombol demo di layar.", "Sure, there's a demo button on the screen.")],
    ],
    [
      ["a", L(`${p.title} itu pakai teknologi apa?`, `What's ${p.title} built with?`)],
      ["me", L(`${tags}, sama beberapa lainnya.`, `${tags}, plus a few others.`)],
      ["a", L("Wah, saya cuma ngerti Excel.", "I only know Excel, honestly.")],
      ["me", L("Haha, nggak apa-apa. Yang penting jalan.", "Haha, that's fine. As long as it works.")],
    ],
    [
      ["a", L("Usaha saya butuh yang mirip begini.", "My business needs something like this.")],
      ["me", L("Boleh. Kebutuhannya apa aja?", "Sure. What do you need?")],
      ["a", L("Nanti saya kirim pesan aja ya.", "I'll send you a message later.")],
      ["me", L("Siap, ditunggu.", "Great, looking forward to it.")],
    ],
    [
      ["a", L(`Proyeknya ${projects.length} aja nih?`, `Only ${projects.length} projects?`)],
      ["me", L("Yang dipajang dulu. Sisanya masih dikerjain.", "These are the ones on display. More are in progress.")],
      ["a", L("Oke, saya tunggu yang berikutnya.", "Okay, I'll wait for the next one.")],
    ],
    [
      ["a", L("Kok layarnya geser sendiri?", "Why is the screen moving by itself?")],
      ["me", L("Saya yang geser. Mas juga bisa geser sendiri kok.", "That's me scrolling. You can swipe it too.")],
    ],
    [
      ["a", L("Kodenya boleh dilihat?", "Can I see the code?")],
      ["me", L("Boleh, ada tombol Kode di tiap proyek.", "Sure, every project has a Code button.")],
      ["a", L("Transparan juga ya.", "Nice and transparent.")],
    ],
  ];
}

export const PROJECT_SOLO: Line[] = [
  L("Hmm, bagian ini bisa dirapikan lagi.", "Hmm, this part could be cleaner."),
  L("Tes dulu sebelum push.", "Test before pushing."),
  L("Proyek berikutnya bisa punyamu, lho.", "The next project could be yours."),
];

/* ---------- Galeri (skill) ---------- */

export function skillTalks(skills: string[]): Talk[] {
  const s = () => skills[Math.floor(Math.random() * skills.length)];
  const one = s();
  const two = s();
  return [
    [
      ["a", L(`Eh, dia bisa ${one} juga?`, `Wait, he knows ${one} too?`)],
      ["b", L("Bisa. Lihat aja, dipajang semua.", "Yep. Look, it's all on the wall.")],
      ["a", L("Pamer banget ya.", "What a show-off.")],
      ["b", L("Namanya juga galeri, hahaha.", "It's a gallery, haha.")],
    ],
    [
      ["a", L(`Ada ${skills.length} bingkai. Kapan masangnya?`, `${skills.length} frames. When did he hang all these?`)],
      ["b", L("Satu-satu, tiap belajar hal baru.", "One at a time, whenever he learns something new.")],
    ],
    [
      ["a", L(`${two} itu buat apa sih?`, `What's ${two} even for?`)],
      ["b", L("Biar aplikasinya jalan, pokoknya.", "Makes the app work, basically.")],
      ["a", L("Jawabanmu nggak membantu.", "That's not helpful.")],
      ["b", L("Tanya Rizky aja deh.", "Just ask Rizky.")],
    ],
    [
      ["a", L("Bingkai yang itu miring.", "That frame is crooked.")],
      ["b", L("Biarin. Biar kelihatan artsy.", "Leave it. Looks artsy.")],
    ],
    [
      ["a", L(`Kalau proyekku pakai ${one}, dia bisa pegang?`, `If my project uses ${one}, can he handle it?`)],
      ["b", L("Bisa. Kirim pesan aja di teras.", "Sure. Leave a message at the porch.")],
    ],
  ];
}

/* ---------- Ruang sertifikat ---------- */

export function certTalks(certs: string[]): Talk[] {
  const c = certs[Math.floor(Math.random() * certs.length)];
  return [
    [
      ["a", L(`Kok sertifikatnya cuma ${certs.length}?`, `Why only ${certs.length} certificates?`)],
      ["b", L("Nggak bimbel lagi apa nggak ada duit, hahaha.", "No more courses, or no more money, haha.")],
      ["a", L("Hush. Yang penting skill-nya kepake.", "Shh. What matters is the skill.")],
      ["b", L("Iya iya, bercanda.", "Yeah yeah, just kidding.")],
    ],
    [
      ["a", L(`Ini yang ${c}, ya?`, `Is this the ${c} one?`)],
      ["b", L("Iya. Sampai dipigura segala.", "Yep. He even framed it.")],
      ["a", L("Bangga banget kayaknya.", "He must be really proud.")],
    ],
    [
      ["a", L("Nanti kalau nambah, dindingnya muat?", "If he gets more, will they fit?")],
      ["b", L("Tenang, pakunya masih banyak.", "Relax, we have plenty of nails.")],
    ],
    [
      ["a", L("Bootcamp itu berat lho.", "Bootcamps are tough, you know.")],
      ["b", L("Pantes dulu dia jarang keluar kamar.", "That explains why he never left his room.")],
      ["a", L("Sekarang juga jarang sih.", "He still barely does, honestly.")],
    ],
  ];
}

/* ---------- Teras (kontak) ---------- */

export const CONTACT_TALKS: Talk[] = [
  [
    ["a", L("Kamu mau ngajak Rizky kerja bareng?", "You want to work with Rizky?")],
    ["b", L("Iya, tapi malu mau ngomong.", "Yeah, but I'm shy about asking.")],
    ["a", L("Ah, isi form di sebelah aja. Gampang.", "Just fill in the form over there. Easy.")],
  ],
  [
    ["a", L("Ayo ayo, hubungi dia sekarang!", "Come on, reach out now!")],
    ["b", L("Iya iya, sabar dong.", "Okay okay, hold on.")],
  ],
  [
    ["a", L("Balasnya cepat nggak sih?", "Does he reply quickly?")],
    ["b", L("Biasanya cepat. Kecuali lagi tidur.", "Usually. Unless he's asleep.")],
  ],
  [
    ["a", L("Dia nerima full-time atau freelance?", "Full-time or freelance?")],
    ["b", L("Dua-duanya, katanya.", "Both, apparently.")],
    ["a", L("Mantap.", "Nice.")],
  ],
  [
    ["a", L("Kotak suratnya kosong.", "The mailbox is empty.")],
    ["b", L("Makanya, kirim pesan dong!", "So send him a message!")],
  ],
];

export const CONTACT_SOLO: Line[] = [
  L("Jangan cuma lihat-lihat, sapa dulu dong!", "Don't just browse, say hi!"),
  L("Belum ada surat hari ini...", "No mail today..."),
  L("Ditunggu pesannya ya.", "Looking forward to your message."),
];

/* ---------- Rizky cuma satu: tamu mencarinya, dia pamit pindah ruangan ---------- */

type Place = { id: string; en: string };

export const ASK_WHERE: Line[] = [
  L("Rizky-nya ada?", "Is Rizky around?"),
  L("Eh, Rizky ke mana ya?", "Hey, where's Rizky?"),
  L("Mau ketemu Rizky, dia di mana?", "I'm looking for Rizky, where is he?"),
];
export const ANSWER_AWAY = (place: Place): Line[] => [
  L(`Lagi di ${place.id}, kayaknya.`, `He's in ${place.en}, I think.`),
  L(`Tadi kulihat ke ${place.id}.`, `I saw him head to ${place.en}.`),
];
export const ANSWER_ASLEEP: Line[] = [
  L("Lagi tidur. Nanti aja, jangan dibangunin.", "He's asleep. Let's not wake him."),
  L("Udah tidur dia. Besok aja ya.", "He's already asleep. Tomorrow, okay?"),
];
export const WAIT_ALONE: Line[] = [
  L("Rizky lagi nggak di sini. Tunggu bentar deh.", "Rizky's not here. I'll wait a bit."),
  L("Hmm, Rizky-nya belum ke sini.", "Hmm, Rizky hasn't come by yet."),
];
export const SHUSH: Line[] = [
  L("Ssst, Rizky udah tidur.", "Shh, Rizky's asleep."),
  L("Pelan-pelan, ada yang tidur.", "Keep it down, someone's sleeping."),
  L("Kecilin suaranya dong.", "Turn it down a little."),
];
/** Rizky pamit dari ruangan, menyebut tujuannya. */
export const LEAVE_TO = (place: Place): Line[] => [
  L(`Aku ke ${place.id} dulu ya.`, `I'm heading to ${place.en}.`),
  L(`Bentar, mau ke ${place.id}.`, `Be right back, going to ${place.en}.`),
];
/** Rizky masuk ke ruangan. */
export const HOST_ARRIVE: Line[] = [
  L("Halo! Ada yang bisa kubantu?", "Hi! Anything I can help with?"),
  L("Aku di sini. Santai aja.", "I'm here. Make yourself at home."),
  L("Eh, ada yang nyariin aku?", "Oh, was someone looking for me?"),
];
