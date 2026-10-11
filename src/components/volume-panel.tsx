"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { readVolume, setVolume, type Channel } from "@/lib/audio";
import { useLanguage } from "@/contexts/LanguageContext";

/** Satu penggeser volume (0 sampai 200%, atau 100% untuk suara obrolan). */
function Slider({ channel, label, max = 200 }: { channel: Channel; label: string; max?: number }) {
  // Panel baru dipasang saat dibuka (di browser), jadi nilai tersimpan bisa langsung dibaca.
  const [value, setValue] = useState(() => Math.round(readVolume(channel) * 100));
  const id = `vol-${channel}`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-pixel text-sm">
        <label htmlFor={id} className="text-ink">
          {label}
        </label>
        <span className="tabular-nums text-ink-soft">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={5}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValue(v);
          setVolume(channel, v / 100);
        }}
        className="w-full accent-coin"
      />
    </div>
  );
}

/** Tombol pengaturan volume musik dan efek suara (0 sampai 200%). */
export function VolumePanel({ buttonClass }: { buttonClass: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar panel atau menekan Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${buttonClass} ${open ? "!bg-coin !text-[#2B1E16]" : ""}`}
        aria-label={t("nav.volume")}
        title={t("nav.volume")}
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="pixel-box absolute right-0 top-[calc(100%+10px)] z-50 flex w-60 flex-col gap-4 p-4">
          <Slider channel="music" label={t("vol.music")} />
          <Slider channel="sfx" label={t("vol.sfx")} />
          <Slider channel="voice" label={t("vol.voice")} max={100} />
        </div>
      )}
    </div>
  );
}
