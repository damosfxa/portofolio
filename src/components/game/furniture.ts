import type { Art, Palette } from "./sprite";

// Perabot tambahan supaya setiap ruangan terasa terisi. Semua digambar khusus untuk portofolio ini.

type Painter = (x: number, y: number) => string;
const paint = (w: number, h: number, fn: Painter): Art =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y)).join(""));
const inRect = (x: number, y: number, x0: number, y0: number, x1: number, y1: number) =>
  x >= x0 && x <= x1 && y >= y0 && y <= y1;

/* Papan tulis dengan catatan tempel dan coretan. */
export const WHITEBOARD: Art = paint(40, 26, (x, y) => {
  if (y >= 23) return x === 4 || x === 35 ? "F" : ".";
  if (x === 0 || x === 39 || y === 0 || y === 22) return "F";
  if (y === 21 && x >= 6 && x <= 14) return "T";
  if (inRect(x, y, 3, 3, 8, 7)) return "Y";
  if (inRect(x, y, 11, 3, 16, 7)) return "P";
  if (inRect(x, y, 3, 10, 8, 14)) return "G";
  if ((y === 4 || y === 6) && x >= 20 && x <= 34 && (x + y) % 5 !== 0) return "K";
  if ((y === 10 || y === 12 || y === 14) && x >= 12 && x <= 30 && x % 7 !== 0) return "B";
  if (y === 18 && x >= 20 && x <= 36) return "R";
  if (x === 36 && y >= 16 && y <= 20) return "R";
  return "W";
});
export const WHITEBOARD_PALETTE: Palette = {
  F: "#9AA5B1", W: "#FBFDFF", T: "#5E3A1A", Y: "#FFD166", P: "#F49AC1", G: "#9BE09B", K: "#3B3B4F", B: "#4F7CAC", R: "#E0605A",
};

/* Lemari arsip tiga laci. */
export const FILE_CABINET: Art = paint(16, 26, (x, y) => {
  if (x === 0 || x === 15 || y === 0 || y === 25 || y === 8 || y === 16) return "K";
  if ((y === 4 || y === 12 || y === 20) && x >= 6 && x <= 9) return "H";
  if (y === 2 || y === 10 || y === 18) return x >= 5 && x <= 10 ? "L" : "G";
  return "G";
});
export const FILE_CABINET_PALETTE: Palette = { K: "#3B3B4F", G: "#7C8A99", H: "#E8EEF2", L: "#FFF8EC" };

/* Printer di atas lemari arsip. */
export const PRINTER: Art = paint(14, 8, (x, y) => {
  if (y <= 1) return x >= 3 && x <= 10 ? "W" : ".";
  if (y === 7) return "K";
  if (y === 4 && x >= 9 && x <= 11) return "G";
  return x === 0 || x === 13 ? "K" : "S";
});
export const PRINTER_PALETTE: Palette = { W: "#FFFFFF", K: "#2B2B3B", S: "#C8CDD3", G: "#5BA35B" };

/* Meja kecil dengan mesin kopi. */
export const COFFEE_STATION: Art = paint(20, 28, (x, y) => {
  if (y <= 13) {
    if (!inRect(x, y, 3, 0, 16, 13)) return ".";
    if (y === 0 || x === 3 || x === 16) return "K";
    if (inRect(x, y, 6, 6, 13, 11)) return y === 11 ? "K" : inRect(x, y, 8, 8, 11, 11) ? "M" : "V";
    if (y === 3 && (x === 6 || x === 9)) return "R";
    return "S";
  }
  if (y === 14 || y === 15) return "T";
  return x === 1 || x === 18 || (y >= 24 && (x === 2 || x === 17)) ? "E" : ".";
});
export const COFFEE_STATION_PALETTE: Palette = {
  K: "#2B2B3B", S: "#C0564B", R: "#FFD166", M: "#FFF8EC", V: "#3B2A20", T: "#8B5A2B", E: "#5E3A1A",
};

