"use client";

import { useEffect, useState } from "react";
import { Sprite } from "@/components/game/sprite";
import { CLOCK_FACE, CLOCK_PALETTE } from "@/components/game/furniture";

/**
 * Jam dinding pixel yang jarumnya mengikuti jam pengunjung.
 * `px` = ukuran satu pixel (nilai CSS), sama seperti sprite lainnya.
 */
export function WallClock({ px }: { px: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    // Waktu awal dipasang lewat timer (bukan langsung di effect) dan diperbarui tiap 15 detik.
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const minutes = now ? now.getMinutes() : 0;
  const hours = now ? (now.getHours() % 12) + minutes / 60 : 0;
  const hand = (length: number, deg: number, color: string) => (
    <span
      className="absolute block"
      style={{
        left: `calc(6 * ${px})`,
        top: `calc(6 * ${px})`,
        width: px,
        height: `calc(${length} * ${px})`,
        background: color,
        transformOrigin: "50% 100%",
        transform: `translate(-50%, -100%) rotate(${deg}deg)`,
      }}
    />
  );

  return (
    <span className="relative block" role="img" aria-label={now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined}>
      <Sprite art={CLOCK_FACE} palette={CLOCK_PALETTE} px={px} />
      {now && (
        <>
          {hand(3, hours * 30, CLOCK_PALETTE.H)}
          {hand(4.5, minutes * 6, CLOCK_PALETTE.H)}
          <span className="absolute block" style={{ left: `calc(5.5 * ${px})`, top: `calc(5.5 * ${px})`, width: px, height: px, background: "#E0605A" }} />
        </>
      )}
    </span>
  );
}
