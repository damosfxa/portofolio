import type { Line } from "@/components/game/scene";

// Jadwal harian Rizky di kamarnya, mengikuti jam pengunjung.
// Waktu sholat memakai perkiraan waktu Jakarta (WIB); jam tidur berubah tiap hari tapi tetap
// sama untuk tanggal yang sama, jadi pengunjung yang memuat ulang halaman melihat jadwal yang konsisten.

const L = (id: string, en: string): Line => ({ id, en });

export type PrayerId = "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";

export const PRAYERS: { id: PrayerId; at: number; name: string }[] = [
  { id: "subuh", at: 4 * 60 + 35, name: "Subuh" },
  { id: "dzuhur", at: 11 * 60 + 55, name: "Dzuhur" },
  { id: "ashar", at: 15 * 60 + 15, name: "Ashar" },
  { id: "maghrib", at: 17 * 60 + 55, name: "Maghrib" },
  { id: "isya", at: 19 * 60 + 10, name: "Isya" },
];
/** Lama jendela sholat (menit) sejak azan. */
const PRAYER_WINDOW = 20;
const WAKE = 4 * 60 + 20;
// Jam tidur yang mungkin: kadang cepat, kadang begadang karena proyek atau gim.
const BEDTIMES = [20 * 60 + 30, 21 * 60, 21 * 60 + 30, 22 * 60, 22 * 60 + 30, 23 * 60, 24 * 60 + 30, 25 * 60 + 30];
const NAP = { from: 13 * 60 + 15, to: 14 * 60 + 15 };

export type Slot = "pagi" | "siang" | "sore" | "malam" | "begadang";

const minutes = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Hari "rutinitas": sebelum jam bangun masih dihitung hari kemarin. */
export function dayKey(d: Date) {
  const day = new Date(d);
  if (minutes(d) < WAKE) day.setDate(day.getDate() - 1);
  return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
}

