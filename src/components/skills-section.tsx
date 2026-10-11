"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/components/game/game-provider";
import { Scene, rand, type SceneApi } from "@/components/game/scene";
import { Sprite } from "@/components/game/sprite";
import { Txt } from "@/components/game/scramble";
import { SectionTitle, steps } from "@/components/game/section-title";
import { BENCH, BENCH_PALETTE, BENCH_SEAT } from "@/components/game/props";
import { PLANT, PLANT_PALETTE } from "@/components/game/sprites";
import { PEDESTAL, PEDESTAL_PALETTE } from "@/components/game/furniture";
import { Door, PX, RoomShell } from "@/components/rooms/shared";
import { roomContent } from "@/content/visitors";
import { makeVisitorScript, type VisitorCtx } from "@/components/rooms/visitors";
import { skillsNight } from "@/components/rooms/night-acts";

const GUESTS = ["raka", "nadia", "sari", "lala", "dina"] as const;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
import { useLanguage } from "@/contexts/LanguageContext";
import { techIcon } from "@/lib/tech-icons";
import type { Skill } from "@/lib/types";

type Group = "frontend" | "backend" | "database" | "tools";
const GROUPS: Group[] = ["frontend", "backend", "database", "tools"];

// Kategori di admin berbentuk "Frontend - Framework", "Backend - Database", dst.
const groupOf = (category: string | null): Group => {
  const c = (category ?? "").toLowerCase();
  if (c.includes("database")) return "database";
  if (c.startsWith("frontend")) return "frontend";
  if (c.startsWith("backend")) return "backend";
  return "tools";
};

const initials = (name: string) => name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
// Kemiringan bingkai tetap per posisi (bukan acak) supaya server dan browser sama.
const TILT = [0, -2, 1, 0, 2, -1, 0, 1.5];

/** Satu bingkai skill yang tergantung di dinding. */
function Frame({ name, i }: { name: string; i: number }) {
  const { play } = useGame();
  const icon = techIcon(name);
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: -16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: steps(3) } },
      }}
      className="flex flex-col items-center"
      style={{ rotate: `${TILT[i % TILT.length]}deg` }}
    >
      <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
      <span className="h-3 w-px bg-line" aria-hidden />
      <button
        type="button"
        onClick={() => play("select")}
        aria-label={name}
        className="group w-full border-[6px] border-[#8B5A2B] bg-[#5E3A1A] p-1 shadow-[4px_4px_0_0_var(--g-shadow)] transition-transform hover:-rotate-2 hover:scale-105 dark:border-[#6B4A33]"
      >
        <span className="flex aspect-square items-center justify-center bg-panel">
          {icon ? (
            <img src={icon} alt="" className="h-10 w-10 object-contain md:h-12 md:w-12" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center bg-line font-pixel text-sm text-coin md:h-12 md:w-12">
              {initials(name)}
            </span>
          )}
        </span>
      </button>
      <span className="mt-2 border-2 border-[#B8862F] bg-[#E8C46A] px-2 py-0.5 text-center text-xs font-bold leading-tight text-[#3B2A20]">
        {name}
      </span>
    </motion.li>
  );
}

export function SkillsSection({ index, skills, nextRoom }: { index: number; skills: Skill[]; nextRoom: string }) {
  const { t } = useLanguage();
  const groups = GROUPS.map((g) => ({ g, items: skills.filter((s) => groupOf(s.category) === g) })).filter(
    (x) => x.items.length > 0,
  );

  // Orang tech dan HR datang bergantian; pemilik rumah datang saat ditanya.
  const [run] = useState(() => {
    const names = skills.map((s) => s.name);

    const sit = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      await api.walk(who, api.spot("bench", rand(0.3, 0.7)));
      api.pose(who, { sit: true, acc: "phone", lift: BENCH_SEAT });
      await api.wait(rand(2500, 4000));
      c.tick(who);
    };

    const trophy = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      const spot = api.spot("pedestal");
      if (!Number.isFinite(spot)) return;
      await api.walk(who, spot);
      await api.emote(who, "!");
      await api.say(who, { id: "Trofinya asli nggak sih ini?", en: "Is this trophy even real?" });
      c.tick(who);
    };

    return makeVisitorScript({
      content: roomContent("skills", { projects: [], skills: names, certs: [] }),
      door: "door-l",
      extras: [sit, trophy],
    });
  });

  // Malam: teman-teman foto-foto dan curhat di galeri.
  const [night] = useState(skillsNight);

  return (
    <RoomShell
      id="skills"
      wall={
        <>
          <SectionTitle
            index={index}
            titleKey="skills.title"
            aside={
              <p className="bg-line px-4 py-3 font-pixel text-sm text-coin">
                {skills.length} <Txt k="skills.items" />
              </p>
            }
          />
          <div className="grid gap-12 md:grid-cols-2">
            {groups.map(({ g, items }) => (
              <div key={g}>
                <p className="mx-auto mb-6 w-fit border-4 border-line bg-panel px-4 py-1.5 font-pixel text-base">
                  <Txt k={`skills.${g}`} />
                </p>
                <motion.ul
                  className="grid grid-cols-3 gap-x-5 gap-y-6 sm:grid-cols-4"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {items.map((s, i) => (
                    <Frame key={s.id} name={s.name} i={i} />
                  ))}
                </motion.ul>
              </div>
            ))}
          </div>
        </>
      }
      stage={
        <Scene
          className="h-[150px] sm:h-[170px] md:h-[190px]"
          actors={[
            { id: "me", cast: "me", x: 5, hidden: true },
            ...GUESTS.map((id) => ({ id, cast: id, x: 5, hidden: true })),
          ]}
          script={run}
          exit="door-l"
          roomId="skills"
          hostDoor="door-l"
          nightScript={night}
        >
          <Door id="door-l" className="left-0" />
          <div className="absolute bottom-0 left-[14%] hidden sm:block" aria-hidden>
            <Sprite art={PLANT} palette={PLANT_PALETTE} px={PX} />
          </div>
          <div data-prop="bench" className="absolute bottom-0 left-[40%]" aria-hidden>
            <Sprite art={BENCH} palette={BENCH_PALETTE} px={PX} />
          </div>
          <div data-prop="pedestal" className="absolute bottom-0 left-[70%] sm:left-[74%]" aria-hidden>
            <Sprite art={PEDESTAL} palette={PEDESTAL_PALETTE} px={PX} />
          </div>

          <Door id="door-r" to={nextRoom} label={t("door.next")} className="right-0" />
        </Scene>
      }
    />
  );
}
