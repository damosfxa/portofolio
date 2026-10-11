/** Scroll halus ke sebuah bagian. Memakai scroll native browser (ringan, tanpa library). */
export function scrollToId(id: string) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
