import { flushSync } from "react-dom";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Transisi dilewati saat tab tersembunyi: browser akan membatalkannya.
const supportsViewTransition = () =>
  typeof document !== "undefined" && "startViewTransition" in document && !document.hidden;

/**
 * Ganti tema dengan lingkaran yang membesar dari titik klik.
 * Browser tanpa View Transitions mendapat transisi warna 500ms.
 */
export function transitionTheme(
  next: "light" | "dark",
  setTheme: (theme: string) => void,
  origin: { x: number; y: number },
) {
  const root = document.documentElement;
  const apply = () => {
    // Kelas dipasang langsung agar snapshot baru sudah memakai tema yang benar.
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));
  };

  if (prefersReducedMotion()) {
    apply();
    return;
  }

  if (!supportsViewTransition()) {
    root.classList.add("theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("theme-fade"), 550);
    return;
  }

  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  root.dataset.vt = "theme";
  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    // Transisi bisa dibatalkan browser; perubahan tema tetap sudah diterapkan.
    .catch(() => {});
  transition.finished.catch(() => {}).finally(() => delete root.dataset.vt);
}
