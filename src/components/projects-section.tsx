"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Lock, Maximize2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { FaGithub } from "react-icons/fa";
import { useGame } from "@/components/game/game-provider";
import { Scene, bag, rand, type SceneApi } from "@/components/game/scene";
import { Sprite } from "@/components/game/sprite";
import { Txt } from "@/components/game/scramble";
import { SectionTitle, steps } from "@/components/game/section-title";
import { DESK, DESK_PALETTE, PLANT, PLANT_PALETTE } from "@/components/game/sprites";
import { CHAIR, CHAIR_PALETTE, LAPTOP_CLOSED, LAPTOP_OPEN, LAPTOP_PALETTE } from "@/components/game/props";
import { Door, PX, RoomShell } from "@/components/rooms/shared";
import { PROJECT_SOLO } from "@/content/dialogue";
import { roomContent } from "@/content/visitors";
import { makeVisitorScript } from "@/components/rooms/visitors";
import { projectsNight } from "@/components/rooms/night-acts";

// Tamu siang (klien dan pemilik usaha) dan rombongan lembur malam.
const GUESTS = ["client", "kevin", "rina", "budi", "raka", "nadia"] as const;
import {
  COFFEE_STATION,
  COFFEE_STATION_PALETTE,
  FILE_CABINET,
  FILE_CABINET_PALETTE,
  PRINTER,
  PRINTER_PALETTE,
  WHITEBOARD,
  WHITEBOARD_PALETTE,
} from "@/components/game/furniture";
import { useLanguage } from "@/contexts/LanguageContext";
import { techIcon } from "@/lib/tech-icons";
import { fallbackThumbnails } from "@/content/site";
import type { Project } from "@/lib/types";

const CHAIR_SEAT = 9;
const SCROLL_LINES = [
  { id: "Lanjut ke proyek berikutnya.", en: "On to the next project." },
  { id: "Yang ini juga seru.", en: "This one's fun too." },
  { id: "Geser dulu...", en: "Scrolling..." },
  { id: "Coba buka demonya.", en: "Try the live demo." },
];

// Thumbnail bisa berupa URL penuh, path relatif, atau kosong (pakai screenshot cadangan).
const thumbnailOf = (project: Project) => {
  const thumb = project.thumbnail;
  if (thumb) return thumb.startsWith("http") ? thumb : "/" + thumb;
  const key = project.link?.replace(/\/$/, "");
  return (key && fallbackThumbnails[key]) || null;
};

