import type { Art, Palette } from "./sprite";

// Pemeran di rumah pixel. Semua digambar khusus untuk portofolio ini; selain "me", tokohnya fiktif.

export type CastId =
  | "me"
  | "dina"
  | "bayu"
  | "client"
  | "raka"
  | "sari"
  | "kevin"
  | "rina"
  | "budi"
  | "tari"
  | "joko"
  | "lala"
  | "nadia";

export type CharacterArt = {
  idle: Art;
  a: Art;
  b: Art;
  sit: Art;
  /** Berbaring (untuk tidur): sprite berdiri diputar 90 derajat, kepala di kiri. */
  lie: Art;
  palette: Palette;
};

/** Putar sprite 90 derajat berlawanan arah jarum jam. */
function rotate(art: Art): Art {
  const h = art.length;
  const w = Math.max(...art.map((r) => r.length));
  return Array.from({ length: w }, (_, r) =>
    Array.from({ length: h }, (_, c) => art[c][w - 1 - r] ?? ".").join(""),
  ).reverse();
}

const DEFAULT_TORSO = [
  "..DBBBBBBD..",
  ".DBBBYYBBBD.",
  ".SDBBYYBBDS.",
  ".SBBBBBBBBS.",
  "..BBBBBBBB..",
];

const LEGS = {
  idle: ["..NNN..NNN..", "..OOO..OOO.."],
  a: [".NNN....NNN.", ".OOO....OOO."],
  b: ["...NNNNNN...", "...OOOOOO..."],
  sit: ["..NNNNNNNN..", "..OO....OO.."],
};

function character(head: string[], palette: Palette, torso: string[] = DEFAULT_TORSO): CharacterArt {
  const top = [...head, ...torso];
  return {
    idle: [...top, ...LEGS.idle],
    a: [...top, ...LEGS.a],
    b: [...top, ...LEGS.b],
    sit: [...top, ...LEGS.sit],
    lie: rotate([...top, ...LEGS.idle]),
    palette,
  };
}

