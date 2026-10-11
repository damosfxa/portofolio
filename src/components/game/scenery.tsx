import { spriteDataUri } from "@/components/game/sprite";
import {
  CURSOR_ARROW,
  CURSOR_HAND,
  CURSOR_PALETTE,
  FLOOR_DAY,
  FLOOR_NIGHT,
  FLOOR_TILE,
  WALLPAPER_DAY,
  WALLPAPER_NIGHT,
  WALLPAPER_TILE,
} from "@/components/game/sprites";
import { ROOM_WALLS } from "@/components/game/wallpapers";

// Tile dibuat sekali saat modul dimuat, lalu dipakai sebagai background CSS biasa (tanpa animasi).
const wallDay = spriteDataUri(WALLPAPER_TILE, WALLPAPER_DAY);
const wallNight = spriteDataUri(WALLPAPER_TILE, WALLPAPER_NIGHT);
const floorDay = spriteDataUri(FLOOR_TILE, FLOOR_DAY);
const floorNight = spriteDataUri(FLOOR_TILE, FLOOR_NIGHT);
const arrow = spriteDataUri(CURSOR_ARROW, CURSOR_PALETTE, 2);
// Motif dinding per ruangan: kelas .wall-<id> dipasang di <section> masing-masing.
const roomWalls = Object.entries(ROOM_WALLS)
  .map(
    ([id, w]) =>
      `.wall-${id} { background-color: ${w.day.B}; background-image: ${spriteDataUri(w.tile, w.day)}; background-size: 36px 36px; image-rendering: pixelated; }
      .dark .wall-${id} { background-color: ${w.night.B}; background-image: ${spriteDataUri(w.tile, w.night)}; }`,
  )
  .join(" ");
const hand = spriteDataUri(CURSOR_HAND, CURSOR_PALETTE, 2);

/** Gaya global halaman utama: motif wallpaper, lantai kayu, dan kursor pixel. Admin tidak terpengaruh. */
export function RoomStyles() {
  return (
    <style>{`
      .wallpaper { background-color: #F3E3C3; background-image: ${wallDay}; background-size: 36px 36px; image-rendering: pixelated; }
      .dark .wallpaper { background-color: #2A2440; background-image: ${wallNight}; }
      .floor { background-image: ${floorDay}; background-size: 96px 30px; image-rendering: pixelated; }
      .dark .floor { background-image: ${floorNight}; }
      ${roomWalls}
      @media (pointer: fine) {
        body { cursor: ${arrow} 0 0, auto; }
        a, button, [role="button"], label, summary { cursor: ${hand} 8 0, pointer; }
        input, textarea { cursor: text; }
      }
    `}</style>
  );
}

/** Lantai kayu dengan list (plint) di atasnya. */
export function Floor({ height = 56, className = "" }: { height?: number; className?: string }) {
  return (
    <div className={`w-full ${className}`} aria-hidden>
      <div className="h-2 w-full bg-line" />
      <div className="floor w-full" style={{ height }} />
    </div>
  );
}
