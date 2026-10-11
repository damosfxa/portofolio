import type { Art, Palette } from "./sprite";

// Perabot dan hiasan kamar Rizky. Semua digambar khusus untuk portofolio ini.

type Painter = (x: number, y: number) => string;
const paint = (w: number, h: number, fn: Painter): Art =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y)).join(""));
const inRect = (x: number, y: number, x0: number, y0: number, x1: number, y1: number) =>
  x >= x0 && x <= x1 && y >= y0 && y <= y1;

/* Kasur: sandaran kepala di kiri, bantal, selimut bergaris. */
export const BED: Art = paint(46, 18, (x, y) => {
  if (x <= 2) return y >= 2 ? (x === 1 && y >= 4 && y <= 8 ? "L" : "E") : ".";
  if (x >= 43) return y >= 8 ? "E" : ".";
  if (y >= 16) return x === 4 || x === 41 ? "E" : ".";
  if (y >= 14) return "E";
  if (y >= 12) return "T";
  if (y >= 7 && x >= 4 && x <= 11 && y <= 9) return y === 7 ? "w" : "W";
  if (y >= 9) return (x - 14) % 7 === 0 && x > 12 ? "D" : "B";
  return ".";
});
export const BED_PALETTE: Palette = { E: "#5E3A1A", L: "#8B5A2B", T: "#FFF8EC", W: "#FFFFFF", w: "#E8E2D6", B: "#4F7CAC", D: "#3B5F86" };
/** Tinggi permukaan kasur (dalam pixel) untuk tokoh yang berbaring. */
export const BED_TOP = 9;

/* Meja kecil samping kasur. */
export const NIGHTSTAND: Art = paint(14, 14, (x, y) => {
  if (y <= 1) return "T";
  if (y === 13) return x === 1 || x === 12 ? "E" : ".";
  if (x === 0 || x === 13 || y === 7 || y === 12) return "E";
  if ((y === 4 || y === 10) && x >= 6 && x <= 7) return "Y";
  return "D";
});
export const NIGHTSTAND_PALETTE: Palette = { T: "#A86F3A", E: "#5E3A1A", D: "#8B5A2B", Y: "#F2C14E" };

/* Lampu tidur; kap menyala saat malam. */
export const BED_LAMP: Art = [
  "..SSSSSS..",
  ".SSSSSSSS.",
  "SSSSSSSSSS",
  "SSSSSSSSSS",
  "....PP....",
  "....PP....",
  "..PPPPPP..",
];
export const BED_LAMP_OFF: Palette = { S: "#D9C7A3", P: "#3B3B4F" };
export const BED_LAMP_ON: Palette = { S: "#FFD166", P: "#3B3B4F" };

/* Casing PC dengan lampu RGB. */
export const PC_TOWER: Art = paint(9, 18, (x, y) => {
  if (x === 0 || x === 8 || y === 0 || y === 17) return "K";
  if (y === 3 && x >= 2 && x <= 6) return "C";
  if (x === 6 && y >= 6 && y <= 14) return y < 9 ? "R" : y < 12 ? "G" : "U";
  if (y === 15 && x === 2) return "G";
  return "S";
});
export const PC_TOWER_PALETTE: Palette = { K: "#1E1E2A", S: "#33334A", C: "#55556E", R: "#F45B69", G: "#5BE09B", U: "#5BB5F4" };

/* Gitar akustik di standarnya. */
export const GUITAR: Art = paint(12, 32, (x, y) => {
  if (y <= 2) return x >= 4 && x <= 7 ? "K" : ".";
  if (y <= 14) return x >= 5 && x <= 6 ? (y % 3 === 0 ? "F" : "N") : ".";
  const body = (cx: number, cy: number, r: number) => (x - cx) ** 2 + ((y - cy) * 1.1) ** 2 <= r * r;
  if (body(5.5, 23, 3) && (x - 5.5) ** 2 + (y - 23) ** 2 <= 2) return "K";
  if (body(5.5, 18, 3.6) || body(5.5, 24.5, 5.4)) return y === 27 && x >= 4 && x <= 7 ? "K" : "O";
  if (y >= 30) return x === 2 || x === 9 || (y === 31 && x >= 2 && x <= 9) ? "E" : ".";
  return ".";
});
export const GUITAR_PALETTE: Palette = { K: "#3B2A20", N: "#8B5A2B", F: "#D9C7A3", O: "#D9883A", E: "#2B2B3B" };

