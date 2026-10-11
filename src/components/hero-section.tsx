"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Download } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import { useIntro } from "@/components/providers";
import { useGame } from "@/components/game/game-provider";
import { Sprite } from "@/components/game/sprite";
import { WINDOW_DAY, WINDOW_DAY_PALETTE, WINDOW_NIGHT, WINDOW_NIGHT_PALETTE } from "@/components/game/sprites";
import { Floor } from "@/components/game/scenery";
import { Txt } from "@/components/game/scramble";
import { steps } from "@/components/game/section-title";
import { LivingRoom } from "@/components/rooms/living-room";
import { scrollToId } from "@/lib/scroll";
import { site } from "@/content/site";
import { useLanguage } from "@/contexts/LanguageContext";

const SERVICES = ["hero.s1", "hero.s2", "hero.s3", "hero.s4"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: steps(5) } },
};

const letter: Variants = {
  hidden: { y: 36, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.35, ease: steps(4) } },
};

export function HeroSection({ nextRoom }: { nextRoom: string }) {
  const { ready } = useIntro();
  const { play } = useGame();
  const { locale } = useLanguage();
  const state = ready ? "show" : "hidden";

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    play("select");
    scrollToId(id);
  };

  return (
    <section id="hero" className="wall-hero relative flex min-h-[100dvh] flex-col pt-[96px] [--px:2.2px] sm:[--px:3px] md:[--px:4px]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
        <motion.div variants={container} initial="hidden" animate={state} className="max-w-2xl">
          <motion.p variants={item} className="font-pixel text-lg text-ink-soft">
            <Txt k="hero.greeting" />
          </motion.p>

          <motion.h1
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="mt-1 font-pixel text-5xl font-bold leading-[1.05] tracking-tight text-on-sky text-pixel-shadow sm:text-6xl"
            aria-label={site.name}
          >
            {site.name.split(" ").map((word, w) => (
              <span key={w} className="mr-[0.3em] inline-block whitespace-nowrap last:mr-0" aria-hidden>
                {word.split("").map((char, i) => (
                  <motion.span key={i} variants={letter} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p variants={item} className="mt-3 font-pixel text-xl text-coin-dark dark:text-coin">
            <Txt k="hero.role" />
          </motion.p>

          <motion.p variants={item} className="mt-6 text-lg leading-relaxed md:text-xl">
            <Txt k="hero.intro" />
          </motion.p>

          <motion.ul variants={item} className="mt-6 flex flex-wrap gap-2.5" aria-label="Services">
            {SERVICES.map((key) => (
              <li key={key} className="border-2 border-line bg-panel px-3 py-1.5 text-sm font-bold">
                <Txt k={key} />
              </li>
            ))}
          </motion.ul>

          <motion.p variants={item} className="mt-6 flex items-center gap-3 font-bold">
            <span className="h-3 w-3 shrink-0 bg-grass animate-blink" aria-hidden />
            <Txt k="hero.status" />
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-5">
            <a href="#projects" onClick={(e) => go(e, "projects")} className="pixel-btn bg-coin text-[#2B1E16]">
              ▶ <Txt k="hero.cta" />
            </a>
            <a href="#contact" onClick={(e) => go(e, "contact")} className="pixel-btn bg-panel">
              <Txt k="hero.contact" />
            </a>
            {site.cv && (
              <a href={site.cv[locale]} download onClick={() => play("powerup")} className="pixel-btn bg-panel">
                <Download className="h-4 w-4" /> <Txt k="hero.cv" />
              </a>
            )}
            <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={() => play("select")} className="pixel-btn bg-panel !px-3">
              <FaGithub className="h-5 w-5" />
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={() => play("select")} className="pixel-btn bg-panel !px-3">
              <FaLinkedin className="h-5 w-5 text-[#0A66C2] dark:text-[#5AA9F5]" />
            </a>
          </motion.div>

          {/* Untuk perekrut yang ingin membaca cepat tanpa menjelajah rumah */}
          <motion.p variants={item} className="mt-5 text-sm font-semibold text-ink-soft">
            <Txt k="hero.quick" />{" "}
            <Link href="/ringkas" className="text-ink underline decoration-coin decoration-2 underline-offset-4 hover:decoration-ink">
              <Txt k="nav.resume" /> →
            </Link>
          </motion.p>
        </motion.div>

        {/* Dinding kanan: jendela (siang/malam) dan foto bila ada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4, delay: 0.5, ease: steps(4) }}
          className="hidden items-start gap-8 self-center lg:flex"
          aria-hidden
        >
          {site.photo && (
            <div className="pixel-box rotate-2 p-2">
              <img src={site.photo} alt="" className="h-40 w-32 object-cover" />
            </div>
          )}
          <div>
            <Sprite art={WINDOW_DAY} palette={WINDOW_DAY_PALETTE} scale={6} className="dark:hidden" />
            <Sprite art={WINDOW_NIGHT} palette={WINDOW_NIGHT_PALETTE} scale={6} className="hidden dark:block" />
          </div>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-2 sm:px-6">
        <LivingRoom nextRoom={nextRoom} />
      </div>
      <Floor height={36} />
    </section>
  );
}