/** Layar laptop berisi proyek: tertutup sampai laptop dibuka, lalu bisa digeser otomatis atau manual. */
function ProjectScreen({
  projects,
  open,
  index,
  setIndex,
  onOpenNow,
  hoverRef,
}: {
  projects: Project[];
  open: boolean;
  index: number;
  setIndex: (i: number) => void;
  onOpenNow: () => void;
  hoverRef: React.MutableRefObject<boolean>;
}) {
  const { play } = useGame();
  const { t } = useLanguage();
  const touchX = useRef<number | null>(null);
  const go = (i: number) => {
    play("select");
    setIndex((i + projects.length) % projects.length);
  };
  const p = projects[index];
  // Gambar utama lalu galeri isi aplikasi; posisi galeri kembali ke awal saat proyek berganti.
  const images = [thumbnailOf(p), ...(p.gallery ?? [])].filter((x, i, all): x is string => !!x && all.indexOf(x) === i);
  const [shot, setShot] = useState({ id: p.id, i: 0 });
  const shotIndex = shot.id === p.id ? Math.min(shot.i, Math.max(0, images.length - 1)) : 0;
  const image = images[shotIndex] ?? null;
  const [zoom, setZoom] = useState(false);
  const showShot = (i: number) => setShot({ id: p.id, i: (i + images.length) % images.length });

  return (
    <div
      className="pixel-box overflow-hidden"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      onFocus={() => (hoverRef.current = true)}
      onBlur={() => (hoverRef.current = false)}
    >
      <div className="flex items-center justify-between gap-4 bg-line px-4 py-2.5 font-pixel text-sm text-coin">
        <span>rizky-os · projects</span>
        <span className="text-white/70">
          {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
      </div>

      <div className="relative min-h-[420px]">
        <AnimatePresence>
          {!open && (
            <motion.div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-[#140F1F] p-6 text-center"
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.5, ease: steps(6) }}
            >
              <p className="font-pixel text-lg text-[#F2A33A]">
                <Txt k="projects.closed" />
              </p>
              <p className="max-w-sm text-[#C4B8D8]">
                <Txt k="projects.waiting" />
              </p>
              <button onClick={onOpenNow} className="pixel-btn bg-coin text-[#2B1E16]">
                <Txt k="projects.openNow" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="grid md:grid-cols-[1.1fr_1fr]"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: steps(4) }}
              className="contents"
            >
              <div className="flex flex-col items-center justify-center gap-3 border-b-4 border-line bg-panel-2 p-4 md:border-b-0 md:border-r-4 md:p-6">
                {image ? (
                  // Gambar ditampilkan utuh (tidak dipotong), dengan bingkai tipis; klik untuk memperbesar.
                  <button onClick={() => setZoom(true)} className="group relative w-full cursor-zoom-in" aria-label={t("projects.zoom")}>
                    <img src={image} alt="" className="max-h-[300px] w-full border-2 border-line object-contain shadow-[4px_4px_0_0_var(--g-shadow)]" />
                    <span className="absolute right-2 top-2 flex items-center gap-1 bg-line px-2 py-1 font-pixel text-xs text-coin opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Maximize2 className="h-3 w-3" /> {t("projects.zoom")}
                    </span>
                  </button>
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center font-pixel text-5xl text-ink-soft/40">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                )}
                {images.length > 1 && (
                  <div className="flex w-full gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                      <button
                        key={src}
                        onClick={() => {
                          play("select");
                          showShot(i);
                        }}
                        aria-label={`${t("projects.shot")} ${i + 1}`}
                        aria-current={i === shotIndex}
                        className={`h-12 w-16 shrink-0 border-2 ${i === shotIndex ? "border-coin" : "border-line opacity-60 hover:opacity-100"}`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col p-6">
                {p.category && <p className="font-pixel text-sm text-coin-dark dark:text-coin">{p.category}</p>}
                <h3 className="mt-2 font-pixel text-2xl leading-tight">{p.title}</h3>
                {p.tags && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <li key={tag} className="flex items-center gap-1.5 border-2 border-line bg-panel-2 px-2 py-1 text-sm font-semibold">
                        {techIcon(tag) && <img src={techIcon(tag)} alt="" className="h-4 w-4 object-contain" />}
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 max-h-44 overflow-y-auto whitespace-pre-line pr-2 leading-relaxed text-ink-soft">
                  {p.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-4 pt-6">
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={() => play("start")} className="pixel-btn bg-coin text-[#2B1E16]">
                      <Txt k="projects.live" /> <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {p.code_private ? (
                    // Repo milik klien: tidak ditautkan, tapi tetap terlihat sebagai project nyata.
                    <span title={t("projects.privateHint")} className="flex items-center gap-2 border-4 border-dashed border-line px-4 py-2 font-pixel text-sm text-ink-soft">
                      <Lock className="h-4 w-4" /> <Txt k="projects.private" />
                    </span>
                  ) : (
                    p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" onClick={() => play("select")} className="pixel-btn bg-panel">
                        <FaGithub className="h-4 w-4" /> <Txt k="projects.code" />
                      </a>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {projects.length > 1 && (
        <div className="flex items-center justify-between gap-4 border-t-4 border-line bg-panel-2 px-4 py-3">
          <button onClick={() => go(index - 1)} className="pixel-btn bg-panel !p-2.5" aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {projects.map((proj, i) => (
              <button
                key={proj.id}
                onClick={() => go(i)}
                aria-label={proj.title}
                aria-current={i === index}
                className={`h-3 w-3 border-2 border-line ${i === index ? "bg-coin" : "bg-panel"}`}
              />
            ))}
          </div>
          <button onClick={() => go(index + 1)} className="pixel-btn bg-panel !p-2.5" aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {zoom && image && (
        <Lightbox
          images={images}
          index={shotIndex}
          title={p.title}
          onIndex={showShot}
          onClose={() => {
            setZoom(false);
            hoverRef.current = false;
          }}
          onOpen={() => (hoverRef.current = true)}
        />
      )}
    </div>
  );
}

/** Gambar diperbesar satu layar penuh; geser dengan panah atau tombol, tutup dengan Esc. */
function Lightbox({
  images,
  index,
  title,
  onIndex,
  onClose,
  onOpen,
}: {
  images: string[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
  onOpen: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    // Layar proyek tidak bergeser otomatis selama gambar diperbesar.
    onOpen();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(index + 1);
      if (e.key === "ArrowLeft") onIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, onIndex, onOpen]);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex flex-col bg-[#140F1F]/95 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="flex items-center justify-between gap-4 font-pixel text-sm text-coin">
        <span className="truncate">{title}</span>
        <span className="flex items-center gap-3">
          {images.length > 1 && (
            <span className="text-white/70">
              {index + 1} / {images.length}
            </span>
          )}
          <button onClick={onClose} className="pixel-btn bg-panel !p-2" aria-label={t("projects.close")}>
            <X className="h-5 w-5" />
          </button>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-4">
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex(index - 1);
            }}
            className="pixel-btn bg-panel !p-2.5"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index]} alt="" onClick={(e) => e.stopPropagation()} className="max-h-full min-w-0 max-w-full border-4 border-line object-contain" />
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex(index + 1);
            }}
            className="pixel-btn bg-panel !p-2.5"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ProjectsSection({ index: sectionIndex, projects, nextRoom }: { index: number; projects: Project[]; nextRoom: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const hoverRef = useRef(false);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const openLaptop = useCallback(() => setOpen(true), []);

  // Laptop terbuka sendiri, supaya proyek bisa dilihat walau Rizky sedang di ruangan lain.
  useEffect(() => {
    const id = window.setTimeout(openLaptop, 1200);
    return () => window.clearTimeout(id);
  }, [openLaptop]);

  // Ref (openRef, hoverRef) hanya dibaca di dalam fungsi naskah yang berjalan belakangan, bukan saat render.
  // eslint-disable-next-line react-hooks/refs
  const [run] = useState(() => {
    const scrollLines = bag(SCROLL_LINES);
    const info = projects.map((p) => ({ title: p.title, tags: p.tags ?? [] }));

    const scroll = async (api: SceneApi) => {
      await api.wait(rand(5000, 7000));
      // Layar digeser otomatis; berhenti saat pengunjung sedang mengarahkan kursor ke layar.
      if (!openRef.current || hoverRef.current || projects.length < 2) return;
      // Bila Rizky ada, dialah yang menggeser sambil berkomentar.
      if (api.shown("me")) {
        api.sfx("type", 1200);
        await api.say("me", scrollLines());
      }
      setSlide((i) => (i + 1) % projects.length);
    };

    const soloLines = bag(PROJECT_SOLO);
    const think = async (api: SceneApi) => {
      if (!api.shown("me")) return;
      const typing = rand(2000, 4000);
      api.sfx("type", typing);
      await api.wait(typing);
      await api.emote("me", Math.random() < 0.5 ? "?" : "!");
      await api.say("me", soloLines());
    };

    const coffee = async (api: SceneApi) => {
      const spot = api.spot("coffee");
      if (!api.shown("me") || !Number.isFinite(spot)) return;
      await api.walk("me", spot);
      await api.wait(1200);
      api.pose("me", { acc: "mug" });
      await api.emote("me", "♪");
      await api.walk("me", api.spot("chair", 0.5));
      api.face("me", 1);
      api.pose("me", { sit: true, acc: "mug", lift: CHAIR_SEAT });
    };

    // Klien dan pemilik usaha datang bergantian; pemilik rumah tetap di meja kerja.
    return makeVisitorScript({
      content: roomContent("projects", { projects: info, skills: [], certs: [] }),
      door: "door-l",
      spot: () => rand(56, 66),
      extras: [scroll, scroll, think, coffee],
    });
  });

  // Malam: tim lembur menyelesaikan sprint.
  const [night] = useState(projectsNight);

  // Begitu Rizky tiba di ruang kerja: duduk dan buka laptop.
  const onHostArrive = async (api: SceneApi) => {
    await api.walk("me", api.spot("chair", 0.5));
    api.face("me", 1);
    api.pose("me", { sit: true, lift: CHAIR_SEAT });
    api.prop("laptop", "open");
    openLaptop();
  };

  // Layar proyek ada di dinding (di atas ruangan), sama seperti isi ruangan lain.
  return (
    <RoomShell
      id="projects"
      wall={
        <>
          <SectionTitle index={sectionIndex} titleKey="projects.title" />
          <ProjectScreen
            projects={projects}
            open={open}
            index={slide}
            setIndex={setSlide}
            onOpenNow={openLaptop}
            hoverRef={hoverRef}
          />
        </>
      }
      stage={
        <Scene
          className="h-[170px] sm:h-[200px] md:h-[230px]"
          actors={[
            { id: "me", cast: "me", x: 5, hidden: true },
            ...GUESTS.map((id) => ({ id, cast: id, x: 5, hidden: true })),
          ]}
          script={run}
          exit="door-l"
          roomId="projects"
          hostDoor="door-r"
          hostSpot={(api) => api.spot("chair", 0.5)}
          onHostArrive={onHostArrive}
          nightScript={night}
        >
          <Door id="door-l" className="left-0" />

          {/* Satu hiasan dinding: papan tulis tepat di atas meja kerja */}
          <div className="absolute left-[38%] top-2 hidden md:block" aria-hidden>
            <Sprite art={WHITEBOARD} palette={WHITEBOARD_PALETTE} px={PX} />
          </div>

          <div className="absolute bottom-0 left-[12%] hidden sm:block" aria-hidden>
            <Sprite art={PLANT} palette={PLANT_PALETTE} px={PX} />
          </div>
          <div className="absolute bottom-0 left-[20%] hidden sm:block" aria-hidden>
            <span className="absolute bottom-full left-[calc(1*var(--px))] block">
              <Sprite art={PRINTER} palette={PRINTER_PALETTE} px={PX} />
            </span>
            <Sprite art={FILE_CABINET} palette={FILE_CABINET_PALETTE} px={PX} />
          </div>
          <div data-prop="coffee" className="absolute bottom-0 left-[68%] sm:left-[70%]" aria-hidden>
            <Sprite art={COFFEE_STATION} palette={COFFEE_STATION_PALETTE} px={PX} />
          </div>
          <div data-prop="desk" className="absolute bottom-0 left-[38%]" aria-hidden>
            {/* Laptop ikut terbuka setiap kali layar proyek terbuka, supaya keduanya selalu sama. */}
            <span data-prop="laptop" data-state={open ? "open" : "closed"} className="prop absolute bottom-full left-[calc(9*var(--px))] block">
              <span className="s-closed block">
                <Sprite art={LAPTOP_CLOSED} palette={LAPTOP_PALETTE} px={PX} />
              </span>
              <span className="s-open block">
                <Sprite art={LAPTOP_OPEN} palette={LAPTOP_PALETTE} px={PX} />
              </span>
            </span>
            <Sprite art={DESK} palette={DESK_PALETTE} px={PX} />
            <span data-prop="chair" className="absolute bottom-0 left-[calc(10*var(--px))] z-10 block">
              <Sprite art={CHAIR} palette={CHAIR_PALETTE} px={PX} />
            </span>
          </div>
          <Door id="door-r" to={nextRoom} label={t("door.next")} className="right-0" />
        </Scene>
      }
    />
  );
}
