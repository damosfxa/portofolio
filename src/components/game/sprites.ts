import type { Art, Palette } from "./sprite";

// Semua pixel art di file ini digambar khusus untuk portofolio ini (tema kamar lo-fi).
// Beberapa sprite dibangun dengan fungsi kecil supaya ukurannya pasti rapi.

const rep = (c: string, n: number) => c.repeat(Math.max(0, n));
/** Isi baris sampai lebar `w` dengan karakter `c`. */
const pad = (s: string, w: number, c = ".") => (s + rep(c, w)).slice(0, w);

/* ---------- Pemain ---------- */

export const PLAYER_PALETTE: Palette = {
  H: "#3B2A20", // topi
  A: "#E0605A", // pita topi
  S: "#F2C79A", // kulit
  G: "#2B1E16", // bingkai kacamata
  L: "#9FD3FF", // lensa
  M: "#B54848", // mulut
  B: "#4F7CAC", // hoodie
  D: "#3A5E86", // hoodie gelap
  Y: "#F2A33A", // logo
  N: "#3B2A20", // celana
  O: "#6B3A1F", // sepatu
};

const PLAYER_TOP: Art = [
  "....HHHH....",
  "....HHHH....",
  "....AAAA....",
  "..HHHHHHHH..",
  "...SSSSSS...",
  "..GLGSSGLG..",
  "..SSSSSSSS..",
  "...SSMMSS...",
  "....SSSS....",
  "..DBBBBBBD..",
  ".DBBBYYBBBD.",
  ".SDBBYYBBDS.",
  ".SBBBBBBBBS.",
  "..BBBBBBBB..",
];

export const PLAYER_IDLE: Art = [...PLAYER_TOP, "..NNN..NNN..", "..OOO..OOO.."];
export const PLAYER_WALK_A: Art = [...PLAYER_TOP, ".NNN....NNN.", ".OOO....OOO."];
export const PLAYER_WALK_B: Art = [...PLAYER_TOP, "...NNNNNN...", "...OOOOOO..."];
/** Kepala dan bahu saja, untuk potret di kotak dialog. */
export const PLAYER_PORTRAIT: Art = PLAYER_TOP.slice(0, 11);

/* ---------- Perabot ---------- */

const WOOD = { T: "#8B5A2B", E: "#5E3A1A", D: "#A86F3A", K: "#F2A33A", L: "#5E3A1A" };

// Meja: papan atas, laci di kanan, kaki di kedua sisi.
const deskSide = (inner: string) => ".LL" + rep(".", 17) + inner + "LL.";
export const DESK: Art = [
  rep("T", 36),
  rep("E", 36),
  deskSide(rep("D", 13)),
  deskSide("DDDDDDKDDDDDD"),
  deskSide(rep("E", 13)),
  deskSide("DDDDDDKDDDDDD"),
  deskSide(rep("D", 13)),
  deskSide(rep("E", 13)),
  ...Array.from({ length: 6 }, () => ".LL" + rep(".", 30) + "LL."),
];
export const DESK_PALETTE: Palette = WOOD;

// Monitor dengan baris kode di layar.
const screen = (code: string) => "F" + pad("S" + code, 16, "S") + "F";
export const MONITOR: Art = [
  rep("F", 18),
  screen(""),
  screen("LLL"),
  screen("..LLLLL".replace(/\./g, "S")),
  screen("..LLL".replace(/\./g, "S")),
  screen("LLLLLL"),
  screen(""),
  screen("SLLLL"),
  screen(""),
  rep("F", 18),
  pad(rep(".", 7) + "BBBB", 18),
  pad(rep(".", 7) + "BBBB", 18),
  pad(rep(".", 5) + rep("B", 8), 18),
];
export const MONITOR_PALETTE: Palette = { F: "#3B3B4F", S: "#2EC4B6", L: "#FFF8EC", B: "#3B3B4F" };
export const MONITOR_PALETTE_NIGHT: Palette = { F: "#3B3B4F", S: "#1B8F86", L: "#BFFFF7", B: "#3B3B4F" };