export const CAST: Record<CastId, CharacterArt> = {
  // Pemilik portofolio: topi tinggi dan kacamata.
  me: character(
    [
      "....HHHH....",
      "....HHHH....",
      "....AAAA....",
      "..HHHHHHHH..",
      "...SSSSSS...",
      "..GLGSSGLG..",
      "..SSSSSSSS..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      H: "#3B2A20", A: "#E0605A", S: "#F2C79A", G: "#2B1E16", L: "#9FD3FF", M: "#B54848",
      B: "#4F7CAC", D: "#3A5E86", Y: "#F2A33A", N: "#3B2A20", O: "#6B3A1F",
    },
  ),
  // Dina: rambut kuncir, kaos ungu.
  dina: character(
    [
      "....HHHH....",
      "...HHHHHH...",
      "..HHHHHHHH..",
      "..HHHHHHHHHH",
      "..HSSSSSSHHH",
      "..HSKSSKSH.H",
      "..HSSSSSSH..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      H: "#5A3825", S: "#E8B48A", K: "#2B1E16", M: "#C25555",
      B: "#9B6BB5", D: "#7A4F96", Y: "#FFE7B8", N: "#3B4A6B", O: "#2B1E16",
    },
  ),
  // Bayu: topi hijau, kaos oranye.
  bayu: character(
    [
      "............",
      "...CCCCCC...",
      "..CCCCCCCC..",
      "..CCCCCCCCCC",
      "...SSSSSS...",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      C: "#2FA36B", S: "#C98C5A", K: "#2B1E16", M: "#8A4A3A",
      B: "#F2A33A", D: "#C77B1E", Y: "#FFF8EC", N: "#4A3324", O: "#E8E8E8",
    },
  ),
  // Klien: berkumis, jas, dasi merah.
  client: character(
    [
      "............",
      "............",
      "...SSSSSS...",
      "..GSSSSSSG..",
      "..GSSSSSSG..",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SMMMMS...",
      "....SSSS....",
    ],
    {
      S: "#F2C79A", G: "#9A9A9A", K: "#2B1E16", M: "#5A3825",
      B: "#4A4F5C", D: "#353943", W: "#FFFFFF", T: "#E0605A", N: "#353943", O: "#2B1E16",
    },
    ["..DBBWWBBD..", ".DBBBWTBBBD.", ".SDBBWTBBDS.", ".SBBBBTBBBS.", "..BBBBBBBB.."],
  ),
  // Raka: sesama developer, kupluk dan hoodie abu.
  raka: character(
    [
      "............",
      "...CCCCCC...",
      "..CCCCCCCC..",
      "..WWWWWWWW..",
      "...SSSSSS...",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      C: "#2C6B68", W: "#E8E0D0", S: "#E8B48A", K: "#2B1E16", M: "#B54848",
      B: "#6E7681", D: "#545B64", Y: "#2EC4B6", N: "#2B2B45", O: "#E8E8E8",
    },
  ),
  // Sari: HR / recruiter, berhijab.
  sari: character(
    [
      "....HHHH....",
      "...HHHHHH...",
      "..HHHHHHHH..",
      "..HHHHHHHH..",
      "..HSSSSSSH..",
      "..HSKSSKSH..",
      "..HSSSSSSH..",
      "..HHSMMSHH..",
      "...HHHHHH...",
    ],
    {
      H: "#C0564B", S: "#E8B48A", K: "#2B1E16", M: "#B54848",
      B: "#F3EDE2", D: "#C9BFAE", Y: "#C0564B", N: "#3B3B4F", O: "#2B1E16",
    },
  ),
  // Kevin: founder startup, rambut jabrik, hoodie.
  kevin: character(
    [
      "............",
      "...H.H.H.H..",
      "..HHHHHHHH..",
      "..HHHHHHHH..",
      "...SSSSSS...",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      H: "#1B1B2F", S: "#F2C79A", K: "#2B1E16", M: "#B54848",
      B: "#2B2B45", D: "#1B1B2F", Y: "#F2A33A", N: "#4F7CAC", O: "#FFFFFF",
    },
  ),
  // Rina: pemilik toko online, rambut disanggul.
  rina: character(
    [
      ".....HH.....",
      "....HHHH....",
      "...HHHHHH...",
      "..HHHHHHHH..",
      "..HSSSSSSH..",
      "..HSKSSKSH..",
      "..HSSSSSSH..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      H: "#2B1E16", S: "#C98C5A", K: "#2B1E16", M: "#C25555",
      B: "#E0605A", D: "#B8443F", Y: "#FFE7B8", N: "#3B2A20", O: "#6B3A1F",
    },
  ),
  // Pak Budi: pemilik rumah makan, berpeci dan berkumis.
  budi: character(
    [
      "............",
      "...KKKKKK...",
      "..KKKKKKKK..",
      "..KKKKKKKK..",
      "...SSSSSS...",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SMMMMS...",
      "....SSSS....",
    ],
    {
      K: "#1B1B2F", S: "#9C6644", M: "#2B1E16",
      B: "#5BA35B", D: "#3E7A3E", Y: "#F3EDE2", N: "#3B2A20", O: "#2B1E16",
    },
  ),
  // Tari: pemilik toko kue, rambut bob dan celemek.
  tari: character(
    [
      "............",
      "...HHHHHH...",
      "..HHHHHHHH..",
      "..HHHHHHHH..",
      "..HSSSSSSH..",
      "..HSKSSKSH..",
      "..HSSSSSSH..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      H: "#8A4A3A", S: "#F2C79A", K: "#2B1E16", M: "#C25555",
      B: "#F49AC1", D: "#D1729B", W: "#FFF8EC", N: "#3B4A6B", O: "#2B1E16",
    },
    ["..DBBBBBBD..", ".DBWWWWWWBD.", ".SDWWWWWWDS.", ".SBWWWWWWBS.", "..BBBBBBBB.."],
  ),
  // Joko: kurir paket, topi dan rompi oranye.
  joko: character(
    [
      "............",
      "...CCCCCC...",
      "..CCCCCCCC..",
      "CCCCCCCCCC..",
      "...SSSSSS...",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      C: "#E0605A", S: "#C98C5A", K: "#2B1E16", M: "#8A4A3A",
      B: "#F2A33A", D: "#C77B1E", W: "#4F7CAC", N: "#2B2B45", O: "#2B1E16",
    },
    ["..DBBWWBBD..", ".DBBBWWBBBD.", ".WDBBWWBBDW.", ".WBBBWWBBBW.", "..BBBBBBBB.."],
  ),
  // Lala: mahasiswi magang, rambut panjang terurai.
  lala: character(
    [
      "....HHHH....",
      "...HHHHHH...",
      "..HHHHHHHH..",
      "..HHHHHHHH..",
      "..HSSSSSSH..",
      "..HSKSSKSH..",
      "..HSSSSSSH..",
      ".HHSSMMSSHH.",
      ".HH.SSSS.HH.",
    ],
    {
      H: "#3B2A20", S: "#F2C79A", K: "#2B1E16", M: "#C25555",
      B: "#7FB3D5", D: "#5A8FB3", Y: "#FFF8EC", N: "#3B4A6B", O: "#E8E8E8",
    },
  ),
  // Nadia: product manager, rambut pendek dan kacamata.
  nadia: character(
    [
      "............",
      "...HHHHHH...",
      "..HHHHHHHH..",
      "..HHHHHHHH..",
      "..HSSSSSSH..",
      "..GLGSSGLG..",
      "..SSSSSSSS..",
      "...SSMMSS...",
      "....SSSS....",
    ],
    {
      H: "#1B1B2F", S: "#E8B48A", G: "#2B1E16", L: "#CDEBFF", M: "#B54848",
      B: "#3A8C88", D: "#2C6B68", Y: "#FFE7B8", N: "#2B2B45", O: "#6B3A1F",
    },
  ),
};