/* Lemari pakaian dua pintu; saat terbuka terlihat baju tergantung. */
const wardrobe = (open: boolean): Art =>
  paint(24, 38, (x, y) => {
    if (y >= 36) return x === 1 || x === 22 ? "E" : ".";
    if (x === 0 || x === 23 || y === 0 || y === 35) return "E";
    if (open && inRect(x, y, 1, 1, 22, 34)) {
      if (y === 4) return "K";
      if (y >= 5 && y <= 18) {
        if (x >= 2 && x <= 6) return "R";
        if (x >= 8 && x <= 12) return "U";
        if (x >= 14 && x <= 17) return "W";
        if (x >= 19 && x <= 21) return "G";
      }
      if (y >= 29 && y <= 33 && ((x >= 3 && x <= 8) || (x >= 14 && x <= 19))) return "K";
      return "I";
    }
    if (x === 11 || x === 12) return "E";
    if ((x === 9 || x === 14) && y >= 15 && y <= 19) return "Y";
    if (y === 3 || y === 32) return "L";
    return "D";
  });
export const WARDROBE_CLOSED = wardrobe(false);
export const WARDROBE_OPEN = wardrobe(true);
export const WARDROBE_PALETTE: Palette = {
  E: "#5E3A1A", D: "#A86F3A", L: "#8B5A2B", Y: "#F2C14E", I: "#3B2A20", K: "#2B2B3B",
  R: "#E0605A", U: "#4F7CAC", W: "#F3EDE2", G: "#5BA35B",
};

/* Dumbel di lantai. */
export const DUMBBELL: Art = ["KK......KK", "KKGGGGGGKK", "KK......KK"];
export const DUMBBELL_PALETTE: Palette = { K: "#2B2B3B", G: "#9AA5B1" };

/* Karpet kecil. */
export const BED_RUG: Art = paint(30, 3, (x, y) => (y === 1 && x % 5 === 2 ? "Y" : "G"));
export const BED_RUG_PALETTE: Palette = { G: "#3E5F8A", Y: "#F2C14E" };

/* ---------- Hiasan dinding ---------- */

/* Poster band rock: gitar listrik dan petir. */
export const POSTER_ROCK: Art = paint(18, 24, (x, y) => {
  if (x === 0 || x === 17 || y === 0 || y === 23) return "W";
  if (y >= 18 && y <= 19 && x >= 3 && x <= 14) return "Y";
  if (y === 21 && x >= 5 && x <= 12) return "R";
  // Petir zig-zag
  const bolt = [9, 8, 7, 6, 8, 10, 9, 8, 7, 6, 8, 7, 6];
  if (y >= 3 && y <= 15 && (x === bolt[y - 3] || x === bolt[y - 3] + 1)) return "Y";
  return "K";
});
export const POSTER_ROCK_PALETTE: Palette = { W: "#F3EDE2", K: "#1F1B2E", Y: "#FFD166", R: "#E0605A" };

/* Poster gim: stik gim besar. */
export const POSTER_GAME: Art = paint(20, 16, (x, y) => {
  if (x === 0 || x === 19 || y === 0 || y === 15) return "W";
  const pad = inRect(x, y, 4, 5, 15, 10) || inRect(x, y, 3, 7, 16, 11);
  if (pad) {
    if ((x === 6 && y >= 6 && y <= 10) || (y === 8 && x >= 4 && x <= 8)) return "K";
    if (x === 13 && y === 7) return "R";
    if (x === 14 && y === 9) return "G";
    if (x === 12 && y === 9) return "U";
    return "S";
  }
  if (y === 13 && x >= 5 && x <= 14) return "Y";
  return "P";
});
export const POSTER_GAME_PALETTE: Palette = { W: "#F3EDE2", P: "#6B4FA0", S: "#C8CDD3", K: "#2B2B3B", R: "#E0605A", G: "#5BA35B", U: "#4F7CAC", Y: "#FFD166" };

