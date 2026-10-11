import type { Art, Palette } from "./sprite";
import { WALLPAPER_DAY, WALLPAPER_NIGHT, WALLPAPER_TILE } from "./sprites";

// Motif dinding tiap ruangan, supaya setiap ruangan terasa berbeda. Warnanya dijaga mirip terangnya
// dengan dinding ruang tamu, jadi teks dan kartu di atasnya tetap mudah dibaca.

type Painter = (x: number, y: number) => string;
const paint = (w: number, h: number, fn: Painter): Art =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y)).join(""));

export type RoomWall = { tile: Art; day: Palette; night: Palette };

export const ROOM_WALLS: Record<string, RoomWall> = {
  // Ruang tamu: titik permata (motif lama).
  hero: { tile: WALLPAPER_TILE, day: WALLPAPER_DAY, night: WALLPAPER_NIGHT },
  // Ruang kerja: garis vertikal tipis ala kantor.
  projects: {
    tile: paint(12, 12, (x, y) => (x === 0 ? "M" : x === 6 && y % 3 === 0 ? "N" : "B")),
    day: { B: "#E9EADB", M: "#DCDEC8", N: "#D2D5BC" },
    night: { B: "#232838", M: "#2B3144", N: "#30374B" },
  },
  // Galeri skill: kisi wajik.
  skills: {
    tile: paint(12, 12, (x, y) => (x === y || x === 11 - y ? "M" : "B")),
    day: { B: "#F2E2D8", M: "#E8D1C3" },
    night: { B: "#2C2338", M: "#362B45" },
  },
  // Ruang sertifikat: garis miring seperti kertas dinding ruang baca.
  certificates: {
    tile: paint(12, 12, (x, y) => ((x + y) % 6 === 0 ? "M" : (x + y) % 6 === 3 && x % 2 === 0 ? "N" : "B")),
    day: { B: "#EFE4CB", M: "#E2D2AE", N: "#E8DABB" },
    night: { B: "#2A2534", M: "#352E42", N: "#2F293B" },
  },
  // Kamar: kotak-kotak flanel.
  bedroom: {
    tile: paint(12, 12, (x, y) => {
      const a = x === 2 || x === 3;
      const b = y === 2 || y === 3;
      if (a && b) return "N";
      return a || b || x === 8 || y === 8 ? "M" : "B";
    }),
    day: { B: "#E2E8EE", M: "#D3DCE5", N: "#C5D0DB" },
    night: { B: "#1F2639", M: "#262E44", N: "#2D364E" },
  },
  // Teras: dinding bata.
  contact: {
    tile: paint(12, 12, (x, y) => {
      if (y % 6 === 5) return "M";
      const off = Math.floor(y / 6) % 2 === 0 ? 0 : 6;
      if ((x + off) % 12 === 11) return "M";
      return y % 6 === 0 && [1, 2].includes((x + off) % 12) ? "N" : "B";
    }),
    day: { B: "#EED7C2", M: "#F7EADB", N: "#E6C9AF" },
    night: { B: "#30252F", M: "#3A2E3A", N: "#382B36" },
  },
};
