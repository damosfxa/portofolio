"use client";

import { useSyncExternalStore } from "react";
import type { Art, Palette } from "./sprite";

// Lemari baju Rizky: setiap baju mengganti topi/rambut, model atasan, dan warna.
// Baju yang sedang dipakai disimpan di satu tempat, sehingga Rizky di semua ruangan berpakaian sama.

export type OutfitId = "kaos" | "hoodie" | "kemeja" | "flanel" | "koko" | "piyama" | "handuk" | "olahraga";

type Hat = "top" | "peci" | "hair" | "cap" | "nightcap";
type Torso = "tee" | "hoodie" | "shirt" | "koko" | "stripes" | "towel";

const HATS: Record<Hat, string[]> = {
  top: ["....HHHH....", "....HHHH....", "....AAAA....", "..HHHHHHHH.."],
  peci: ["............", "............", "...PPPPPP...", "..PPPPPPPP.."],
  hair: ["............", "............", "...RRRRRR...", "..RRRRRRRR.."],
  cap: ["............", "...CCCCCC...", "..CCCCCCCC..", "..CCCCCCCCC."],
  nightcap: ["......WW....", ".....CCC....", "....CCCCC...", "..CCCCCCCC.."],
};

const FACE = ["...SSSSSS...", "..GLGSSGLG..", "..SSSSSSSS..", "...SSMMSS...", "....SSSS...."];
// Mata terpejam: lensa kacamata diisi warna kulit, yang terlihat hanya garis bingkainya.
const FACE_CLOSED = ["...SSSSSS...", "..GSGSSGSG..", "..SSSSSSSS..", "...SSMMSS...", "....SSSS...."];

const TORSOS: Record<Torso, string[]> = {
  tee: ["..DBBBBBBD..", ".DBBBYYBBBD.", ".SDBBYYBBDS.", ".SBBBBBBBBS.", "..BBBBBBBB.."],
  hoodie: ["..DBBWWBBD..", ".DBBBWWBBBD.", ".DDBBBBBBDD.", ".SDBDDDDBDS.", "..BBDDDDBB.."],
  shirt: ["..DWBBBBWD..", ".DBBWBBWBBD.", ".SDBBYBBBDS.", ".SBBBYBBBBS.", "..BBBBBBBB.."],
  koko: ["..BBYYYYBB..", ".BBBBYYBBBB.", ".SBBBYYBBBS.", ".SBBBYYBBBS.", "..BBBBBBBB.."],
  stripes: ["..DBBBBBBD..", ".DBDBDBDBBD.", ".SBDBDBDBBS.", ".SBDBDBDBDS.", "..BDBDBDBD.."],
  towel: ["..TTBBBBTT..", ".TTBBBBBBTT.", ".STBBBBBBTS.", ".SBBBBBBBBS.", "..BBBBBBBB.."],
};

const LEGS = {
  idle: ["..NNN..NNN..", "..OOO..OOO.."],
  a: [".NNN....NNN.", ".OOO....OOO."],
  b: ["...NNNNNN...", "...OOOOOO..."],
  sit: ["..NNNNNNNN..", "..OO....OO.."],
};

const BASE: Palette = {
  H: "#3B2A20", A: "#E0605A", S: "#F2C79A", G: "#2B1E16", L: "#9FD3FF", M: "#B54848",
  P: "#1E1E2A", R: "#2B1E16", C: "#E0605A", W: "#FFF8EC", T: "#FFFFFF",
  B: "#4F7CAC", D: "#3A5E86", Y: "#F2A33A", N: "#3B2A20", O: "#6B3A1F",
};
const SKIN = BASE.S;

export const OUTFITS: Record<OutfitId, { hat: Hat; torso: Torso; palette: Partial<Palette>; name: { id: string; en: string } }> = {
  kaos: { hat: "top", torso: "tee", palette: {}, name: { id: "kaos favorit", en: "favourite tee" } },
  hoodie: {
    hat: "hair", torso: "hoodie",
    palette: { B: "#3E6B4E", D: "#2C5039", W: "#E8E8E8", N: "#2B2B3B" },
    name: { id: "hoodie", en: "hoodie" },
  },
  kemeja: {
    hat: "top", torso: "shirt",
    palette: { B: "#E8E2D6", D: "#B8B0A0", W: "#FFFFFF", Y: "#3B2A20", N: "#2B2B3B", O: "#1E1E2A" },
    name: { id: "kemeja rapi", en: "neat shirt" },
  },
  flanel: {
    hat: "cap", torso: "shirt",
    palette: { B: "#C0392B", D: "#8E2A20", W: "#2B1E16", Y: "#FFF8EC", C: "#2B2B3B" },
    name: { id: "flanel", en: "flannel" },
  },
  koko: {
    hat: "peci", torso: "koko",
    palette: { B: "#FAF7F0", D: "#D9D2C3", Y: "#D4A93A", N: "#3E7A5E", O: SKIN },
    name: { id: "baju koko dan sarung", en: "koko shirt and sarong" },
  },
  piyama: {
    hat: "nightcap", torso: "stripes",
    palette: { B: "#A9CCE3", D: "#7FA7C4", N: "#A9CCE3", O: SKIN, C: "#4F7CAC", W: "#FFFFFF" },
    name: { id: "piyama", en: "pajamas" },
  },
  handuk: {
    hat: "hair", torso: "towel",
    palette: { B: "#F3EDE2", N: "#4F7CAC", O: SKIN },
    name: { id: "handuk", en: "towel" },
  },
  olahraga: {
    hat: "cap", torso: "tee",
    palette: { B: "#E0605A", D: "#B8443F", Y: "#FFFFFF", N: "#2B2B3B", O: "#FFFFFF", C: "#2B2B3B" },
    name: { id: "baju olahraga", en: "sportswear" },
  },
};

