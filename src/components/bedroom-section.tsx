"use client";

import { useState } from "react";
import { Scene } from "@/components/game/scene";
import { Sprite } from "@/components/game/sprite";
import { SectionTitle } from "@/components/game/section-title";
import { DESK, DESK_PALETTE } from "@/components/game/sprites";
import { CHAIR, CHAIR_PALETTE } from "@/components/game/props";
import { WallClock } from "@/components/game/wall-clock";
import {
  BED,
  BED_LAMP,
  BED_LAMP_OFF,
  BED_LAMP_ON,
  BED_PALETTE,
  BED_RUG,
  BED_RUG_PALETTE,
  DUMBBELL,
  DUMBBELL_PALETTE,
  FAIRY_DAY,
  FAIRY_LIGHTS,
  FAIRY_NIGHT,
  GUITAR,
  GUITAR_PALETTE,
  JERSEY,
  JERSEY_PALETTE,
  NIGHTSTAND,
  NIGHTSTAND_PALETTE,
  PC_TOWER,
  PC_TOWER_PALETTE,
  PENNANT,
  PENNANT_PALETTE,
  POSTER_GAME,
  POSTER_GAME_PALETTE,
  POSTER_ROCK,
  POSTER_ROCK_PALETTE,
  WALL_SHELF,
  WALL_SHELF_PALETTE,
  WARDROBE_CLOSED,
  WARDROBE_OPEN,
  WARDROBE_PALETTE,
  GUITAR_STAND,
  SAJADAH_OPEN,
  SAJADAH_PALETTE,
  SAJADAH_ROLLED,
  SCREEN_CODE,
  SCREEN_GAME_A,
  SCREEN_GAME_B,
  SCREEN_GOOGLE,
  SCREEN_OFF,
  SCREEN_PALETTE,
  SCREEN_PROJECT,
} from "@/components/game/bedroom";
import { Door, PX, RoomShell } from "@/components/rooms/shared";
import { BEDROOM_FRIENDS, makeBedroomRoutine } from "@/components/rooms/bedroom-routine";
import { useLanguage } from "@/contexts/LanguageContext";

// Hiasan dinding sedikit lebih besar dari perabot supaya terbaca dari jauh.
const WALL_PX = "calc(var(--px) * 1.25)";

/** Hiasan dinding kamar: lampu tumbler, poster, jersey, rak koleksi. */
function BedroomWall() {
  return (
    <div className="relative" aria-hidden>
      {/* Lampu tumbler membentang di atas, menyala saat malam */}
      <div className="flex justify-center overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={i >= 2 ? "hidden md:block" : "block"}>
            <Sprite art={FAIRY_LIGHTS} palette={FAIRY_DAY} px={WALL_PX} className="dark:hidden" />
            <Sprite art={FAIRY_LIGHTS} palette={FAIRY_NIGHT} px={WALL_PX} className="hidden dark:block animate-blink" />
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-center gap-6 sm:gap-10 md:gap-14">
        <span className="-rotate-6 self-start">
          <Sprite art={PENNANT} palette={PENNANT_PALETTE} px={WALL_PX} />
        </span>
        <span className="rotate-2">
          <Sprite art={POSTER_ROCK} palette={POSTER_ROCK_PALETTE} px={WALL_PX} />
        </span>
        <span className="hidden self-start sm:block">
          <WallClock px={WALL_PX} />
        </span>
        <span className="-rotate-1">
          <Sprite art={JERSEY} palette={JERSEY_PALETTE} px={WALL_PX} />
        </span>
        <span className="hidden md:block">
          <Sprite art={WALL_SHELF} palette={WALL_SHELF_PALETTE} px={WALL_PX} />
        </span>
        <span className="hidden rotate-3 self-start sm:block">
          <Sprite art={POSTER_GAME} palette={POSTER_GAME_PALETTE} px={WALL_PX} />
        </span>
      </div>
    </div>
  );
}

