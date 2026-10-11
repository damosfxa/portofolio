// Penggambar pixel art: setiap baris string adalah satu baris pixel, setiap huruf
// merujuk ke warna di `palette`. Titik (.) berarti transparan.

export type Art = string[];
export type Palette = Record<string, string>;

type Run = { x: number; y: number; w: number; c: string };

// Pixel bersebelahan dengan warna sama digabung jadi satu persegi supaya SVG tetap ringan.
function toRuns(art: Art): Run[] {
  const runs: Run[] = [];
  art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === "." || c === " ") {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === c) w++;
      runs.push({ x, y, w, c });
      x += w;
    }
  });
  return runs;
}

const sizeOf = (art: Art) => ({ w: Math.max(...art.map((r) => r.length)), h: art.length });

// Sprite dirender sebagai satu <img> dari data URI SVG (bukan ratusan <rect> di DOM),
// sehingga halaman tetap ringan walau banyak karakter dan perabot. Hasilnya di-cache per art+palette.
const cache = new Map<string, string>();
function spriteSrc(art: Art, palette: Palette) {
  const key = art.join("|") + JSON.stringify(palette);
  let src = cache.get(key);
  if (!src) {
    const { w, h } = sizeOf(art);
    const rects = toRuns(art)
      .map((r) => `<rect x='${r.x}' y='${r.y}' width='${r.w}' height='1' fill='${palette[r.c]}'/>`)
      .join("");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${rects}</svg>`;
    src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    cache.set(key, src);
  }
  return src;
}

export function Sprite({
  art,
  palette,
  scale = 4,
  className,
  style,
  title,
  px,
}: {
  art: Art;
  palette: Palette;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  /** Ukuran satu pixel sebagai nilai CSS (misalnya "var(--px)"), untuk ukuran responsif. */
  px?: string;
}) {
  const { w, h } = sizeOf(art);
  const sizeStyle = px ? { width: `calc(${w} * ${px})`, height: `calc(${h} * ${px})` } : { width: w * scale, height: h * scale };
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={spriteSrc(art, palette)}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      draggable={false}
      className={`pixelated max-w-none select-none ${className ?? ""}`}
      style={{ ...sizeStyle, ...style }}
    />
  );
}

/** Versi data URI, untuk background CSS (tile bata) dan kursor. Warna harus nilai hex. */
export function spriteDataUri(art: Art, palette: Palette, scale = 1) {
  const { w, h } = sizeOf(art);
  const rects = toRuns(art)
    .map((r) => `<rect x='${r.x}' y='${r.y}' width='${r.w}' height='1' fill='${palette[r.c]}'/>`)
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w * scale}' height='${h * scale}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
