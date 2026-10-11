import type { Art, Palette } from "./sprite";

// Perabot rumah pixel. Kebanyakan dibangun dengan fungsi supaya ukurannya pasti konsisten.

const rep = (c: string, n: number) => c.repeat(Math.max(0, n));
type Painter = (x: number, y: number) => string;
const paint = (w: number, h: number, fn: Painter): Art =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y)).join(""));

/* ---------- Sofa ---------- */
export const SOFA: Art = paint(34, 14, (x, y) => {
  const w = 34;
  if (y <= 5) return x === 0 || x === w - 1 || (y === 0 && (x === 1 || x === w - 2)) ? "." : "B";
  if (y <= 10) {
    if (x < 3 || x >= w - 3) return "A";
    if (y <= 7) return x === w / 2 ? "D" : "C";
    return "D";
  }
  if (y === 11) return "A";
  return x === 2 || x === 3 || x === w - 3 || x === w - 4 ? "L" : ".";
});
export const SOFA_PALETTE: Palette = { B: "#3A8C88", A: "#2C6B68", C: "#53A9A4", D: "#2C6B68", L: "#3B2A20" };
/** Tinggi dudukan sofa dari lantai, dalam pixel sprite (untuk karakter yang duduk). */
export const SOFA_SEAT = 6;

/* ---------- TV dan lemari ---------- */
const TV_W = 24;
const TV_H = 16;
function tv(on: boolean): Art {
  return paint(TV_W, TV_H, (x, y) => {
    if (y >= 14) {
      const half = y === 14 ? 3 : 5;
      return Math.abs(x - TV_W / 2 + 0.5) <= half ? "K" : ".";
    }
    if (x === 0 || y === 0 || x === TV_W - 1 || y === 13) return "K";
    if (!on) return x + y === 8 || x + y === 9 ? "G" : "S";
    // Layar menyala: langit, bukit, tanah, dan tokoh kecil.
    if (y >= 11) return "D";
    if (y >= 9 && Math.abs(x - 7) + (y - 9) * 2 <= 6) return "H";
    if (x === 15 && y >= 8 && y <= 10) return "P";
    if (x === 16 && y === 8) return "P";
    if (y === 3 && x >= 4 && x <= 7) return "W";
    return "S";
  });
}
export const TV_OFF: Art = tv(false);
export const TV_ON: Art = tv(true);
export const TV_PALETTE: Palette = { K: "#2B2B3B", S: "#3D3D52", G: "#55556E", D: "#8B5A2B", H: "#5BA35B", P: "#E0605A", W: "#FFFFFF" };
export const TV_ON_PALETTE: Palette = { ...TV_PALETTE, S: "#7FD0F5" };

export const CABINET: Art = paint(30, 10, (x, y) => {
  if (y === 0) return "T";
  if (x === 0 || x === 29 || y === 9) return "E";
  if (x === 15) return "E";
  if ((x === 7 || x === 22) && y === 4) return "K";
  return "D";
});
export const CABINET_PALETTE: Palette = { T: "#8B5A2B", E: "#5E3A1A", D: "#A86F3A", K: "#F2A33A" };
export const CONSOLE: Art = ["KKKKKKKK", "KGGKKBBK", "KKKKKKKK"];
export const CONSOLE_PALETTE: Palette = { K: "#2B2B3B", G: "#5BA35B", B: "#4F7CAC" };

