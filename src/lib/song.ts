// Mengubah lirik menjadi not lagu: lirik dipecah per suku kata, lalu setiap suku kata mendapat satu nada
// yang cocok dengan akor gitar saat itu. Hasilnya dipakai foley untuk "menyanyikan" vokal sesuai liriknya.
import { SONGS, type Song } from "@/content/songs";

export type Vowel = "a" | "e" | "i" | "o" | "u";
export type Onset = "plosive" | "fricative" | "soft" | "none";
export type Syllable = { text: string; vowel: Vowel; onset: Onset };
export type SongNote = { step: number; len: number; midi: number; syl: Syllable };

const VOWELS = "aeiou";
const PLOSIVE = "ptkcbdgq";
const FRICATIVE = "sfhjzxv";

function cleanWord(word: string) {
  return word
    .toLowerCase()
    .replace(/ñ/g, "n")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

/** Pecah satu kata menjadi suku kata sederhana: konsonan awal + kelompok huruf vokal. */
function wordSyllables(raw: string, lang: Song["lang"]): Syllable[] {
  let w = cleanWord(raw);
  if (!w) return [];
  // Bahasa Inggris: "e" di akhir kata biasanya tidak dibaca (code, quite).
  if (lang === "en" && w.length > 3 && w.endsWith("e") && !VOWELS.includes(w[w.length - 2]) && /[aeiouy]/.test(w.slice(0, -1))) {
    w = w.slice(0, -1);
  }
  const isVowel = (ch: string, i: number) => VOWELS.includes(ch) || (ch === "y" && i > 0 && !VOWELS.includes(w[i - 1] ?? ""));
  const out: Syllable[] = [];
  let i = 0;
  let onset = "";
  while (i < w.length) {
    if (!isVowel(w[i], i)) {
      onset += w[i++];
      continue;
    }
    let nucleus = "";
    while (i < w.length && isVowel(w[i], i)) nucleus += w[i++];
    const first = onset[0] ?? "";
    out.push({
      text: onset + nucleus,
      vowel: (nucleus[0] === "y" ? "i" : nucleus[0]) as Vowel,
      onset: !first ? "none" : PLOSIVE.includes(first) ? "plosive" : FRICATIVE.includes(first) ? "fricative" : "soft",
    });
    onset = "";
  }
  if (onset && out.length) out[out.length - 1].text += onset;
  return out;
}

export function syllablesOf(line: string, lang: Song["lang"]) {
  return line.split(/\s+/).flatMap((w) => wordSyllables(w, lang));
}

// Nada-nada vokal (MIDI) per akor, dalam jangkauan suara pria (G3 sampai A4).
const CHORD_TONES: Record<string, number[]> = {
  C: [55, 60, 64, 67],
  G: [55, 59, 62, 67],
  Am: [57, 60, 64, 69],
  F: [57, 60, 65, 69],
};
const SCALE = [55, 57, 59, 60, 62, 64, 65, 67, 69];
const ROOT: Record<string, number> = { C: 60, G: 59, Am: 57, F: 60 };

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const nearest = (pool: number[], target: number) => pool.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));

/** Akor untuk birama ke-`bar` (0 atau 1) pada baris ke-`line`. */
export const chordAt = (song: Song, line: number, bar: number) => song.chords[(line * 2 + bar) % 4];

/** Not vokal satu baris lirik (2 birama = 16 ketukan 1/8, dua ketukan terakhir untuk napas). */
export function melodyOf(songIndex: number, line: number): SongNote[] {
  const song = SONGS[songIndex % SONGS.length];
  const syls = syllablesOf(song.lines[line % song.lines.length], song.lang);
  const n = syls.length;
  const slots = 14;
  // Panjang tiap suku kata: dasar 1/8, sisa ketukan untuk suku kata akhir dan beberapa tekanan.
  const lens = Array.from({ length: n }, () => (n > slots ? slots / n : 1));
  let extra = Math.max(0, slots - n);
  const tail = Math.min(extra, 3);
  lens[n - 1] += tail;
  extra -= tail;
  for (let i = 2; extra > 0 && n > 1; i = (i + 3) % (n - 1 || 1)) {
    lens[i % (n - 1)] += 1;
    extra -= 1;
  }
  // Dalam satu bagian (bait atau reff), baris 1 dan 3 memakai kontur yang sama supaya terasa seperti lagu sungguhan.
  // Reff mendapat kontur sendiri dan dinyanyikan sedikit lebih tinggi.
  const section = Math.floor(line / 4);
  const rand = rng(`${song.title}:${section}:${line % 2}`);
  let prev = section === 1 ? 65 : 62;
  let step = 0;
  return syls.map((syl, i) => {
    const bar = step < 8 ? 0 : 1;
    const chord = chordAt(song, line, bar);
    const strong = Number.isInteger(step) && step % 2 === 0;
    let midi: number;
    if (i === n - 1) {
      midi = line % 4 === 3 ? ROOT[chord] : nearest(CHORD_TONES[chord], prev + (rand() < 0.5 ? 2 : -1));
    } else if (strong) {
      midi = nearest(CHORD_TONES[chord], prev + Math.round((rand() - 0.5) * 6));
    } else {
      const idx = SCALE.indexOf(nearest(SCALE, prev));
      midi = SCALE[Math.min(SCALE.length - 1, Math.max(0, idx + (rand() < 0.5 ? -1 : 1)))];
    }
    prev = midi;
    const note = { step, len: lens[i], midi, syl };
    step += lens[i];
    return note;
  });
}