/* Bendera segitiga (pennant) klub. */
export const PENNANT: Art = paint(26, 10, (x, y) => {
  if (x <= 1) return "E";
  const half = 5 - Math.abs(y - 4.5);
  if (x - 2 > 24 * (half / 5)) return ".";
  if (y >= 3 && y <= 6 && x >= 5 && x <= 13 && (x + y) % 2 === 0) return "W";
  return "R";
});
export const PENNANT_PALETTE: Palette = { E: "#5E3A1A", R: "#C0392B", W: "#FFF8EC" };

/* Jersey bola nomor 10 dalam bingkai. */
export const JERSEY: Art = paint(20, 22, (x, y) => {
  if (x === 0 || x === 19 || y === 0 || y === 21) return "F";
  if (x === 1 || x === 18 || y === 1 || y === 20) return "M";
  const shirt = inRect(x, y, 6, 4, 13, 18) || inRect(x, y, 3, 4, 16, 8);
  if (!shirt) return "M";
  if (y === 4 && x >= 8 && x <= 11) return "M";
  const one = x === 7 && y >= 10 && y <= 15;
  const zero = inRect(x, y, 9, 10, 12, 15) && !inRect(x, y, 10, 11, 11, 14);
  if (one || zero) return "W";
  return x <= 4 || x >= 15 ? "D" : "B";
});
export const JERSEY_PALETTE: Palette = { F: "#5E3A1A", M: "#EDE0C8", B: "#1F6FB2", D: "#174F80", W: "#FFFFFF" };

/* Rak dinding: action figure, tumpukan buku, robot kecil. */
export const WALL_SHELF: Art = paint(34, 14, (x, y) => {
  if (y >= 11) return y === 11 ? "T" : x === 3 || x === 30 ? "E" : ".";
  if (inRect(x, y, 2, 3, 4, 10)) return y === 3 ? "S" : y <= 5 ? "S" : y <= 8 ? "R" : "U";
  if (inRect(x, y, 8, 6, 17, 10)) return y === 6 || y === 8 ? "Y" : y === 7 ? "G" : "P";
  if (inRect(x, y, 22, 2, 28, 10)) {
    if (y <= 5) return (y === 4 && (x === 24 || x === 26)) ? "C" : "M";
    return x === 22 || x === 28 ? "M" : y === 8 ? "R" : "M";
  }
  return ".";
});
export const WALL_SHELF_PALETTE: Palette = {
  T: "#8B5A2B", E: "#5E3A1A", S: "#F2C99B", R: "#E0605A", U: "#4F7CAC", Y: "#F2A33A", G: "#5BA35B", P: "#9B6BB5", M: "#9AA5B1", C: "#5BE0E0",
};

/* Lampu tumbler di sepanjang dinding: menyala saat malam. */
export const FAIRY_LIGHTS: Art = paint(60, 6, (x, y) => {
  const sag = Math.round(2 * Math.sin((x / 59) * Math.PI));
  if (y === sag) return "K";
  if (x % 6 === 3 && y === sag + 1) return ["R", "Y", "G", "U"][(x / 6) % 4 | 0];
  return ".";
});
export const FAIRY_DAY: Palette = { K: "#5E3A1A", R: "#C99A9A", Y: "#D9C99A", G: "#9AC9A6", U: "#9AB3C9" };
export const FAIRY_NIGHT: Palette = { K: "#2B1E16", R: "#FF6B7A", Y: "#FFD166", G: "#6BFFA6", U: "#6BC5FF" };