/** Baju sehari-hari yang dipilih saat ganti baju (koko, piyama, handuk punya waktunya sendiri). */
export const DAILY_OUTFITS: OutfitId[] = ["kaos", "hoodie", "kemeja", "flanel", "olahraga"];

/** Putar sprite 90 derajat berlawanan arah jarum jam. */
function rotate(art: Art): Art {
  const h = art.length;
  const w = Math.max(...art.map((r) => r.length));
  return Array.from({ length: w }, (_, r) => Array.from({ length: h }, (_, c) => art[c][w - 1 - r] ?? ".").join("")).reverse();
}


/* Pose dilihat dari samping, semua menghadap ke kanan (arah kiblat), lebar 16 pixel. */
const SIDE_QIYAM: Art = [
  "................",
  "................",
  ".....PPPP.......",
  "....PPPPPP......",
  "....RSSSSS......",
  "....RSSGLG......",
  "....SSSSSSS.....",
  ".....SSSSM......",
  "......SSS.......",
  ".....BBBBB......",
  ".....BBYSS......",
  ".....BBBSS......",
  ".....BBBB.......",
  ".....NNNN.......",
  ".....NNNN.......",
  ".....OOOOO......",
];
const SIDE_RUKU: Art = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "...........RRP..",
  "..DBBBBBBBSSSPP.",
  "..BBBBBBBBSSSPP.",
  "..NNNNDBBBSGL...",
  "..NNNN.BS.SSM...",
  "..NNNN.SS.......",
  "..NNNN.S........",
  "..NNNN..........",
  "..NNNN..........",
  "..OOOOO.........",
];
const SIDE_SUJUD: Art = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "..NNNN..........",
  "..NNNNBB........",
  "..NNNNBBBB......",
  "..NNNN.BBBBB....",
  ".NNNNN..BBBBRRP.",
  ".NNNNN...BSSSSPP",
  "ONNNNN...SSGLSPP",
  "OOOOO....SSSSSS.",
];
const SIDE_DUDUK: Art = [
  "................",
  "................",
  "................",
  "................",
  ".....PPPP.......",
  "....PPPPPP......",
  "....RSSSSS......",
  "....RSSGLG......",
  "....SSSSSSS.....",
  ".....SSSSM......",
  "......SSS.......",
  ".....BBBBB......",
  ".....BBBBSS.....",
  "....NNNNNNNN....",
  "...ONNNNNNNN....",
  "...OOOO.........",
];
const SIDE_PUSHUP: Art = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  ".............RR.",
  "..........BRSSSS",
  "OONNNNNBBBBBSGLG",
  "OO........SSSSS.",
  "..........SS....",
  "..........SS....",
  "..........SS....",
];
const SIDE_PUSHDOWN: Art = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  ".............RR.",
  "..........BRSSSS",
  "OONNNNNBBBBBSGLG",
  "OO.......SSSSSS.",
];

export type MeArt = {
  idle: Art; a: Art; b: Art; sit: Art; lie: Art;
  /** Tidur telentang dengan kaki terbuka. */
  spread: Art;
  /** Gerakan sholat dan push up, dilihat dari samping (menghadap kanan). */
  qiyam: Art; ruku: Art; sujud: Art; duduk: Art; pushup: Art; pushdown: Art;
  /** Versi mata terpejam. */
  sitZ: Art; lieZ: Art; spreadZ: Art;
  palette: Palette;
};

const cache = new Map<OutfitId, MeArt>();

export function meArt(id: OutfitId): MeArt {
  const hit = cache.get(id);
  if (hit) return hit;
  const o = OUTFITS[id];
  const hat = HATS[o.hat];
  const torso = TORSOS[o.torso];
  const top = [...hat, ...FACE, ...torso];
  const topZ = [...hat, ...FACE_CLOSED, ...torso];
  const art: MeArt = {
    idle: [...top, ...LEGS.idle],
    a: [...top, ...LEGS.a],
    b: [...top, ...LEGS.b],
    sit: [...top, ...LEGS.sit],
    lie: rotate([...top, ...LEGS.idle]),
    spread: rotate([...top, ...LEGS.a]),
    qiyam: SIDE_QIYAM,
    ruku: SIDE_RUKU,
    sujud: SIDE_SUJUD,
    duduk: SIDE_DUDUK,
    pushup: SIDE_PUSHUP,
    pushdown: SIDE_PUSHDOWN,
    sitZ: [...topZ, ...LEGS.sit],
    lieZ: rotate([...topZ, ...LEGS.idle]),
    spreadZ: rotate([...topZ, ...LEGS.a]),
    palette: { ...BASE, ...o.palette } as Palette,
  };
  cache.set(id, art);
  return art;
}

/* ---------- Penyimpanan baju yang sedang dipakai ---------- */

const KEY = "rr_outfit";
let current: OutfitId = "kaos";
let loaded = false;
const listeners = new Set<() => void>();

const load = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = sessionStorage.getItem(KEY) as OutfitId | null;
    if (saved && saved in OUTFITS) current = saved;
    else current = DAILY_OUTFITS[Math.floor(Math.random() * DAILY_OUTFITS.length)];
  } catch {}
};

export function getOutfit(): OutfitId {
  load();
  return current;
}

export function setOutfit(id: OutfitId) {
  load();
  if (id === current) return;
  current = id;
  try {
    sessionStorage.setItem(KEY, id);
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Baju yang sedang dipakai Rizky; komponen ikut berganti saat baju diganti. */
export function useOutfit(): OutfitId {
  return useSyncExternalStore(subscribe, getOutfit, () => "kaos");
}