/* ---------- Kulkas ---------- */
const FR_W = 18;
const FR_H = 36;
export const FRIDGE_CLOSED: Art = paint(FR_W, FR_H, (x, y) => {
  if (x === 0 || x === FR_W - 1 || y === 0 || y === FR_H - 1 || y === 12) return "K";
  if (x === FR_W - 4 && ((y >= 4 && y <= 9) || (y >= 15 && y <= 22))) return "H";
  if (x === 1 || y === 1 || y === 13) return "L";
  return "W";
});
export const FRIDGE_OPEN: Art = paint(FR_W, FR_H, (x, y) => {
  if (x === 0 || x === FR_W - 1 || y === 0 || y === FR_H - 1 || y === 12) return "K";
  // Pintu terbuka ke kanan: sisi kanan tampak sebagai panel tipis.
  if (x >= FR_W - 4) return x === FR_W - 4 ? "K" : "W";
  const shelves = [6, 12, 20, 27];
  if (shelves.includes(y)) return "K";
  // Isi kulkas: botol, kotak, buah.
  if (y >= 2 && y <= 5 && (x === 3 || x === 4)) return "G";
  if (y >= 3 && y <= 5 && x >= 7 && x <= 10) return "R";
  if (y >= 16 && y <= 19 && x >= 2 && x <= 5) return "Y";
  if (y >= 17 && y <= 19 && x >= 8 && x <= 11) return "G";
  if (y >= 23 && y <= 26 && x >= 3 && x <= 9) return "O";
  return "I";
});
export const FRIDGE_PALETTE: Palette = {
  K: "#3B3B4F", W: "#E8EEF2", L: "#FFFFFF", H: "#9AA5B1", I: "#FFF6D9",
  G: "#5BA35B", R: "#E0605A", Y: "#F2A33A", O: "#C77B1E",
};

/* ---------- Kursi dan laptop ---------- */
export const CHAIR: Art = paint(14, 22, (x, y) => {
  if (y <= 10) return x >= 2 && x <= 11 ? (x === 2 || x === 11 || y === 0 ? "E" : "B") : ".";
  if (y === 11 || y === 12) return x >= 0 && x <= 13 ? "E" : ".";
  if (y === 13) return x >= 1 && x <= 12 ? "B" : ".";
  return x === 2 || x === 11 || (y >= 18 && x === 7) ? "E" : ".";
});
export const CHAIR_PALETTE: Palette = { E: "#5E3A1A", B: "#C0564B" };

export const LAPTOP_CLOSED: Art = [rep(".", 2) + rep("K", 14), rep("G", 18)];
export const LAPTOP_OPEN: Art = paint(18, 12, (x, y) => {
  if (y === 11) return "G";
  if (x < 2 || x > 15) return ".";
  if (x === 2 || x === 15 || y === 0 || y === 10) return "K";
  if ((y === 3 && x >= 4 && x <= 9) || (y === 5 && x >= 5 && x <= 12) || (y === 7 && x >= 4 && x <= 8)) return "L";
  return "S";
});
export const LAPTOP_PALETTE: Palette = { K: "#3B3B4F", G: "#9AA5B1", S: "#2EC4B6", L: "#FFF8EC" };

/* ---------- Pintu terbuka, kotak surat, keset, papan ---------- */
export const DOOR_OPEN: Art = paint(18, 34, (x, y) => {
  if (x <= 1 || y <= 1) return "E";
  if (x >= 14) return x === 14 || x === 17 ? "E" : "P";
  return "V";
});
export const DOOR_OPEN_PALETTE: Palette = { E: "#5E3A1A", P: "#A86F3A", V: "#1B1420" };

export const MAILBOX: Art = paint(12, 24, (x, y) => {
  if (y <= 8) {
    if (y === 0 && (x === 0 || x === 11)) return ".";
    if (x === 0 || x === 11 || y === 0 || y === 8) return "K";
    if (y === 4 && x >= 3 && x <= 8) return "K";
    if (x === 10 && y >= 1 && y <= 3) return "F";
    return "R";
  }
  if (x === 5 || x === 6) return "P";
  if (y === 23) return x >= 2 && x <= 9 ? "P" : ".";
  return ".";
});
export const MAILBOX_PALETTE: Palette = { K: "#7A2E2A", R: "#E0605A", F: "#F2A33A", P: "#5E3A1A" };

export const MAT: Art = paint(30, 3, (x, y) => (y === 1 && x % 4 === 1 ? "Y" : "R"));
export const MAT_PALETTE: Palette = { R: "#8B5A2B", Y: "#F2A33A" };

export const BENCH: Art = paint(30, 10, (x, y) => {
  if (y <= 1) return "T";
  if (y === 2) return "E";
  return x === 2 || x === 3 || x === 26 || x === 27 ? "E" : ".";
});
export const BENCH_PALETTE: Palette = { T: "#A86F3A", E: "#5E3A1A" };
export const BENCH_SEAT = 8;