/* Jam dinding. */
export const CLOCK: Art = paint(12, 12, (x, y) => {
  const d = (x - 5.5) ** 2 + (y - 5.5) ** 2;
  if (d > 36) return ".";
  if (d > 25) return "K";
  if ((x === 5 || x === 6) && y >= 2 && y <= 6) return "H";
  if (y === 6 && x >= 6 && x <= 8) return "H";
  return "W";
});
export const CLOCK_PALETTE: Palette = { K: "#5E3A1A", W: "#FFF8EC", H: "#2B1E16", T: "#B8A890" };
/* Muka jam tanpa jarum (jarumnya digambar terpisah dan berputar sesuai waktu), dengan tanda jam 12, 3, 6, 9. */
export const CLOCK_FACE: Art = paint(12, 12, (x, y) => {
  const d = (x - 5.5) ** 2 + (y - 5.5) ** 2;
  if (d > 36) return ".";
  if (d > 25) return "K";
  if ((y === 1 && (x === 5 || x === 6)) || (y === 10 && (x === 5 || x === 6))) return "T";
  if ((x === 1 && (y === 5 || y === 6)) || (x === 10 && (y === 5 || y === 6))) return "T";
  return "W";
});

/* Lukisan pemandangan kecil berbingkai. */
export const PAINTING: Art = paint(24, 18, (x, y) => {
  if (x <= 1 || x >= 22 || y <= 1 || y >= 16) return "F";
  if (Math.abs(x - 8) + (y - 7) <= 4 && y >= 7) return "M";
  if (Math.abs(x - 15) + (y - 5) <= 6 && y >= 5) return "D";
  if (y >= 12) return "G";
  if ((x - 18) ** 2 + (y - 4) ** 2 <= 2) return "Y";
  return "S";
});
export const PAINTING_PALETTE: Palette = { F: "#B8862F", M: "#7A9A6B", D: "#5C7A5E", G: "#9BC37A", Y: "#FFD166", S: "#BFE3F7" };

/* Poster bertuliskan kode < />. */
const POSTER_GLYPH = ["...Y.....Y...", "..Y.......Y..", ".Y....Y....Y.", "Y....Y.....Y.", ".Y..Y.....Y..", "..Y.......Y..", "...Y.....Y..."];
export const POSTER: Art = paint(15, 20, (x, y) => {
  if (x === 0 || x === 14 || y === 0 || y === 19) return "K";
  if (y >= 4 && y <= 10) return POSTER_GLYPH[y - 4][x - 1] === "Y" ? "Y" : "B";
  if (y === 14 && x >= 3 && x <= 11) return "W";
  if (y === 16 && x >= 5 && x <= 9) return "W";
  return "B";
});
export const POSTER_PALETTE: Palette = { K: "#2B1E16", B: "#3A3155", Y: "#F2A33A", W: "#C4B8D8" };

/* Tiang tali museum. */
export const STANCHION: Art = paint(6, 26, (x, y) => {
  if (y <= 2) return x >= 1 && x <= 4 ? "Y" : ".";
  if (y >= 23) return "K";
  return x === 2 || x === 3 ? "Y" : ".";
});
export const STANCHION_PALETTE: Palette = { Y: "#D4A93A", K: "#5E3A1A" };

/* Alas pajangan dengan trofi. */
const TROPHY_TOP = [
  "....YYYYYYYY....",
  "..YYYWYYYYYOYY..",
  "..Y.YWYYYYYO.Y..",
  "...YYWYYYYYOY...",
  ".....YYYYYO.....",
  "......YYYO......",
  ".......YO.......",
  ".......YO.......",
  "......YYOO......",
  ".....KKKKKK.....",
  ".....KKKKKK.....",
  "................",
];
export const PEDESTAL: Art = paint(16, 32, (x, y) => {
  if (y <= 11) return TROPHY_TOP[y][x];
  if (y === 12 || y === 13 || y >= 30) return "T";
  return x >= 2 && x <= 13 ? (x === 2 || x === 13 ? "E" : "S") : ".";
});
export const PEDESTAL_PALETTE: Palette = {
  Y: "#F2A33A", W: "#FFE7B8", O: "#C77B1E", K: "#5E3A1A", T: "#E8E0D0", S: "#D8CFBD", E: "#B8AE9A",
};

/* Kursi santai. */
export const ARMCHAIR: Art = paint(22, 18, (x, y) => {
  if (y <= 8) return x >= 3 && x <= 18 ? (y === 0 ? "D" : "B") : ".";
  if (y <= 14) {
    if (x <= 2 || x >= 19) return y >= 6 ? "D" : ".";
    return y <= 10 ? "C" : "D";
  }
  return x === 2 || x === 19 ? "L" : ".";
});
export const ARMCHAIR_PALETTE: Palette = { B: "#C0564B", D: "#93403A", C: "#D9776C", L: "#3B2A20" };
export const ARMCHAIR_SEAT = 7;