export function BedroomSection({ index, nextRoom }: { index: number; nextRoom: string }) {
  const { t } = useLanguage();
  // Rutinitas harian mengikuti jam pengunjung (lihat bedroom-routine.ts).
  const [run] = useState(makeBedroomRoutine);

  return (
    <RoomShell
      id="bedroom"
      wall={
        <>
          <SectionTitle index={index} titleKey="bedroom.title" />
          <BedroomWall />
        </>
      }
      stage={
        <Scene
          className="h-[150px] sm:h-[170px] md:h-[200px]"
          actors={[
            { id: "me", cast: "me", x: 5, hidden: true },
            ...BEDROOM_FRIENDS.map((id) => ({ id, cast: id, x: 5, hidden: true })),
          ]}
          script={run}
          nightMode="script"
        >
          <Door id="door-l" className="left-0" />

          {/* Sudut sholat: area kosong di tengah kamar, sajadah tergulung dan dibentangkan saat sholat */}
          <div data-prop="sajadah" data-state="closed" className="prop absolute bottom-0 left-[41%] sm:left-[45.5%]" aria-hidden>
            <span className="s-closed absolute bottom-0 left-0 block">
              <Sprite art={SAJADAH_ROLLED} palette={SAJADAH_PALETTE} px={PX} />
            </span>
            <span className="s-open block">
              <Sprite art={SAJADAH_OPEN} palette={SAJADAH_PALETTE} px={PX} />
            </span>
          </div>

          <div data-prop="wardrobe" data-state="closed" className="prop absolute bottom-0 left-[8.5%] hidden sm:block" aria-hidden>
            <span className="s-closed block">
              <Sprite art={WARDROBE_CLOSED} palette={WARDROBE_PALETTE} px={PX} />
            </span>
            <span className="s-open block">
              <Sprite art={WARDROBE_OPEN} palette={WARDROBE_PALETTE} px={PX} />
            </span>
          </div>

          <div className="absolute bottom-0 left-[12%] sm:left-[19%]" aria-hidden>
            <Sprite art={BED_RUG} palette={BED_RUG_PALETTE} px={PX} className="absolute bottom-0 left-[calc(10*var(--px))]" />
          </div>
          <div data-prop="bed" className="absolute bottom-0 left-[12%] sm:left-[19%]" aria-hidden>
            <Sprite art={BED} palette={BED_PALETTE} px={PX} />
          </div>

          {/* Meja kecil dan lampu tidur */}
          <div data-prop="lamp" data-state="closed" className="prop absolute bottom-0 left-[37%] hidden sm:block" aria-hidden>
            <span className="absolute bottom-full left-[calc(2*var(--px))] block">
              <span className="s-closed block">
                <Sprite art={BED_LAMP} palette={BED_LAMP_OFF} px={PX} />
              </span>
              <span className="s-open block">
                <Sprite art={BED_LAMP} palette={BED_LAMP_ON} px={PX} />
              </span>
            </span>
            <Sprite art={NIGHTSTAND} palette={NIGHTSTAND_PALETTE} px={PX} />
          </div>

          {/* Meja PC gaming: layar berganti sesuai yang sedang dikerjakan */}
          <div className="absolute bottom-0 left-[58%] sm:left-[59%]" aria-hidden>
            <span data-prop="pc" data-state="off" className="pc-screen absolute bottom-full left-[calc(4*var(--px))] block">
              <Sprite art={SCREEN_OFF} palette={SCREEN_PALETTE} px={PX} className="scr scr-off" />
              <Sprite art={SCREEN_CODE} palette={SCREEN_PALETTE} px={PX} className="scr scr-code" />
              <Sprite art={SCREEN_GOOGLE} palette={SCREEN_PALETTE} px={PX} className="scr scr-google" />
              <Sprite art={SCREEN_PROJECT} palette={SCREEN_PALETTE} px={PX} className="scr scr-project" />
              <span className="scr scr-game relative">
                <Sprite art={SCREEN_GAME_A} palette={SCREEN_PALETTE} px={PX} />
                <Sprite art={SCREEN_GAME_B} palette={SCREEN_PALETTE} px={PX} className="absolute inset-0 animate-blink" />
              </span>
            </span>
            <span className="absolute bottom-full right-[calc(3*var(--px))] hidden sm:block">
              <Sprite art={PC_TOWER} palette={PC_TOWER_PALETTE} px={PX} />
            </span>
            <Sprite art={DESK} palette={DESK_PALETTE} px={PX} />
            <span data-prop="chair" className="absolute bottom-0 left-[calc(10*var(--px))] z-10 block">
              <Sprite art={CHAIR} palette={CHAIR_PALETTE} px={PX} />
            </span>
          </div>

          {/* Gitar: diambil dari standarnya saat dimainkan */}
          <div data-prop="guitar" data-state="closed" className="prop absolute bottom-0 left-[81%] sm:left-[76%]" aria-hidden>
            <span className="s-closed block">
              <Sprite art={GUITAR} palette={GUITAR_PALETTE} px={PX} />
            </span>
            <span className="s-open block">
              <Sprite art={GUITAR_STAND} palette={GUITAR_PALETTE} px={PX} />
            </span>
          </div>

          <div data-prop="dumbbell" className="absolute bottom-0 left-[83%] hidden sm:block" aria-hidden>
            <Sprite art={DUMBBELL} palette={DUMBBELL_PALETTE} px={PX} />
          </div>

          <Door id="door-r" to={nextRoom} label={t("door.next")} className="right-0" />
        </Scene>
      }
    />
  );
}
