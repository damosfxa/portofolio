"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useGame } from "@/components/game/game-provider";
import { Sprite } from "@/components/game/sprite";
import { Floor } from "@/components/game/scenery";
import { DOOR, DOOR_PALETTE } from "@/components/game/sprites";
import { DOOR_OPEN, DOOR_OPEN_PALETTE } from "@/components/game/props";
import type { SceneApi } from "@/components/game/scene";
import type { Talk } from "@/content/dialogue";
import { scrollToId } from "@/lib/scroll";

export const PX = "var(--px)";

/** Pintu: buka/tutup diatur mesin adegan lewat data-state; diklik untuk pindah ruangan. */
export function Door({
  id,
  to,
  label,
  className = "",
}: {
  id: string;
  to?: string;
  label?: string;
  className?: string;
}) {
  const { play, fx } = useGame();
  const content = (
    <>
      <span className="s-closed block">
        <Sprite art={DOOR} palette={DOOR_PALETTE} px={PX} />
      </span>
      <span className="s-open block">
        <Sprite art={DOOR_OPEN} palette={DOOR_OPEN_PALETTE} px={PX} />
      </span>
    </>
  );
  if (!to) {
    return (
      <div data-prop={id} data-state="closed" className={`prop absolute bottom-0 ${className}`} aria-hidden>
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      data-prop={id}
      data-state="closed"
      aria-label={label}
      title={label}
      onClick={(e) => {
        play("select");
        fx("doorOpen");
        e.currentTarget.dataset.state = "open";
        const btn = e.currentTarget;
        window.setTimeout(() => {
          scrollToId(to);
          btn.dataset.state = "closed";
          fx("doorClose");
        }, 450);
      }}
      className={`prop group absolute bottom-0 focus-visible:outline-4 focus-visible:outline-dashed focus-visible:outline-coin ${className}`}
    >
      {content}
      {label && (
        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-line px-2 py-1 font-pixel text-sm text-coin opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      )}
    </button>
  );
}

/** Kerangka ruangan: dinding (judul, isi), panggung adegan, lantai. */
export function RoomShell({
  id,
  wall,
  stage,
  className = "",
}: {
  id: string;
  wall?: React.ReactNode;
  stage: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`wall-${id} relative scroll-mt-24 [--px:2.2px] sm:[--px:3px] md:[--px:4px] ${className}`}>
      {wall && <div className="mx-auto w-full max-w-6xl px-6 pt-20 md:pt-28">{wall}</div>}
      <div className="mx-auto mt-10 w-full max-w-6xl px-2 sm:px-6">{stage}</div>
      <Floor height={36} />
    </section>
  );
}

/** Mainkan satu percakapan: setiap pembicara menghadap lawan bicaranya. */
export async function playTalk(api: SceneApi, talk: Talk, cast: Partial<Record<"a" | "b" | "me", string>>) {
  for (const [role, line] of talk) {
    const id = cast[role];
    if (!id) continue;
    const other = Object.values(cast).find((o) => o && o !== id);
    if (other) api.faceTo(id, other);
    await api.say(id, line);
  }
}

/**
 * Tokoh masuk lewat pintu: pintu terbuka, tokoh muncul dan berjalan ke posisi, pintu tertutup.
 * Tokoh dipesan dulu; bila ternyata sedang berada di ruangan lain, ia tidak masuk (mengembalikan false).
 */
export async function enter(api: SceneApi, actor: string, door: string, to: number) {
  if (!api.reserve(actor)) return false;
  const x = api.spot(door);
  api.prop(door, "open");
  api.place(actor, x);
  await api.wait(250);
  api.show(actor, true);
  await api.walk(actor, to);
  api.prop(door, "closed");
  return true;
}

/** Tokoh keluar lewat pintu lalu menghilang. */
export async function leave(api: SceneApi, actor: string, door: string) {
  await api.walk(actor, api.spot(door));
  api.prop(door, "open");
  await api.wait(200);
  api.show(actor, false);
  await api.wait(300);
  api.prop(door, "closed");
}

export function useT() {
  return useLanguage().t;
}
