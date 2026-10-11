"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Menu, X, Music, Music2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGame } from "@/components/game/game-provider";
import { Sprite } from "@/components/game/sprite";
import {
  MOON,
  MOON_PALETTE,
  PLAYER_IDLE,
  PLAYER_PALETTE,
  PLAYER_WALK_A,
  PLAYER_WALK_B,
  SUN,
  SUN_PALETTE,
} from "@/components/game/sprites";
import { Txt } from "@/components/game/scramble";
import { transitionTheme } from "@/lib/transitions";
import { scrollToId } from "@/lib/scroll";
import { VolumePanel } from "@/components/volume-panel";
import Link from "next/link";

type Sections = { projects: boolean; skills: boolean; certificates: boolean };

const RUNNER_W = 18;

/**
 * Karakter kecil yang berjalan di rak HUD sesuai posisi scroll.
 * Semua pembaruan lewat transform dan atribut DOM, paling banyak sekali per frame.
 */
function ShelfRunner() {
  const trackRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let queued = false;
    let stopTimer: number | undefined;
    let step = 0;

    const update = () => {
      queued = false;
      const track = trackRef.current;
      const runner = runnerRef.current;
      if (!track || !runner) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      runner.style.transform = `translate3d(${p * (track.clientWidth - RUNNER_W)}px, 0, 0)`;

      const y = window.scrollY;
      if (y !== lastY && facingRef.current) facingRef.current.style.transform = y < lastY ? "scaleX(-1)" : "";
      lastY = y;

      if (framesRef.current) framesRef.current.dataset.frame = step++ % 6 < 3 ? "a" : "b";
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        if (framesRef.current) framesRef.current.dataset.frame = "idle";
      }, 150);
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    if (framesRef.current) framesRef.current.dataset.frame = "idle";
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(stopTimer);
    };
  }, []);

  return (
    <div className="h-7 border-b-4 border-line bg-[#8B5A2B] dark:bg-[#4A3324]" aria-hidden>
      <div ref={trackRef} className="relative mx-auto h-full max-w-6xl">
        <div ref={runnerRef} className="absolute bottom-0 left-0 will-change-transform">
          <div ref={facingRef}>
            <div ref={framesRef} className="player-frames" data-frame="idle">
              <Sprite art={PLAYER_IDLE} palette={PLAYER_PALETTE} scale={1.5} className="f-idle" />
              <Sprite art={PLAYER_WALK_A} palette={PLAYER_PALETTE} scale={1.5} className="f-a" />
              <Sprite art={PLAYER_WALK_B} palette={PLAYER_PALETTE} scale={1.5} className="f-b" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hud({ sections }: { sections: Sections }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { soundOn, toggleSound, musicOn, toggleMusic, play } = useGame();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    sections.projects && { key: "nav.projects", id: "projects" },
    sections.skills && { key: "nav.skills", id: "skills" },
    sections.certificates && { key: "nav.certificates", id: "certificates" },
    { key: "nav.bedroom", id: "bedroom" },
    { key: "nav.contact", id: "contact" },
  ].filter(Boolean) as { key: string; id: string }[];

  // Siang dan malam mengikuti jam pengunjung (malam 18.00 sampai 05.59), dicek ulang tiap 20 detik.
  // Saat jamnya lewat, tema berganti dengan animasi lingkaran dari jam di pojok kanan atas.
  const clockRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    try {
      localStorage.removeItem("rr_theme_manual");
    } catch {}
    const tick = (first: boolean) => {
      const d = new Date();
      setNow(d);
      const want = d.getHours() >= 18 || d.getHours() < 6 ? "dark" : "light";
      if (document.documentElement.classList.contains(want)) return;
      if (first) return setTheme(want);
      const r = clockRef.current?.getBoundingClientRect();
      transitionTheme(want, setTheme, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth, y: 0 });
    };
    tick(true);
    const id = window.setInterval(() => tick(false), 20000);
    return () => window.clearInterval(id);
  }, [setTheme]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Bagian aktif = bagian yang melewati garis 30% dari atas layar.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    for (const id of ["hero", ...links.map((l) => l.id)]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
    // `links` hanya bergantung pada `sections`, yang tetap selama halaman terbuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    play("select");
    scrollToId(id);
    setMenuOpen(false);
  };

  const toggleLocale = () => {
    play("select");
    setLocale(locale === "id" ? "en" : "id");
  };

  const isNight = mounted && resolvedTheme === "dark";
  const iconBtn =
    "flex h-9 min-w-9 items-center justify-center px-2 bg-panel-2 text-ink border-2 border-line font-pixel text-sm font-semibold transition-transform active:translate-y-0.5 hover:-translate-y-0.5";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b-4 border-line bg-panel">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <a href="#top" onClick={(e) => go(e, "top")} className="flex items-center gap-2 font-pixel text-lg font-bold text-ink">
            <span className="inline-block h-3 w-3 bg-coin" aria-hidden />
            RR
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu">
            {links.map((link) => {
              const isActive = active === link.id;
              return (
                <a
                  key={link.key}
                  href={`#${link.id}`}
                  onClick={(e) => go(e, link.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`px-3 py-1.5 font-pixel text-base font-semibold transition-colors ${
                    isActive ? "bg-line text-coin" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Txt k={link.key} />
                </a>
              );
            })}
            <Link href="/ringkas" className="ml-2 border-2 border-line px-3 py-1 font-pixel text-base font-semibold text-ink-soft transition-colors hover:text-ink">
              <Txt k="nav.resume" />
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLocale} className={iconBtn} aria-label={t("nav.language")}>
              {locale.toUpperCase()}
            </button>
            {/* Jam pengunjung: menentukan siang atau malam di rumah ini */}
            <div ref={clockRef} className={`${iconBtn} gap-1.5 hover:translate-y-0`} role="img" aria-label={t("nav.theme")} title={t("nav.theme")}>
              {mounted &&
                (isNight ? (
                  <Sprite art={MOON} palette={MOON_PALETTE} scale={2.5} />
                ) : (
                  <Sprite art={SUN} palette={SUN_PALETTE} scale={2} />
                ))}
              {now && (
                <span className="hidden tabular-nums sm:inline">
                  {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
                </span>
              )}
            </div>
            <button
              onClick={toggleMusic}
              className={`${iconBtn} ${musicOn ? "!bg-coin !text-[#2B1E16]" : ""}`}
              aria-label={t("nav.music")}
              title={t("nav.music")}
              aria-pressed={musicOn}
            >
              {musicOn ? <Music2 className="h-4 w-4 animate-bob" /> : <Music className="h-4 w-4" />}
            </button>
            <button onClick={toggleSound} className={iconBtn} aria-label={t("nav.sound")} title={t("nav.sound")} aria-pressed={soundOn}>
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <VolumePanel buttonClass={iconBtn} />
            <button
              onClick={() => {
                play("select");
                setMenuOpen((o) => !o);
              }}
              className={`${iconBtn} lg:hidden`}
              aria-label={t("nav.menu")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <ShelfRunner />

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="pixel-box mx-4 mt-4 flex flex-col p-3 lg:hidden"
            aria-label="Menu"
          >
            {links.map((link, i) => (
              <a
                key={link.key}
                href={`#${link.id}`}
                onClick={(e) => go(e, link.id)}
                className={`flex items-center gap-3 px-3 py-3 font-pixel text-lg font-semibold ${
                  active === link.id ? "bg-line text-coin" : "text-ink"
                }`}
              >
                <span className="text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
                <Txt k={link.key} />
              </a>
            ))}
            <Link href="/ringkas" className="mt-1 flex items-center gap-3 border-t-2 border-line px-3 py-3 font-pixel text-lg font-semibold text-ink">
              <span className="text-ink-soft">↗</span>
              <Txt k="nav.resume" />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
