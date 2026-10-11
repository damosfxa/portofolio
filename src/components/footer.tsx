"use client";

import { useGame } from "@/components/game/game-provider";
import { Txt } from "@/components/game/scramble";
import { scrollToId } from "@/lib/scroll";
import { TRACKS } from "@/lib/radio";

// Kredit musik: satu tautan per musisi.
const ARTISTS = TRACKS.filter((t, i) => TRACKS.findIndex((o) => o.artist === t.artist) === i);

export function Footer() {
  const { play } = useGame();

  const toStart = () => {
    play("jump");
    scrollToId("top");
  };

  return (
    <footer className="w-full bg-[#3B2A20] px-6 text-white dark:bg-[#140F1F]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 py-8 font-pixel text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-white/60">
          <p>© {new Date().getFullYear()}</p>
          <p className="font-sans text-xs">
            ♪{" "}
            {ARTISTS.map((t, i) => (
              <span key={t.artist}>
                {i > 0 && ", "}
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-white hover:underline">
                  {t.artist}
                </a>
              </span>
            ))}
            {" · CC0"}
          </p>
        </div>
        <button onClick={toStart} className="text-coin hover:text-white transition-colors">
          ▲ <Txt k="footer.top" />
        </button>
      </div>
    </footer>
  );
}