export const MUG: Art = ["MMMMMM..", "MMMMMMHH", "MMMMMM.H", "MMMMMMHH", "MMMMMM..", ".MMMM..."];
export const MUG_PALETTE: Palette = { M: "#E0605A", H: "#B8443F" };
export const STEAM: Art = [".W.", "W..", ".W.", "..W", ".W."];
export const STEAM_PALETTE: Palette = { W: "rgba(255,255,255,0.75)" };

// Rak buku: tiga ruang, tiap ruang berisi buku dengan warna dan tinggi berbeda.
type Book = [color: string, width: number, height: number];
const SHELF_W = 22;
const SHELF_INNER = SHELF_W - 2;
const COMPARTMENT_H = 9;
function compartment(books: Book[]): string[] {
  const rows: string[] = [];
  for (let r = 0; r < COMPARTMENT_H; r++) {
    const fromBottom = COMPARTMENT_H - r;
    let inner = "";
    for (const [c, w, h] of books) inner += rep(fromBottom <= h ? c : "B", w);
    rows.push("E" + pad(inner, SHELF_INNER, "B") + "E");
  }
  return rows;
}
export const BOOKSHELF: Art = [
  rep("E", SHELF_W),
  rep("E", SHELF_W),
  ...compartment([["R", 2, 7], ["G", 2, 8], ["U", 3, 6], ["Y", 2, 7], ["P", 2, 8], ["C", 2, 5], ["R", 3, 7]]),
  rep("E", SHELF_W),
  ...compartment([["U", 2, 8], ["U", 2, 8], ["C", 3, 6], ["G", 2, 7], ["B", 3, 0], ["Y", 2, 4], ["Y", 2, 4]]),
  rep("E", SHELF_W),
  ...compartment([["P", 3, 7], ["R", 2, 6], ["G", 2, 8], ["C", 2, 7], ["U", 3, 6], ["R", 2, 8]]),
  rep("E", SHELF_W),
  rep("E", SHELF_W),
];
export const BOOKSHELF_PALETTE: Palette = {
  E: "#5E3A1A",
  B: "#7A4C25",
  R: "#E0605A",
  G: "#5BA35B",
  U: "#4F7CAC",
  Y: "#F2A33A",
  P: "#9B6BB5",
  C: "#EDE0C8",
};

export const LAMP: Art = [
  "...SSSSSS...",
  "..SSSSSSSS..",
  "..SSSSSSSS..",
  ".SSSSSSSSSS.",
  ".SSSSSSSSSS.",
  "SSSSSSSSSSSS",
  ...Array.from({ length: 26 }, () => ".....PP....."),
  "...PPPPPP...",
  "..PPPPPPPP..",
];
export const LAMP_OFF: Palette = { S: "#E8D3A8", P: "#3B3B4F" };
export const LAMP_ON: Palette = { S: "#FFD166", P: "#3B3B4F" };
/** Sorot cahaya lampu saat malam: trapesium bertingkat, warna transparan (bukan gradasi). */
export const LIGHT_CONE: Art = Array.from({ length: 30 }, (_, i) => {
  const w = 12 + Math.floor(i / 2) * 2;
  const side = (40 - w) / 2;
  return rep(".", side) + rep("L", w) + rep(".", side);
});
export const LIGHT_PALETTE: Palette = { L: "rgba(255, 209, 102, 0.16)" };

export const PLANT: Art = [
  "......L.......",
  "....L.LL......",
  "...LLDLL..L...",
  "..LLLDDL.LLL..",
  ".LLDLLDLLLDL..",
  ".LDLLLDLLDLLL.",
  "LLDLLLDDLDLLLL",
  ".LLLDLLDLLLDL.",
  "..LLDLLDLLDL..",
  "...LLLDDLLL...",
  ".....DDDD.....",
  "......DD......",
  "..RRRRRRRRRR..",
  "..OOOOOOOOOO..",
  "...OOOOOOOO...",
  "...OOOOOOOO...",
  "....OOOOOO....",
  "....OOOOOO....",
];
export const PLANT_PALETTE: Palette = { L: "#5BA35B", D: "#3E7A3E", R: "#A04E1E", O: "#C8662C" };