/* ---------- Layar PC: berganti sesuai yang sedang dikerjakan ---------- */

const monitor = (screen: (x: number, y: number) => string): Art =>
  paint(18, 13, (x, y) => {
    if (y >= 10) return (y < 12 ? x >= 7 && x <= 10 : x >= 5 && x <= 12) ? "F" : ".";
    if (y === 0 || y === 9 || x === 0 || x === 17) return "F";
    return screen(x - 1, y - 1);
  });

export const SCREEN_OFF = monitor(() => "k");
export const SCREEN_CODE = monitor((x, y) => {
  const lens = [6, 10, 8, 12, 5, 9, 11, 7];
  const indent = [0, 2, 2, 4, 4, 2, 0, 2][y];
  if (x < indent || x >= indent + lens[y] - indent) return "c";
  return ["g", "p", "y", "w"][(y + (x > 8 ? 1 : 0)) % 4];
});
export const SCREEN_GOOGLE = monitor((x, y) => {
  if (y === 1 && x >= 4 && x <= 11) return ["b", "r", "y", "b", "g", "r", "b", "y"][x - 4];
  if (y === 3 && x >= 2 && x <= 13) return x === 2 || x === 13 ? "s" : "w";
  if (y === 4 && x >= 2 && x <= 13) return "s";
  if ((y === 6 || y === 7) && x >= 3 && x <= (y === 6 ? 11 : 9)) return y === 6 ? "b" : "s";
  return "w";
});
const game = (jump: boolean) =>
  monitor((x, y) => {
    if (y >= 6) return y === 6 ? "g" : "d";
    if (x === 12 && y === (jump ? 2 : 4)) return "y";
    const py = jump ? 3 : 4;
    if (x >= 4 && x <= 5 && y >= py && y <= py + 1) return "r";
    if (y === 1 && (x === 1 || x === 2 || x === 9 || x === 10)) return "w";
    return "a";
  });
export const SCREEN_GAME_A = game(false);
export const SCREEN_GAME_B = game(true);
export const SCREEN_PROJECT = monitor((x, y) => {
  if (x <= 2) return y === 1 ? "y" : "n";
  if (y === 0) return "w";
  if (y >= 1 && y <= 2) return x <= 8 ? "b" : x <= 14 ? "g" : "w";
  if (y >= 4 && x >= 4 && x <= 14) return (x % 3 === 1 && 7 - y < ((x * 3) % 4) + 1) ? "p" : "w";
  return "w";
});
export const SCREEN_PALETTE: Palette = {
  F: "#1E1E2A", k: "#151520", c: "#1B2232", g: "#5BE09B", p: "#C792EA", y: "#FFD166", w: "#F3F6FA",
  b: "#4F8EF7", r: "#E8504A", s: "#B8C2CC", d: "#3E7A3E", a: "#7FC8F8", n: "#2B3A55",
};

/* Sajadah: tergulung di pojok, dibentangkan saat sholat. */
export const SAJADAH_ROLLED: Art = ["GGG", "GYG", "GGG", "GYG", "GGG", "GGG"];
export const SAJADAH_OPEN: Art = paint(26, 2, (x, y) => (x === 0 || x === 25 ? "Y" : y === 0 && x % 4 === 2 ? "Y" : x < 5 ? "D" : "G"));
export const SAJADAH_PALETTE: Palette = { G: "#2E7D5B", D: "#1F5E43", Y: "#E8C46A" };

/* Standar gitar tanpa gitar (saat gitarnya sedang dimainkan). */
export const GUITAR_STAND: Art = paint(12, 32, (x, y) => {
  if (y >= 30) return x === 2 || x === 9 || (y === 31 && x >= 2 && x <= 9) ? "E" : ".";
  if (y >= 20 && (x === 3 || x === 8) && y <= 29) return "E";
  if (y === 20 && x >= 3 && x <= 8) return "E";
  return ".";
});