/* Meja samping dengan lampu kecil dan buku. */
export const SIDE_TABLE: Art = paint(14, 26, (x, y) => {
  if (y <= 3) return x >= 4 && x <= 9 ? "S" : ".";
  if (y <= 8) return x === 6 || x === 7 ? "P" : ".";
  if (y === 9) return x >= 1 && x <= 11 ? "B" : ".";
  if (y === 10 || y === 11) return "T";
  return x === 1 || x === 12 || y === 18 ? "E" : ".";
});
export const SIDE_TABLE_PALETTE: Palette = { S: "#FFD166", P: "#3B3B4F", B: "#4F7CAC", T: "#8B5A2B", E: "#5E3A1A" };

/* Kasur lipat untuk tidur. */
export const FUTON: Art = paint(34, 6, (x, y) => {
  if (y === 0) return x >= 1 && x <= 8 ? "P" : ".";
  if (y === 1) return x <= 9 ? "P" : "B";
  if (y <= 3) return x % 6 === 0 ? "D" : "B";
  return "D";
});
export const FUTON_PALETTE: Palette = { P: "#FFF8EC", B: "#7FB3D5", D: "#5A8FB3" };
export const FUTON_SEAT = 3;

/* Rak sepatu untuk teras. */
export const SHOE_RACK: Art = paint(22, 14, (x, y) => {
  if (y === 0 || y === 7 || y === 13) return "T";
  if (x === 0 || x === 21) return "E";
  if (y >= 4 && y <= 6 && ((x >= 3 && x <= 7) || (x >= 12 && x <= 16))) return x < 10 ? "R" : "U";
  if (y >= 10 && y <= 12 && ((x >= 3 && x <= 7) || (x >= 13 && x <= 18))) return x < 10 ? "W" : "K";
  return ".";
});
export const SHOE_RACK_PALETTE: Palette = { T: "#8B5A2B", E: "#5E3A1A", R: "#E0605A", U: "#4F7CAC", W: "#F3EDE2", K: "#2B2B3B" };

/* Tempat payung. */
export const UMBRELLA_STAND: Art = paint(10, 26, (x, y) => {
  if (y <= 10) {
    if (x === 3 && y <= 10) return "R";
    if (x === 6 && y >= 2) return "Y";
    if (y === 0 && x === 2) return "R";
    if (y === 1 && x === 7) return "Y";
    return ".";
  }
  return x === 0 || x === 9 || y === 25 ? "K" : "G";
});
export const UMBRELLA_STAND_PALETTE: Palette = { R: "#E0605A", Y: "#F2A33A", K: "#3B3B4F", G: "#7C8A99" };

/* Lampu dinding teras. */
export const LANTERN: Art = paint(10, 14, (x, y) => {
  if (y <= 1) return x >= 3 && x <= 6 ? "K" : ".";
  if (y === 13) return x >= 2 && x <= 7 ? "K" : ".";
  if (x === 0 || x === 9) return ".";
  if (x === 1 || x === 8 || y === 2 || y === 12) return "K";
  return "L";
});
export const LANTERN_OFF: Palette = { K: "#2B2B3B", L: "#E8D3A8" };
export const LANTERN_ON: Palette = { K: "#2B2B3B", L: "#FFD166" };

/* Pagar tanaman. */
export const HEDGE: Art = paint(40, 14, (x, y) => {
  const top = 3 + Math.round(Math.sin(x / 2.2) * 2);
  if (y < top) return ".";
  return (x * 3 + y * 5) % 11 === 0 ? "D" : (x + y) % 9 === 0 ? "L" : "G";
});
export const HEDGE_PALETTE: Palette = { G: "#5BA35B", D: "#3E7A3E", L: "#8FD18F" };

/* Mangkuk makan kucing. */
export const CAT_BOWL: Art = [".YYYYYY.", "RRRRRRRR", ".RRRRRR."];
export const CAT_BOWL_PALETTE: Palette = { Y: "#C77B1E", R: "#4F7CAC" };

/* Karpet bundar. */
export const RUG_ROUND: Art = paint(40, 4, (x, y) => {
  if ((y === 0 || y === 3) && (x < 3 || x > 36)) return ".";
  return (x + y) % 4 === 0 ? "Y" : "G";
});
export const RUG_ROUND_PALETTE: Palette = { G: "#5C7A5E", Y: "#E8C46A" };
