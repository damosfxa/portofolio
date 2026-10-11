"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/components/game/game-provider";
import { Scene, rand, type SceneApi } from "@/components/game/scene";
import { Sprite } from "@/components/game/sprite";
import { SectionTitle, steps } from "@/components/game/section-title";
import { BOOKSHELF, BOOKSHELF_PALETTE, PLANT, PLANT_PALETTE } from "@/components/game/sprites";
import {
  ARMCHAIR,
  ARMCHAIR_PALETTE,
  ARMCHAIR_SEAT,
  SIDE_TABLE,
  SIDE_TABLE_PALETTE,
} from "@/components/game/furniture";
import { Door, PX, RoomShell } from "@/components/rooms/shared";
import { roomContent } from "@/content/visitors";
import { makeVisitorScript, type VisitorCtx } from "@/components/rooms/visitors";
import { certsNight } from "@/components/rooms/night-acts";

const GUESTS = ["sari", "bayu", "tari", "kevin"] as const;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
import { useLanguage } from "@/contexts/LanguageContext";
import type { Certificate, TimelineItem } from "@/lib/types";
import { Txt } from "@/components/game/scramble";
import { tidyTitle } from "@/lib/text";

export function CertificatesSection({
  index,
  certificates,
  timeline,
  nextRoom,
}: {
  index: number;
  certificates: Certificate[];
  /** Riwayat pengalaman/pendidikan dari admin (tabel timeline). */
  timeline: TimelineItem[];
  nextRoom: string;
}) {
  const { t } = useLanguage();
  const { play } = useGame();

  // HR, teman, dan calon klien datang bergantian; pemilik rumah datang saat ditanya.
  const [run] = useState(() => {
    const titles = certificates.map((c) => tidyTitle(c.title));

    const rest = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      const spot = api.spot("armchair");
      if (!Number.isFinite(spot)) return;
      await api.walk(who, spot);
      api.face(who, 1);
      api.pose(who, { sit: true, acc: "book", lift: ARMCHAIR_SEAT });
      await api.emote(who, "♪");
      await api.wait(rand(2500, 4000));
      c.tick(who);
    };

    return makeVisitorScript({
      content: roomContent("certs", { projects: [], skills: [], certs: titles }),
      door: "door-l",
      extras: [rest],
    });
  });

  // Malam: klub baca.
  const [night] = useState(certsNight);

  return (
    <RoomShell
      id="certificates"
      wall={
        <>
          <SectionTitle index={index} titleKey="certs.title" />

          {/* Papan gabus "Perjalanan": kartu riwayat pengalaman dan pendidikan yang ditempel di dinding */}
          {timeline.length > 0 && (
            <div className="mb-16 border-[10px] border-[#8B5A2B] bg-[#C99A63] p-5 shadow-[6px_6px_0_0_var(--g-shadow)] dark:border-[#6B4A33] dark:bg-[#8E6B48] sm:p-7">
              <h3 className="mb-5 font-pixel text-2xl font-bold text-[#3B2A20]">
                <Txt k="certs.journey" />
              </h3>
              <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {timeline.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: -16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: i * 0.08, ease: steps(4) }}
                    className="relative bg-[#FFF8EC] p-4 text-[#3B2A20] shadow-[3px_3px_0_0_rgba(0,0,0,0.25)]"
                    style={{ rotate: `${[-1.5, 1, -0.5, 1.5][i % 4]}deg` }}
                  >
                    <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[#E0605A] shadow-[1px_1px_0_0_rgba(0,0,0,0.3)]" aria-hidden />
                    <p className="font-pixel text-sm font-bold text-[#8B5A2B]">{item.year}</p>
                    <h4 className="mt-1 font-bold leading-snug">{item.title}</h4>
                    {item.description && <p className="mt-2 text-sm leading-relaxed">{item.description}</p>}
                  </motion.li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert, i) => {
              const title = tidyTitle(cert.title);
              return (
                <motion.figure
                  key={cert.id}
                  initial={{ opacity: 0, y: -24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.12, ease: steps(4) }}
                  className="flex flex-col items-center"
                  style={{ rotate: `${i % 2 ? 1 : -1}deg` }}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
                  <span className="h-4 w-px bg-line" aria-hidden />
                  <a
                    href={cert.image ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => play("select")}
                    className="block w-full border-[10px] border-[#8B5A2B] bg-[#5E3A1A] p-1.5 shadow-[6px_6px_0_0_var(--g-shadow)] transition-transform hover:scale-[1.03] dark:border-[#6B4A33]"
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-panel">
                      {cert.image && <img src={cert.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    </span>
                  </a>
                  <figcaption className="mt-3 border-2 border-[#B8862F] bg-[#E8C46A] px-3 py-1 text-center text-sm font-bold text-[#3B2A20]">
                    {title}
                  </figcaption>
                </motion.figure>
              );
            })}
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
          roomId="certificates"
          hostDoor="door-l"
          nightScript={night}
        >
          <Door id="door-l" className="left-0" />
          <div data-prop="bookshelf" className="absolute bottom-0 left-[12%] hidden sm:block" aria-hidden>
            <Sprite art={BOOKSHELF} palette={BOOKSHELF_PALETTE} px={PX} />
          </div>
          <div data-prop="armchair" className="absolute bottom-0 left-[28%]" aria-hidden>
            <Sprite art={ARMCHAIR} palette={ARMCHAIR_PALETTE} px={PX} />
          </div>
          <div data-prop="sidetable" className="absolute bottom-0 left-[37%] hidden sm:block" aria-hidden>
            <Sprite art={SIDE_TABLE} palette={SIDE_TABLE_PALETTE} px={PX} />
          </div>
          <div className="absolute bottom-0 left-[80%] hidden sm:block" aria-hidden>
            <Sprite art={PLANT} palette={PLANT_PALETTE} px={PX} />
          </div>
          <Door id="door-r" to={nextRoom} label={t("door.next")} className="right-0" />
        </Scene>
      }
    />
  );
}
