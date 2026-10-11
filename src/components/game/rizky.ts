// Rizky hanya ada satu: modul ini menentukan dia sedang berada di ruangan mana, mengikuti jam pengunjung.
// Jadwalnya berjalan terus walau ruangannya sedang tidak dilihat; setiap ruangan tinggal mengikuti.
//
// - Jam tidur / tidur siang, waktu sholat, dan malam hari: di kamar.
// - Siang: berpindah-pindah (ruang kerja, ruang tamu, kamar, galeri, ruang sertifikat, teras).

import { dayKey, duePrayer, isNapTime, isSleepTime, type PrayerId } from "@/content/routine";

/** Id ruangan = id <section> di halaman. */
export type HouseRoom = "hero" | "projects" | "skills" | "certificates" | "bedroom" | "contact";

export const ROOM_NAME: Record<HouseRoom, { id: string; en: string }> = {
  hero: { id: "ruang tamu", en: "the living room" },
  projects: { id: "ruang kerja", en: "the workroom" },
  skills: { id: "galeri", en: "the gallery" },
  certificates: { id: "ruang sertifikat", en: "the certificate room" },
  bedroom: { id: "kamar", en: "his room" },
  contact: { id: "teras", en: "the porch" },
};

// Peluang Rizky berada di tiap ruangan pada siang hari.
const DAY_WEIGHTS: [HouseRoom, number][] = [
  ["projects", 30],
  ["bedroom", 24],
  ["hero", 20],
  ["contact", 10],
  ["skills", 8],
  ["certificates", 8],
];

/* ---------- Sholat yang sudah dikerjakan (dipakai bersama kamar) ---------- */

const PRAYED_KEY = "rr_prayed";
export function prayedSet(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(PRAYED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function savePrayed(id: PrayerId) {
  const set = prayedSet();
  set.add(`${dayKey(new Date())}:${id}`);
  try {
    sessionStorage.setItem(PRAYED_KEY, JSON.stringify([...set].slice(-20)));
  } catch {}
}
export function markPrayed(id: PrayerId) {
  savePrayed(id);
  tick();
}
export const hasPrayed = (id: PrayerId) => prayedSet().has(`${dayKey(new Date())}:${id}`);

/* ---------- Jadwal ---------- */

const houseNight = (d: Date) => d.getHours() >= 18 || d.getHours() < 6;

/** Rizky sedang tidur (malam atau tidur siang). */
export const rizkyAsleep = (d = new Date()) => isSleepTime(d) || isNapTime(d);

/** Ruangan yang wajib: kamar saat tidur, saat waktu sholat (bila belum sholat), dan saat malam. */
function requiredRoom(d: Date): HouseRoom | null {
  if (rizkyAsleep(d)) return "bedroom";
  const due = duePrayer(d);
  if (due && !hasPrayed(due.id)) return "bedroom";
  if (houseNight(d)) return "bedroom";
  return null;
}

function pickDayRoom(current: HouseRoom | null): HouseRoom {
  const pool = DAY_WEIGHTS.filter(([r]) => r !== current);
  let n = Math.random() * pool.reduce((s, [, w]) => s + w, 0);
  for (const [room, w] of pool) if ((n -= w) <= 0) return room;
  return pool[0][0];
}

type State = { room: HouseRoom; since: number; until: number };
let state: State | null = null;
const listeners = new Set<() => void>();
let timer: number | null = null;
let wasForced = false;

// Lama sholat yang dianggap selesai bila kamarnya tidak sedang dilihat (adegan sholat di kamar sekitar 1 menit).
const PRAYER_MS = 90_000;

function tick() {
  const now = new Date();
  // Rizky sudah cukup lama di kamar saat waktu sholat: anggap sudah sholat walau adegannya tidak ditonton,
  // supaya ia tidak tertahan di kamar sepanjang waktu sholat.
  const due = duePrayer(now);
  if (due && !hasPrayed(due.id) && state?.room === "bedroom" && now.getTime() - state.since > PRAYER_MS) savePrayed(due.id);
  const forced = requiredRoom(now);
  const t = now.getTime();
  // Urusan wajib (sholat, tidur, malam) baru selesai: tak lama kemudian Rizky beraktivitas di ruangan lain.
  if (wasForced && !forced && state) state.until = Math.min(state.until, t + 10_000 + Math.random() * 20_000);
  wasForced = !!forced;
  let next: HouseRoom | null = null;
  if (!state) next = forced ?? pickDayRoom(null);
  else if (forced && state.room !== forced) next = forced;
  else if (!forced && t >= state.until) next = pickDayRoom(state.room);
  if (!next) return;
  // Saat halaman baru dibuka, anggap Rizky sudah lama di ruangannya (tidak perlu adegan masuk).
  const since = state ? t : t - 60_000;
  state = { room: next, since, until: t + 70_000 + Math.random() * 90_000 };
  listeners.forEach((l) => l());
}

function ensure() {
  if (typeof window === "undefined") return;
  if (!state) tick();
  if (timer === null) timer = window.setInterval(tick, 3000);
}

export const rizky = {
  /** Ruangan tempat Rizky berada sekarang. */
  room(): HouseRoom {
    ensure();
    return state?.room ?? "bedroom";
  },
  /** Sudah berapa ms Rizky berpindah ke ruangan sekarang. */
  sinceMs(): number {
    ensure();
    return state ? Date.now() - state.since : Infinity;
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
