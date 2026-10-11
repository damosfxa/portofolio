"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { GameProvider } from "@/components/game/game-provider";

// `ready` menandai intro sudah selesai, supaya animasi hero baru mulai setelah layar start hilang.
const IntroContext = createContext<{ ready: boolean; finish: () => void }>({
  ready: true,
  finish: () => {},
});

export const useIntro = () => useContext(IntroContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Intro sudah pernah tampil di sesi ini (atau dilewati): langsung siap.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (document.documentElement.dataset.intro === "done") setReady(true);
  }, []);

  return (
    <IntroContext.Provider value={{ ready, finish: () => setReady(true) }}>
      <GameProvider>
        <MotionConfig reducedMotion="user">
          {children}
        </MotionConfig>
      </GameProvider>
    </IntroContext.Provider>
  );
}
