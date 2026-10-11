"use client";

import { motion } from "framer-motion";
import { Txt } from "@/components/game/scramble";

/** Easing bertahap supaya gerakan terasa seperti game pixel, bukan mulus. */
export const steps = (n: number) => (t: number) => Math.round(t * n) / n;

// Judul bagian: catatan tempel bernomor, lalu judul besar yang naik ke tempatnya.
export function SectionTitle({
  index,
  titleKey,
  aside,
}: {
  index: number;
  titleKey: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-12 md:mb-16 flex flex-wrap items-end justify-between gap-6">
      <div className="flex items-center gap-5">
        <motion.span
          initial={{ opacity: 0, rotate: -12, y: -10 }}
          whileInView={{ opacity: 1, rotate: -4, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.35, ease: steps(4) }}
          className="inline-flex h-14 w-14 items-center justify-center bg-coin font-pixel text-xl font-bold text-[#2B1E16] shadow-[4px_4px_0_0_var(--g-shadow)]"
          aria-hidden
        >
          {String(index).padStart(2, "0")}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.45, ease: steps(5), delay: 0.08 }}
          className="font-pixel text-4xl md:text-5xl font-bold tracking-tight text-on-sky text-pixel-shadow"
        >
          <Txt k={titleKey} />
        </motion.h2>
      </div>
      {aside}
    </div>
  );
}