// Angka acak yang tetap untuk satu tanggal.
function seeded(key: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export function bedtime(d: Date) {
  return BEDTIMES[Math.floor(seeded(dayKey(d), 1) * BEDTIMES.length)];
}

// Menit dihitung dari jam 12 siang, supaya rentang tidur yang melewati tengah malam mudah dibandingkan.
const fromNoon = (m: number) => (m - 720 + 1440) % 1440;

export function isSleepTime(d: Date) {
  const m = fromNoon(minutes(d));
  return m >= fromNoon(bedtime(d) % 1440) && m < fromNoon(WAKE);
}

export function isNapTime(d: Date) {
  const m = minutes(d);
  return seeded(dayKey(d), 2) < 0.5 && m >= NAP.from && m < NAP.to;
}

/** Sholat yang sedang masuk waktunya (dalam 20 menit sejak azan). */
export function duePrayer(d: Date) {
  const m = minutes(d);
  return PRAYERS.find((p) => m >= p.at && m < p.at + PRAYER_WINDOW) ?? null;
}

export function isyaPassed(d: Date) {
  const m = minutes(d);
  return m >= PRAYERS[4].at || m < WAKE;
}

export function slotOf(d: Date): Slot {
  const m = minutes(d);
  if (m >= 22 * 60 || m < WAKE) return "begadang";
  if (m < 8 * 60) return "pagi";
  if (m < 15 * 60) return "siang";
  if (m < 18 * 60) return "sore";
  return "malam";
}

/* ---------- Kalimat ---------- */

export const WAKE_UP: Line[] = [
  L("Alhamdulillah, bangun juga.", "Alhamdulillah, I'm up."),
  L("Hoaam... jam berapa ini?", "Yawn... what time is it?"),
  L("Bismillah, hari baru.", "Bismillah, a new day."),
  L("Mimpi lagi ngoding. Kebawa sampai tidur.", "Dreamt about coding again."),
];

export const PRAY_GO: Record<PrayerId, Line> = {
  subuh: L("Subuh dulu, biar berkah harinya.", "Fajr first, to start the day right."),
  dzuhur: L("Udah Dzuhur, sholat dulu ah.", "It's Dhuhr, time to pray."),
  ashar: L("Ashar dulu, kerjaan bisa nunggu.", "Asr first, work can wait."),
  maghrib: L("Maghrib, sholat dulu.", "Maghrib, prayer time."),
  isya: L("Isya dulu sebelum lanjut.", "Isha before anything else."),
};

export const PRAY_DONE: Line[] = [
  L("Alhamdulillah.", "Alhamdulillah."),
  L("Hati jadi adem.", "Feels calm now."),
  L("Oke, lanjut lagi.", "Okay, back to it."),
];

export const DZIKIR: Line[] = [L("Subhanallah...", "Subhanallah..."), L("Alhamdulillah...", "Alhamdulillah..."), L("Allahu akbar...", "Allahu akbar...")];

export const MANDI_GO: Line[] = [
  L("Mandi dulu ah, gerah.", "Shower time, it's hot."),
  L("Mandi biar seger.", "A quick shower to freshen up."),
  L("Bau kerja keras. Mandi dulu.", "Smells like hard work. Shower first."),
];
export const MANDI_BACK: Line[] = [L("Seger!", "So fresh!"), L("Wangi lagi.", "Smelling good again."), L("Airnya dingin banget tadi.", "The water was freezing.")];

export const EAT_GO: Record<Slot, Line> = {
  pagi: L("Sarapan dulu.", "Breakfast first."),
  siang: L("Makan siang dulu, laper.", "Lunch time, I'm starving."),
  sore: L("Ngemil sore dulu.", "Afternoon snack."),
  malam: L("Makan malam, yuk.", "Dinner time."),
  begadang: L("Laper tengah malam. Mi instan aja.", "Midnight hunger. Instant noodles it is."),
};
export const EAT_LINES: Line[] = [
  L("Enak banget ini.", "This is so good."),
  L("Nasi goreng terbaik sedunia.", "Best fried rice in the world."),
  L("Makan sambil lihat to-do list.", "Eating while checking my to-do list."),
];

export const GAME_LINES: Line[] = [
  L("Satu ronde aja. Beneran satu.", "Just one round. Really, one."),
  L("Main dulu bentar, otak butuh istirahat.", "Quick game, my brain needs a break."),
  L("Yah kalah. Balik ngoding aja deh.", "Lost. Back to coding then."),
  L("Menang! Tim lawan kurang latihan.", "Won! The other team needs practice."),
];

export const GOOGLE_LINES: Line[] = [
  L("Googling: cara center div... lagi.", "Googling: how to center a div... again."),
  L("Nyari error yang sama kayak kemarin, nih.", "Searching the same error as yesterday."),
  L("Baca dokumentasi terbaru dulu, ah.", "Reading the latest docs first."),
  L("Nyari referensi desain buat klien.", "Looking for design references for a client."),
  L("Googling: resep mi instan level dewa.", "Googling: god-tier instant noodle recipe."),
];

export const PROJECT_LINES: Line[] = [
  L("Cek project klien dulu, ah.", "Checking a client project."),
  L("Fitur baru hampir jadi.", "The new feature is almost done."),
  L("Review kode dulu, rapihin dikit.", "Reviewing code, tidying up a bit."),
  L("Deploy ke staging... aman.", "Deploying to staging... all good."),
  L("Bales chat klien dulu.", "Replying to a client first."),
];

export const LATE_LINES: Line[] = [
  L("Deadline besok... ngopi dulu.", "Deadline tomorrow... coffee first."),
  L("Dikit lagi beres, terus tidur.", "Almost done, then bed."),
  L("Mata udah berat, bug-nya belum ketemu.", "Eyes are heavy, bug still hiding."),
  L("Satu match lagi, terus tidur. Janji.", "One more match, then bed. Promise."),
];

export const OUTFIT_LINE = (name: { id: string; en: string }): Line =>
  L(`Pakai ${name.id} ah.`, `Wearing the ${name.en}.`);

export const GUITAR_GO: Line[] = [
  L("Main gitar bentar.", "Quick guitar break."),
  L("Ada lagu baru nih, coba ah.", "Got a new song, let's try it."),
];

/** Rizky memperkenalkan lagu yang akan dinyanyikan. */
export const SONG_INTRO = (title: string): Line => L(`Lagu "${title}" ya.`, `This one's "${title}".`);
export const SONG_ENCORE = (title: string): Line => L(`Satu lagi: "${title}"!`, `One more: "${title}"!`);

export const FRIEND_INVITE: Line[] = [
  L("Sini ke kamar! Nyanyi bareng.", "Come to my room! Let's sing."),
  L("Main gitar yuk, di kamarku.", "Let's play guitar in my room."),
];
export const FRIEND_ARRIVE: Line[] = [
  L("Siap! Lagu yang kemarin ya?", "Sure! The one from yesterday?"),
  L("Wah, kamarnya rapi juga.", "Oh, your room is tidy."),
  L("Aku yang tepuk tangan aja.", "I'll just clap along."),
];
export const FRIEND_AFTER: Line[] = [
  L("Mantap! Kapan-kapan rekaman.", "Nice! Let's record it someday."),
  L("Suaramu lumayan juga.", "Your voice isn't bad."),
  L("Udah ah, aku pulang dulu.", "Alright, I'm heading out."),
];

export const WORKOUT_LINES: Line[] = [
  L("Push up dua puluh kali.", "Twenty push-ups."),
  L("Biar nggak pegel kebanyakan duduk.", "Too much sitting, gotta move."),
  L("Satu... dua... tiga... capek.", "One... two... three... tired."),
];

export const PHONE_LINES: Line[] = [
  L("Cek grup... ramai banget.", "Checking the group chat... so busy."),
  L("Ada email klien masuk.", "A client email just came in."),
  L("Scroll bentar, terus kerja lagi.", "Quick scroll, then back to work."),
];

export const NAP_GO: Line[] = [L("Tidur siang bentar ah.", "Quick afternoon nap."), L("Lima belas menit aja.", "Just fifteen minutes.")];
export const DOZE_WAKE: Line[] = [L("Eh! Ketiduran.", "Huh! I dozed off."), L("Lho, kok gelap... oh mata merem.", "Why is it dark... oh, eyes closed.")];
export const BED_GO: Line[] = [
  L("Waktunya tidur. Besok lanjut.", "Bedtime. More tomorrow."),
  L("Alarm jam empat. Oke.", "Alarm at four. Okay."),
  L("Selamat malam, rumah.", "Good night, house."),
];
export const LEAVE_WORK: Line[] = [
  L("Ke ruang kerja dulu.", "Off to the workroom."),
  L("Ada tamu kayaknya, cek dulu.", "Sounds like a guest, let me check."),
];
