"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.04, duration: 1.8, smoothWheel: true, wheelMultiplier: 0.8 }}>
      {children}
    </ReactLenis>
  );
}
