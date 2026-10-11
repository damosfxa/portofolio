"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIntro } from "@/components/providers";
import { useGame } from "@/components/game/game-provider";
import { useLanguage } from "@/contexts/LanguageContext";
import { steps } from "@/components/game/section-title";

type Phase = "booting" | "ready" | "exiting" | "done";

const COLS = 12;
const ROWS = 8;
const LINE_MS = 260;
// Setelah boot selesai, intro lanjut sendiri bila pengunjung tidak menekan apa pun.
const AUTO_START_MS = 900;

const BOOT: Record<"id" | "en", [string, string][]> = {
  id: [
    ["menyalakan lampu meja", "OK"],
    ["menyeduh kopi", "OK"],
    ["membangunkan kucing", "GAGAL (masih tidur)"],
    ["membuka proyek", "OK"],
  ],
  en: [
    ["turning on desk lamp", "OK"],
    ["brewing coffee", "OK"],
    ["waking up the cat", "FAILED (still asleep)"],
    ["opening projects", "OK"],
  ],
};

export function Preloader() {
  const { finish } = useIntro();
  const { play } = useGame();
  const { t, locale } = useLanguage();
  const [phase, setPhaseState] = useState<Phase>("booting");
  const phaseRef = useRef<Phase>("booting");
  const [lines, setLines] = useState(0);
  const [delays, setDelays] = useState<number[]>([]);
  const boot = BOOT[locale];

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const start = useCallback(() => {
    if (phaseRef.current === "exiting" || phaseRef.current === "done") return;
    play("start");
    // Urutan hilang kotak diacak sekali, hanya di browser.
    setDelays(Array.from({ length: COLS * ROWS }, () => Math.random() * 0.45));
    try {
      sessionStorage.setItem("rr_intro", "1");
    } catch {}
    document.documentElement.style.overflow = "";
    finish();
    setPhase("exiting");
  }, [finish, play]);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "done") {
      // Intro sudah pernah tampil di sesi ini; lewati tanpa render apa pun.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }
    document.documentElement.style.overflow = "hidden";

    // Baris boot muncul satu per satu. Timer (bukan animasi frame) supaya tetap jalan di tab latar.
    let n = 0;
    const timer = window.setInterval(() => {
      n++;
      setLines(n);
      if (n >= BOOT.id.length) {
        window.clearInterval(timer);
        setPhase("ready");
      }
    }, LINE_MS);
    // Pengaman: intro tidak boleh mengunci halaman lebih dari 6 detik.
    const safety = window.setTimeout(start, 6000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(safety);
    };
    // Hanya dijalankan sekali saat halaman pertama dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "ready") {
      const auto = window.setTimeout(start, AUTO_START_MS);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") start();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.clearTimeout(auto);
        window.removeEventListener("keydown", onKey);
      };
    }
    if (phase === "exiting") {
      // Setelah kotak terakhir hilang, CSS menyembunyikan elemen ini sepenuhnya.
      const end = window.setTimeout(() => {
        document.documentElement.dataset.intro = "done";
        setPhase("done");
      }, 1000);
      return () => window.clearTimeout(end);
    }
  }, [phase, start]);

  if (phase === "done") return null;

  return (
    <div className="preloader fixed inset-0 z-[200]" onClick={phase === "ready" ? start : undefined} aria-hidden>
      {phase === "exiting" ? (
        // Layar pecah jadi kotak pixel yang hilang acak.
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {delays.map((d, i) => (
            <motion.div
              key={i}
              className="bg-[#140F1F]"
              initial={{ scale: 1.02 }}
              animate={{ scale: 0 }}
              transition={{ duration: 0.35, delay: d, ease: steps(4) }}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#140F1F] px-6">
          <div className="w-full max-w-xl font-pixel text-sm leading-[2.2] text-[#F2A33A] md:text-xs">
            <p className="mb-6 text-base text-[#FFF8EC] md:text-lg">RIZKY-OS v1.0</p>
            {boot.slice(0, lines).map(([task, result], i) => (
              <p key={i} className="flex gap-3">
                <span className="text-[#C4B8D8]">&gt;</span>
                <span className="flex-1 truncate">{task}</span>
                <span className={result.startsWith("OK") ? "text-[#5BA35B]" : "text-[#E0605A]"}>{result}</span>
              </p>
            ))}
            {phase === "booting" && <span className="inline-block h-4 w-2.5 bg-[#F2A33A] animate-blink" />}
            {phase === "ready" && (
              <div className="mt-10 text-center">
                <p className="text-sm text-[#FFF8EC] animate-blink">▶ {t("intro.start")}</p>
                <p className="mt-3 font-sans text-sm text-[#C4B8D8]">{t("intro.hint")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