/** Nama dan peran singkat tiap tokoh (untuk aksesibilitas dan perkenalan). */
export const CAST_INFO: Record<CastId, { name: string; role: { id: string; en: string } }> = {
  me: { name: "Rizky", role: { id: "pemilik rumah", en: "host" } },
  dina: { name: "Dina", role: { id: "teman, desainer", en: "friend, designer" } },
  bayu: { name: "Bayu", role: { id: "teman, gamer", en: "friend, gamer" } },
  client: { name: "Pak Hendra", role: { id: "klien", en: "client" } },
  raka: { name: "Raka", role: { id: "sesama developer", en: "fellow developer" } },
  sari: { name: "Sari", role: { id: "HR / recruiter", en: "HR / recruiter" } },
  kevin: { name: "Kevin", role: { id: "founder startup", en: "startup founder" } },
  rina: { name: "Rina", role: { id: "pemilik toko online", en: "online shop owner" } },
  budi: { name: "Pak Budi", role: { id: "pemilik rumah makan", en: "restaurant owner" } },
  tari: { name: "Tari", role: { id: "pemilik toko kue", en: "bakery owner" } },
  joko: { name: "Joko", role: { id: "kurir", en: "courier" } },
  lala: { name: "Lala", role: { id: "mahasiswi magang", en: "intern" } },
  nadia: { name: "Nadia", role: { id: "product manager", en: "product manager" } },
};

/* ---------- Aksesori (dipegang karakter) ---------- */

export const ACC_PHONE: Art = ["KKK", "KSK", "KSK", "KSK", "KKK"];
export const ACC_PHONE_PALETTE: Palette = { K: "#2B1E16", S: "#7FD8F5" };

export const ACC_BOOK: Art = [".RRRRRRR.", "RWWWRWWWR", "RWWWRWWWR", "RWWWRWWWR", "RRRRRRRRR"];
export const ACC_BOOK_PALETTE: Palette = { R: "#C0564B", W: "#FFF8EC" };

export const ACC_FOOD: Art = [".YYYY.", "GGGGGG", "RRRRRR", ".YYYY."];
export const ACC_FOOD_PALETTE: Palette = { Y: "#E8B04A", G: "#5BA35B", R: "#E0605A" };

export const ACC_PAD: Art = ["KKKKKKKK", "KRKKKKBK", "KKKKKKKK", ".KK..KK."];
export const ACC_PAD_PALETTE: Palette = { K: "#3B3B4F", R: "#E0605A", B: "#4F7CAC" };

export const ACC_MUG: Art = ["MMMM.", "MMMMH", "MMMMH", ".MM.."];
export const ACC_MUG_PALETTE: Palette = { M: "#FFF8EC", H: "#C4B8A8" };

/** Gitar yang dipeluk saat dimainkan (badan di kiri, leher ke kanan atas). */
export const ACC_GUITAR: Art = [
  "..........KK",
  ".........NK.",
  "........NN..",
  ".OOO...NN...",
  "OOOOONNN....",
  "OOKOOO......",
  "OOOOO.......",
  ".OOO........",
];
export const ACC_GUITAR_PALETTE: Palette = { K: "#3B2A20", N: "#8B5A2B", O: "#D9883A" };

/** Awan debu untuk adegan "berantem" bercanda. */
export const DUST: Art = Array.from({ length: 16 }, (_, y) => {
  let row = "";
  for (let x = 0; x < 30; x++) {
    const blobs = [
      [8, 9, 6],
      [15, 6, 7],
      [22, 9, 6],
      [12, 11, 5],
      [19, 11, 5],
    ];
    const inside = blobs.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r);
    const star = ["4,3", "26,4", "6,14", "25,13", "15,0"].includes(`${x},${y}`);
    row += star ? "Y" : inside ? ((x + y) % 7 === 0 ? "D" : "W") : ".";
  }
  return row;
});
export const DUST_PALETTE: Palette = { W: "#EDE6D8", D: "#C9BFAE", Y: "#F2A33A" };
