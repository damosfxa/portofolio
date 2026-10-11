"use client";

import { useState } from "react";
import { Scene, bag, rand, type SceneApi } from "@/components/game/scene";
import { Sprite } from "@/components/game/sprite";
import {
  BOOKSHELF,
  BOOKSHELF_PALETTE,
  CAT_AWAKE,
  CAT_PALETTE,
  CAT_SLEEP,
  DESK,
  DESK_PALETTE,
  HEART,
  HEART_PALETTE,
  MONITOR,
  MONITOR_PALETTE,
  MONITOR_PALETTE_NIGHT,
  MUG,
  MUG_PALETTE,
  STEAM,
  STEAM_PALETTE,
} from "@/components/game/sprites";
import {
  CABINET,
  CABINET_PALETTE,
  CHAIR,
  CHAIR_PALETTE,
  CONSOLE,
  CONSOLE_PALETTE,
  FRIDGE_CLOSED,
  FRIDGE_OPEN,
  FRIDGE_PALETTE,
  SOFA,
  SOFA_PALETTE,
  SOFA_SEAT,
  TV_OFF,
  TV_ON,
  TV_ON_PALETTE,
  TV_PALETTE,
} from "@/components/game/props";
import { FIGHT_TALKS, GREETINGS, MAKE_UP, ME_SOLO } from "@/content/dialogue";
import { roomContent } from "@/content/visitors";
import { useGame } from "@/components/game/game-provider";
import { PAINTING, PAINTING_PALETTE } from "@/components/game/furniture";
import { Door, PX, playTalk } from "@/components/rooms/shared";
import { makeVisitorScript, type VisitorCtx } from "@/components/rooms/visitors";
import { livingNight } from "@/components/rooms/night-acts";
import { useLanguage } from "@/contexts/LanguageContext";