const CAT_BODY = [
  "OOOPOOOOODODODOO..",
  "OOOOOOOODODODOOOO.",
  ".OOOOOOOOOOOOOOOOO",
  ".OOWWWOOOOOOOOOOOD",
  "..OOOOOOOOOOOOOODD",
  "...OO..OO....DDD..",
];
export const CAT_SLEEP: Art = ["..O.O.............", ".OOOOO............", ".OKOKO..OOOOOOO...", ...CAT_BODY];
export const CAT_AWAKE: Art = ["..O.O.............", ".OOOOO............", ".OGOGO..OOOOOOO...", ...CAT_BODY];
export const CAT_PALETTE: Palette = { O: "#F2A33A", D: "#C77B1E", W: "#FFF1D6", K: "#2B1E16", G: "#3E7A3E", P: "#E88B8B" };

const RUG_W = 44;
export const RUG: Art = [
  rep("R", RUG_W),
  "R" + rep("YR", (RUG_W - 2) / 2) + "R",
  rep("R", RUG_W),
];
export const RUG_PALETTE: Palette = { R: "#C0564B", Y: "#F2A33A" };

// Jendela: bingkai putih, palang tengah, isi langit siang atau malam.
const WIN_W = 30;
const WIN_H = 26;
function windowArt(stamp: (x: number, y: number) => string | null): Art {
  const rows: string[] = [];
  for (let y = 0; y < WIN_H; y++) {
    let row = "";
    for (let x = 0; x < WIN_W; x++) {
      const edge = x === 0 || y === 0 || x === WIN_W - 1 || y === WIN_H - 1;
      const frame = x <= 2 || y <= 2 || x >= WIN_W - 3 || y >= WIN_H - 3 || x === 14 || x === 15 || y === 12 || y === 13;
      row += edge ? "E" : frame ? "F" : stamp(x, y) ?? "S";
    }
    rows.push(row);
  }
  rows.push(rep("E", WIN_W + 4).slice(0, WIN_W)); // ambang jendela
  return rows;
}
const inCircle = (x: number, y: number, cx: number, cy: number, r: number) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
export const WINDOW_DAY: Art = windowArt((x, y) => {
  if (inCircle(x, y, 7, 6, 2.6)) return "Y";
  if ((y === 7 && x >= 18 && x <= 25) || (y === 6 && x >= 20 && x <= 24) || (y === 8 && x >= 19 && x <= 26)) return "W";
  if ((y === 18 && x >= 4 && x <= 10) || (y === 17 && x >= 6 && x <= 9)) return "W";
  return null;
});
export const WINDOW_NIGHT: Art = windowArt((x, y) => {
  if (inCircle(x, y, 21, 6, 2.8) && !inCircle(x, y, 22.5, 5, 2.4)) return "Y";
  const stars = ["5,4", "9,8", "4,17", "11,20", "19,16", "25,19", "23,10", "7,10"];
  if (stars.includes(`${x},${y}`)) return "W";
  return null;
});
export const WINDOW_DAY_PALETTE: Palette = { E: "#5E3A1A", F: "#FFF8EC", S: "#9AD1F5", Y: "#FFD166", W: "#FFFFFF" };
export const WINDOW_NIGHT_PALETTE: Palette = { E: "#2B1E16", F: "#CFC3B0", S: "#1E2448", Y: "#FFF1B8", W: "#FFFFFF" };

// Pintu: dua panel timbul dan gagang di kanan.
const DOOR_W = 18;
const DOOR_H = 34;
export const DOOR: Art = Array.from({ length: DOOR_H }, (_, y) => {
  let row = "";
  for (let x = 0; x < DOOR_W; x++) {
    const edge = x <= 1 || x >= DOOR_W - 2 || y <= 1;
    const panelX = x >= 4 && x <= DOOR_W - 5;
    const panel = panelX && ((y >= 4 && y <= 14) || (y >= 18 && y <= 30));
    const knob = (x === DOOR_W - 5 || x === DOOR_W - 6) && (y === 16 || y === 17);
    row += edge ? "E" : knob ? "K" : panel ? "P" : "D";
  }
  return row;
});
export const DOOR_PALETTE: Palette = { E: "#5E3A1A", D: "#A86F3A", P: "#8B5A2B", K: "#F2A33A" };

