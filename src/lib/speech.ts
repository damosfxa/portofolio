// Suara obrolan tokoh memakai mesin suara bawaan browser (Web Speech API).
// Setiap tokoh punya nada dan kecepatan bicara sendiri, dan bila tersedia, suara pria/wanita yang sesuai.
// Bila browser tidak punya suara untuk bahasa yang dipakai, fungsi mengembalikan null (pemanggil memakai blip).

export type VoiceProfile = { female: boolean; pitch: number; rate: number };

// Petunjuk nama suara pria/wanita yang umum di Windows, macOS, Android, dan Chrome.
const FEMALE_HINT = /female|wanita|gadis|damayanti|zira|samantha|karen|moira|tessa|susan|hazel|aria|jenny|sonia|libby|ava|allison|victoria|fiona|emma|michelle|ana|natasha|clara|jane|nancy/i;
const MALE_HINT = /male|pria|ardi|andika|david|mark|daniel|alex|fred|george|guy|ryan|thomas|james|christopher|eric|andrew|brian|roger|steffan|davis|tony|william/i;

let cachedVoices: SpeechSynthesisVoice[] = [];
function voices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length) cachedVoices = list;
  return cachedVoices;
}
// Daftar suara di Chrome dimuat belakangan; panggil sekali supaya siap saat dibutuhkan.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  voices();
  window.speechSynthesis.addEventListener?.("voiceschanged", voices);
}

// Hanya suara yang terdengar alami: suara "Natural/Online" (Edge, Windows 11), "Enhanced/Premium" (Apple),
// atau mesin suara Android. Suara desktop lama seperti "Google Bahasa Indonesia" atau "Microsoft Zira" terlalu kaku.
const NATURAL = /natural|neural|online|premium|enhanced/i;
const isAndroid = () => typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

function pickVoice(lang: "id" | "en", female: boolean, seed: number) {
  const all = voices().filter(
    (v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang) && (NATURAL.test(v.name) || isAndroid()),
  );
  if (!all.length) return null;
  const gendered = all.filter((v) => (female ? FEMALE_HINT.test(v.name) : MALE_HINT.test(v.name) && !FEMALE_HINT.test(v.name)));
  const pool = gendered.length ? gendered : all;
  // Utamakan suara lokal (lebih cepat, tanpa internet), tapi tetap bervariasi antar tokoh.
  const local = pool.filter((v) => v.localService);
  const final = local.length ? local : pool;
  return final[seed % final.length];
}

/** Bersihkan teks gelembung supaya enak dibacakan. */
const clean = (text: string) => text.replace(/[♪♥✨…]/g, " ").replace(/\.{2,}/g, ", ").replace(/\s+/g, " ").trim();

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Bacakan satu kalimat. Mengembalikan Promise yang selesai saat kalimat selesai dibaca,
 * atau null bila tidak bisa (tidak ada suara bahasa ini, atau tokoh lain sedang bicara).
 */
export function speak(text: string, lang: "id" | "en", profile: VoiceProfile, volume: number, seed: number): Promise<void> | null {
  if (!canSpeak() || volume <= 0) return null;
  const synth = window.speechSynthesis;
  // Satu suara dalam satu waktu: kalau sedang ada yang bicara, kalimat ini cukup tampil sebagai teks + blip.
  if (synth.speaking || synth.pending) return null;
  const voice = pickVoice(lang, profile.female, seed);
  const words = clean(text);
  if (!voice || !words) return null;
  const u = new SpeechSynthesisUtterance(words);
  u.voice = voice;
  u.lang = voice.lang;
  // Suara natural terdengar aneh bila nadanya diubah jauh; perbedaan antar tokoh dibuat halus saja.
  u.pitch = 1 + (profile.pitch - 1) * 0.35;
  u.rate = 1 + (profile.rate - 1) * 0.5;
  u.volume = Math.min(1, volume);
  return new Promise<void>((resolve) => {
    const done = () => {
      window.clearTimeout(guard);
      resolve();
    };
    // Pengaman bila event "end" tidak pernah datang (terjadi di beberapa browser).
    const guard = window.setTimeout(done, words.length * 120 + 3000);
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