const CHAIR_SEAT = 9;
const GUESTS = ["dina", "bayu", "lala", "raka"] as const;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function LivingRoom({ nextRoom }: { nextRoom: string }) {
  const { t } = useLanguage();
  const { play } = useGame();
  const [catAwake, setCatAwake] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);

  const petCat = () => {
    play("meow");
    setCatAwake(true);
    const key = Date.now();
    setHearts((h) => [...h, key]);
    window.setTimeout(() => setHearts((h) => h.filter((x) => x !== key)), 900);
    window.setTimeout(() => setCatAwake(false), 1600);
  };

  // Teman-teman datang bergantian; selain mengobrol, mereka memakai perabot di ruang tamu.
  const [run] = useState(() => {
    const meLines = bag(ME_SOLO);
    const fights = bag(FIGHT_TALKS);
    const makeUp = bag(MAKE_UP);

    const read = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      const shelf = api.spot("shelf");
      if (Number.isFinite(shelf)) {
        await api.walk(who, shelf);
        api.pose(who, { acc: "book" });
        await api.wait(900);
      }
      await api.walk(who, api.spot("sofa", rand(0.25, 0.75)));
      api.pose(who, { sit: true, acc: "book", lift: SOFA_SEAT });
      await api.emote(who, "♪");
      await api.wait(rand(1500, 3000));
      c.tick(who);
    };

    const fridge = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      await api.walk(who, api.spot("fridge", 0.4));
      api.prop("fridge", "open");
      await api.emote(who, "!");
      await api.wait(500);
      api.pose(who, { acc: "food" });
      api.prop("fridge", "closed");
      await api.say(who, { id: "Numpang ambil camilan ya!", en: "Grabbing a snack!" });
      c.tick(who);
    };

    const game = async (api: SceneApi, c: VisitorCtx) => {
      const present = c.present();
      if (present.length < 2) return;
      const [a, b] = present.sort(() => Math.random() - 0.5);
      await Promise.all([api.walk(a, api.spot("sofa", 0.3)), api.walk(b, api.spot("sofa", 0.7))]);
      api.pose(a, { sit: true, acc: "pad", lift: SOFA_SEAT });
      api.pose(b, { sit: true, acc: "pad", lift: SOFA_SEAT });
      api.prop("tv", "open");
      await api.wait(2400);
      if (Math.random() < 0.45) {
        api.pose(a, {});
        api.pose(b, {});
        await playTalk(api, fights(), { a, b });
        await api.fight(a, b, 1500);
        await api.say(a, makeUp());
      } else {
        await api.emote(a, "♪");
        await api.say(a, { id: "Yes, menang!", en: "Yes, I won!" });
      }
      api.prop("tv", "closed");
      c.tick(a);
      c.tick(b);
    };

    // Kegiatan Rizky, hanya bila ia sedang ada di ruang tamu.
    const computer = async (api: SceneApi) => {
      const chair = api.spot("chair");
      if (!api.shown("me") || !Number.isFinite(chair)) return;
      await api.walk("me", chair);
      api.face("me", 1);
      api.pose("me", { sit: true, acc: "mug", lift: CHAIR_SEAT });
      api.sfx("type", 2500);
      await api.wait(2600);
      await api.say("me", meLines());
    };

    const phone = async (api: SceneApi) => {
      if (!api.shown("me")) return;
      api.pose("me", { acc: "phone" });
      await api.say("me", meLines());
    };

    return makeVisitorScript({
      content: roomContent("living", { projects: [], skills: [], certs: [] }),
      door: "door-l",
      spot: () => rand(20, 70),
      extras: [read, fridge, game, game, computer, phone],
    });
  });

  // Malam: teman-teman nobar, main konsol, dan ngemil di ruang tamu.
  const [night] = useState(livingNight);

  return (
    <Scene
      className="h-[170px] sm:h-[200px] md:h-[240px]"
      actors={[
        { id: "me", cast: "me", x: 5, hidden: true },
        ...GUESTS.map((id) => ({ id, cast: id, x: 5, hidden: true })),
      ]}
      script={run}
      exit="door-l"
      // Rizky masuk/keluar lewat pintu dalam rumah (kanan), tamu lewat pintu depan (kiri).
      roomId="hero"
      hostDoor="door-r"
      nightScript={night}
      nightEnd={(api) => {
        api.prop("tv", "closed");
        api.prop("fridge", "closed");
      }}
      onActorClick={(api, id) => {
        play("select");
        api.say(id, GREETINGS[Math.floor(Math.random() * GREETINGS.length)]).catch(() => {});
      }}
    >
      <Door id="door-l" className="left-0" />

      {/* Satu hiasan dinding, tepat di atas sofa */}
      <div className="absolute left-[23%] top-4 hidden sm:block" aria-hidden>
        <Sprite art={PAINTING} palette={PAINTING_PALETTE} px={PX} />
      </div>


      <div data-prop="shelf" className="absolute bottom-0 left-[9%] hidden sm:block" aria-hidden>
        <Sprite art={BOOKSHELF} palette={BOOKSHELF_PALETTE} px={PX} />
      </div>

      <div data-prop="sofa" className="absolute bottom-0 left-[15%] sm:left-[20%]" aria-hidden>
        <Sprite art={SOFA} palette={SOFA_PALETTE} px={PX} />
      </div>

      {/* TV di atas lemari, layar menyala saat ada yang main game */}
      <div data-prop="tv" data-state="closed" className="prop absolute bottom-0 left-[38%] hidden sm:block" aria-hidden>
        <span className="absolute bottom-full left-[calc(3*var(--px))] block">
          <span className="s-closed block">
            <Sprite art={TV_OFF} palette={TV_PALETTE} px={PX} />
          </span>
          <span className="s-open tv-screen block">
            <Sprite art={TV_ON} palette={TV_ON_PALETTE} px={PX} />
          </span>
        </span>
        <span className="absolute bottom-full right-[calc(1*var(--px))] block">
          <Sprite art={CONSOLE} palette={CONSOLE_PALETTE} px={PX} />
        </span>
        <Sprite art={CABINET} palette={CABINET_PALETTE} px={PX} />
      </div>

      <div data-prop="fridge" data-state="closed" className="prop absolute bottom-0 left-[44%] sm:left-[54%]" aria-hidden>
        <span className="s-closed block">
          <Sprite art={FRIDGE_CLOSED} palette={FRIDGE_PALETTE} px={PX} />
        </span>
        <span className="s-open block">
          <Sprite art={FRIDGE_OPEN} palette={FRIDGE_PALETTE} px={PX} />
        </span>
      </div>

      {/* Meja kerja dengan monitor, cangkir, dan kursi */}
      <div data-prop="desk" className="absolute bottom-0 left-[61%] sm:left-[64%]" aria-hidden>
        <span className="absolute bottom-full left-[calc(4*var(--px))] block">
          <Sprite art={MONITOR} palette={MONITOR_PALETTE} px={PX} className="dark:hidden" />
          <Sprite art={MONITOR} palette={MONITOR_PALETTE_NIGHT} px={PX} className="hidden dark:block" />
        </span>
        <span className="absolute bottom-full right-[calc(4*var(--px))] block">
          <span className="absolute -top-[calc(6*var(--px))] left-[calc(2*var(--px))] animate-steam">
            <Sprite art={STEAM} palette={STEAM_PALETTE} px={PX} />
          </span>
          <Sprite art={MUG} palette={MUG_PALETTE} px={PX} />
        </span>
        <Sprite art={DESK} palette={DESK_PALETTE} px={PX} />
        <span data-prop="chair" className="absolute bottom-0 left-[calc(10*var(--px))] z-10 block">
          <Sprite art={CHAIR} palette={CHAIR_PALETTE} px={PX} />
        </span>
      </div>

      <button
        type="button"
        onClick={petCat}
        aria-label={t("obj.cat")}
        title={t("obj.cat")}
        className="absolute bottom-0 left-[84%] hidden sm:block"
      >
        {!catAwake && <span className="absolute -top-3 right-0 font-pixel text-sm text-ink-soft animate-zzz">z</span>}
        {hearts.map((key) => (
          <span key={key} className="absolute -top-4 left-1/2 -translate-x-1/2 animate-steam">
            <Sprite art={HEART} palette={HEART_PALETTE} px={PX} />
          </span>
        ))}
        <Sprite art={catAwake ? CAT_AWAKE : CAT_SLEEP} palette={CAT_PALETTE} px={PX} />
      </button>

      <Door id="door-r" to={nextRoom} label={t("door.next")} className="right-0" />
    </Scene>
  );
}