export const HEART: Art = [".RR.RR.", "RWRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."];
export const HEART_PALETTE: Palette = { R: "#E0605A", W: "#FFB3B5" };

export const TROPHY: Art = [
  "..YYYYYYYY..",
  "YYYWYYYYYOYY",
  "Y.YWYYYYYO.Y",
  "Y.YWYYYYYO.Y",
  ".YYWYYYYYOY.",
  "..YYYYYYYO..",
  "...YYYYYO...",
  ".....YO.....",
  ".....YO.....",
  "....YYOO....",
  "..KKKKKKKK..",
  "..KKKKKKKK..",
];
export const TROPHY_PALETTE: Palette = { Y: "#F2A33A", W: "#FFE7B8", O: "#C77B1E", K: "#5E3A1A" };

export const SUN: Art = ["...Y....", ".Y.YY.Y.", "..YYYY..", "YYYYYYYY", "YYYYYYYY", "..YYYY..", ".Y.YY.Y.", "...Y...."];
export const SUN_PALETTE: Palette = { Y: "#E08A1E" };
export const MOON: Art = ["..YYY.", ".YYY..", "YYY...", "YYY...", ".YYY..", "..YYY."];
export const MOON_PALETTE: Palette = { Y: "#FFE7A3" };

/* ---------- Tile (latar CSS) ---------- */

export const WALLPAPER_TILE: Art = [
  "BBBBBBBBBBBB",
  "BBMBBBBBBBBB",
  "BMMMBBBBBBBB",
  "BBMBBBBBBBBB",
  "BBBBBBBBBBBB",
  "BBBBBBBBBBBB",
  "BBBBBBBBBBBB",
  "BBBBBBBBMBBB",
  "BBBBBBBMMMBB",
  "BBBBBBBBMBBB",
  "BBBBBBBBBBBB",
  "BBBBBBBBBBBB",
];
export const WALLPAPER_DAY: Palette = { B: "#F3E3C3", M: "#EBD5AE" };
export const WALLPAPER_NIGHT: Palette = { B: "#2A2440", M: "#322B4C" };

export const FLOOR_TILE: Art = [
  "HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
  "WWWWWWWWWWWWWWWWWWWWWLWWWWWWWWWW",
  "WWWWWWWWWWWWWWWWWWWWWLWWWWWWWWWW",
  "WWWWWWWWWWWWWWWWWWWWWLWWWWWWWWWW",
  "LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL",
  "HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
  "WWWWWWLWWWWWWWWWWWWWWWWWWWWWWWWW",
  "WWWWWWLWWWWWWWWWWWWWWWWWWWWWWWWW",
  "WWWWWWLWWWWWWWWWWWWWWWWWWWWWWWWW",
  "LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL",
];
export const FLOOR_DAY: Palette = { W: "#B9773E", L: "#8A5428", H: "#CF8F55" };
export const FLOOR_NIGHT: Palette = { W: "#6B4A33", L: "#4A3324", H: "#7D5A3F" };

/* ---------- Kursor ---------- */

export const CURSOR_ARROW: Art = [
  "K.........",
  "KK........",
  "KWK.......",
  "KWWK......",
  "KWWWK.....",
  "KWWWWK....",
  "KWWWWWK...",
  "KWWWWWWK..",
  "KWWWWWWWK.",
  "KWWWWKKKKK",
  "KWWKWWK...",
  "KWK.KWWK..",
  "KK..KWWK..",
  ".....KWWK.",
  "......KK..",
];

export const CURSOR_HAND: Art = [
  "....KK......",
  "...KWWK.....",
  "...KWWK.....",
  "...KWWK.....",
  "...KWWKKKKK.",
  "...KWWKWWKWK",
  "KK.KWWWWWWWK",
  "KWKKWWWWWWWK",
  "KWWKWWWWWWWK",
  ".KWWWWWWWWWK",
  ".KWWWWWWWWWK",
  "..KWWWWWWWK.",
  "..KWWWWWWWK.",
  "...KWWWWWK..",
  "...KKKKKKK..",
];
export const CURSOR_PALETTE: Palette = { K: "#2B1E16", W: "#FFFFFF" };
