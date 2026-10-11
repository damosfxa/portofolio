"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Hanya huruf (tanpa angka/simbol); kapitalisasinya mengikuti huruf asli supaya transisinya halus.
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DURATION = 650;
const FRAME = 30;

const randomLetter = (target: string) => {
  const set = target === target.toUpperCase() && target !== target.toLowerCase() ? UPPER : LOWER;
  return set[Math.floor(Math.random() * set.length)];
};

/**
 * Saat `text` berganti (misalnya ganti bahasa), teks diacak lalu "terdekode"
 * dari kiri ke kanan menjadi teks baru. Render pertama tampil langsung.
 */
export function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  // Dibandingkan dengan teks sebelumnya (bukan "render pertama"), supaya efek tidak ikut
  // terpicu saat React menjalankan effect dua kali di mode pengembangan.
  const prev = useRef(text);

  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(text);
      return;
    }

    const start = performance.now();
    const id = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / DURATION);
      const revealed = Math.floor(progress * text.length);
      // Sedikit di depan batas terbaca ikut acak, sisanya menunggu sebagai spasi
      // supaya lebar teks berubah bertahap, bukan meloncat.
      const tail = Math.min(text.length, revealed + 12);
      let out = text.slice(0, revealed);
      for (let i = revealed; i < tail; i++) {
        const ch = text[i];
        // Spasi dan tanda baca dibiarkan; hanya huruf/angka yang diacak menjadi huruf.
        out += /[\p{L}\p{N}]/u.test(ch) ? randomLetter(ch) : ch;
      }
      out += text.slice(tail).replace(/[^\s]/g, " ").slice(0, Math.max(0, text.length - tail));
      setDisplay(progress >= 1 ? text : out);
      if (progress >= 1) window.clearInterval(id);
    }, FRAME);

    return () => window.clearInterval(id);
  }, [text]);

  return display;
}

/** Teks terjemahan dengan efek acak saat bahasa diganti. */
export function Txt({ k }: { k: string }) {
  const { t } = useLanguage();
  const value = t(k);
  const display = useScramble(value);
  return (
    <>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
