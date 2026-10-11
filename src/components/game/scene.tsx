"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGame } from "@/components/game/game-provider";
import type { Foley } from "@/lib/foley";
import { stopSpeaking, type VoiceProfile } from "@/lib/speech";
import { meArt, useOutfit } from "@/components/game/outfit";
import { BEDTIME, GREETINGS, HOST_ARRIVE, LEAVE_TO, SLEEP_TALK, WAKE_LINES } from "@/content/dialogue";
import { ROOM_NAME, rizky, rizkyAsleep, type HouseRoom } from "@/components/game/rizky";
import { NIGHT_BYE } from "@/content/visitors";
import { MORNING_BYE } from "@/content/night";
import { Sprite } from "@/components/game/sprite";
import {
  ACC_BOOK,
  ACC_BOOK_PALETTE,
  ACC_FOOD,
  ACC_FOOD_PALETTE,
  ACC_MUG,
  ACC_MUG_PALETTE,
  ACC_PAD,
  ACC_PAD_PALETTE,
  ACC_PHONE,
  ACC_PHONE_PALETTE,
  ACC_GUITAR,
  ACC_GUITAR_PALETTE,
  CAST,
  CAST_INFO,
  DUST,
  DUST_PALETTE,
  type CastId,
} from "@/components/game/cast";

export type Acc = "phone" | "book" | "food" | "pad" | "mug" | "guitar" | null;
/** Pose khusus pemilik rumah: tidur kaki terbuka, gerakan sholat, push up. */
export type SpecialLegs = "spread" | "qiyam" | "ruku" | "sujud" | "duduk" | "pushup" | "pushdown";
/** Gaya tidur yang "aneh": terbalik, miring, tengkurap. */
export type SleepStyle = "" | "flip" | "tilt" | "face";
export type Pose = { sit?: boolean; sleep?: boolean; acc?: Acc; lift?: number; legs?: SpecialLegs; style?: SleepStyle };
export type Locale = "id" | "en";
/** Teks dua bahasa. */
export type Line = { id: string; en: string };

export type ActorSpec = { id: string; cast: CastId; x: number; hidden?: boolean };

export type SceneApi = {
  walk: (id: string, x: number) => Promise<void>;
  place: (id: string, x: number) => void;
  face: (id: string, dir: 1 | -1) => void;
  faceTo: (id: string, otherId: string) => void;
  pose: (id: string, p: Pose) => void;
  show: (id: string, visible: boolean) => void;
  /** Apakah tokoh sedang ada (terlihat) di ruangan. */
  shown: (id: string) => boolean;
  /** Tokoh bebas dipanggil ke ruangan ini (tidak sedang berada di ruangan lain). */
  available: (id: string) => boolean;
  /** Pesan tokoh untuk ruangan ini sebelum ia berjalan masuk. false bila sudah dipegang ruangan lain. */
  reserve: (id: string) => boolean;
  /** `speech` = teks yang dibacakan bila berbeda dari teks gelembung (misalnya tanpa nama yang berubah-ubah). */
  say: (id: string, line: Line | string, speech?: Line) => Promise<void>;
  /** Reaksi singkat di atas kepala, misalnya "♪", "!", "?", "♥". */
  emote: (id: string, symbol: string) => Promise<void>;
  wait: (ms: number) => Promise<void>;
  /** Ubah keadaan benda (misalnya "open"/"closed", atau layar PC: "code", "game", ...). */
  prop: (propId: string, state: string) => void;
  fight: (a: string, b: string, ms: number) => Promise<void>;
  x: (id: string) => number;
  /** Posisi benda dalam persen lebar panggung. `at` 0 = tepi kiri, 0.5 = tengah, 1 = tepi kanan. */
  spot: (propId: string, at?: number) => number;
  /** Suara suasana, misalnya ketikan keyboard (`amount` = lama dalam ms). */
  sfx: (kind: Foley, amount?: number, pitch?: number) => void;
  /** Gelembung lirik lagu: langsung tampil selama `ms`, tanpa "sedang mengetik". */
  sing: (id: string, line: Line | string, ms: number) => Promise<void>;
  locale: () => Locale;
  night: () => boolean;
};

/** Tempat tidur tiap tokoh saat malam. Tanpa `prop`, tokoh tidur di tempatnya berdiri. */
export type Bed = { prop?: string; at?: number; lift?: number; sit?: boolean };

const PX = "var(--px)";
const SPEED = 170; // px per detik pada ukuran layar sebenarnya
const STEP_MS = 140;
const CANCEL = Symbol("cancel");
// Dilempar saat siang/malam berganti, supaya aktivitas yang sedang berjalan langsung berhenti.
const INTERRUPT = Symbol("interrupt");
const rnd = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

// Nada dasar "blip" obrolan tiap tokoh, supaya suaranya bisa dibedakan.
// Suara bicara tiap tokoh: jenis suara, tinggi nada, dan kecepatan.
const SPEAKERS: Record<CastId, VoiceProfile> = {
  me: { female: false, pitch: 1.0, rate: 1.05 },
  dina: { female: true, pitch: 1.15, rate: 1.05 },
  bayu: { female: false, pitch: 0.9, rate: 1.12 },
  client: { female: false, pitch: 0.75, rate: 0.95 },
  raka: { female: false, pitch: 1.05, rate: 1.0 },
  sari: { female: true, pitch: 1.05, rate: 1.0 },
  kevin: { female: false, pitch: 1.1, rate: 1.15 },
  rina: { female: true, pitch: 1.25, rate: 1.1 },
  budi: { female: false, pitch: 0.7, rate: 0.9 },
  tari: { female: true, pitch: 1.2, rate: 1.05 },
  joko: { female: false, pitch: 0.95, rate: 1.15 },
  lala: { female: true, pitch: 1.35, rate: 1.12 },
  nadia: { female: true, pitch: 0.98, rate: 1.0 },
};
// Bila ada beberapa suara untuk satu bahasa, tokoh berbeda memakai suara berbeda.
const CAST_SEED: Record<CastId, number> = {
  me: 0, dina: 0, bayu: 1, client: 2, raka: 3, sari: 1, kevin: 4, rina: 2, budi: 5, tari: 3, joko: 6, lala: 4, nadia: 5,
};

const VOICE: Record<CastId, number> = {
  me: 300, dina: 520, bayu: 340, client: 220, raka: 360, sari: 560, kevin: 380,
  rina: 600, budi: 200, tari: 540, joko: 280, lala: 640, nadia: 500,
};

type ActorState = { x: number; lift: number; facing: 1 | -1 };

const ACC_PLACEMENT: Record<Exclude<Acc, null>, { art: string[]; palette: Record<string, string>; left: number; top: number }> = {
  phone: { art: ACC_PHONE, palette: ACC_PHONE_PALETTE, left: 9, top: 4 },
  book: { art: ACC_BOOK, palette: ACC_BOOK_PALETTE, left: 1.5, top: 9 },
  food: { art: ACC_FOOD, palette: ACC_FOOD_PALETTE, left: 8.5, top: 8 },
  pad: { art: ACC_PAD, palette: ACC_PAD_PALETTE, left: 2, top: 10.5 },
  mug: { art: ACC_MUG, palette: ACC_MUG_PALETTE, left: 9, top: 9 },
  guitar: { art: ACC_GUITAR, palette: ACC_GUITAR_PALETTE, left: 0, top: 9 },
};

/* ---------- Ruangan yang "terdengar" ----------
   Hanya ruangan yang sedang dilihat (yang menutupi garis tengah layar) boleh bersuara.
   Saat pengunjung pindah ruangan, suara obrolan yang sedang dibacakan langsung dihentikan. */
const rooms = new Map<symbol, () => HTMLElement | null>();
let focusedRoom: symbol | null = null;
let focusListening = false;

function refocus() {
  const mid = window.innerHeight / 2;
  let next: symbol | null = null;
  for (const [key, el] of rooms) {
    const r = el()?.getBoundingClientRect();
    if (r && r.top <= mid && r.bottom >= mid) next = key;
  }
  if (next !== focusedRoom) {
    focusedRoom = next;
    stopSpeaking();
  }
  // Khusus pengembangan: id ruangan yang sedang terdengar, untuk dicek dari konsol.
  if (process.env.NODE_ENV === "development") {
    const el = next ? rooms.get(next)?.() : null;
    (window as unknown as { __audibleRoom?: string | null }).__audibleRoom = el?.id ?? null;
  }
}

function registerRoom(key: symbol, el: () => HTMLElement | null) {
  rooms.set(key, el);
  if (!focusListening && typeof window !== "undefined") {
    focusListening = true;
    let pending: number | undefined;
    const onScroll = () => {
      if (pending === undefined) pending = window.setTimeout(() => ((pending = undefined), refocus()), 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
  refocus();
  return () => {
    rooms.delete(key);
    if (focusedRoom === key) focusedRoom = null;
  };
}

/* ---------- Setiap tokoh hanya ada di satu ruangan ----------
   Saat tokoh muncul di sebuah ruangan, ruangan itu "memegang" tokoh tersebut sampai ia pergi.
   Ruangan lain tidak boleh memunculkan tokoh yang sedang dipegang ruangan lain. */
// `shown` = tokoh sudah tampil; bila belum (baru dipesan), pesanan gugur sendiri setelah beberapa detik.
const presence = new Map<CastId, { key: symbol; at: number; shown: boolean }>();
const holderOf = (cast: CastId) => {
  const h = presence.get(cast);
  if (h && !h.shown && Date.now() - h.at > 6000) {
    presence.delete(cast);
    return undefined;
  }
  return h;
};

/**
 * Panggung adegan: menampilkan perabot (children), para pemeran, dan gelembung obrolan,
 * lalu menjalankan `script` berulang kali selama panggung terlihat di layar.
 */
export function Scene({
  actors,
  script,
  intro,
  children,
  className = "",
  onActorClick,
  beds = {},
  exit = "door-l",
  hostExit,
  night,
  morning,
  nightMode = "sleep",
  nightScript,
  nightEnd,
  roomId,
  hostDoor = "door-r",
  hostSpot,
  onHostArrive,
}: {
  actors: ActorSpec[];
  beds?: Record<string, Bed>;
  /** Pintu yang dipakai tamu untuk pulang saat malam. */
  exit?: string;
  /** Pintu yang dipakai pemilik rumah untuk pergi ke kamarnya saat malam (bawaan: sama dengan `exit`). */
  hostExit?: string;
  /** Rutinitas malam khusus ruangan; `instant` = halaman dibuka saat sudah malam (langsung ke kondisi akhir). */
  night?: (api: SceneApi, instant: boolean) => Promise<void>;
  /** Rutinitas pagi khusus ruangan. */
  morning?: (api: SceneApi) => Promise<void>;
  /** "sleep" = semua tidur saat malam; "script" = naskah tetap jalan (ruangan punya jadwal sendiri). */
  nightMode?: "sleep" | "script";
  /** Kegiatan malam ruangan (diulang selama malam). Tanpa ini, ruangan sepi saat malam. */
  nightScript?: (api: SceneApi) => Promise<void>;
  /** Merapikan benda saat pagi tiba (misalnya mematikan TV). */
  nightEnd?: (api: SceneApi) => void;
  /** Id ruangan (sama dengan id section). Bila diisi, Rizky muncul/pergi mengikuti jadwalnya (rizky.ts). */
  roomId?: HouseRoom;
  /** Pintu yang dipakai Rizky masuk dan keluar ruangan ini. */
  hostDoor?: string;
  /** Posisi Rizky saat sudah ada di ruangan (dipakai bila ia "sudah dari tadi" di sini). */
  hostSpot?: (api: SceneApi) => number;
  /** Yang dilakukan Rizky begitu tiba (misalnya duduk di depan laptop). */
  onHostArrive?: (api: SceneApi) => Promise<void>;
  script: (api: SceneApi) => Promise<void>;
  intro?: (api: SceneApi) => Promise<void>;
  children?: React.ReactNode;
  className?: string;
  onActorClick?: (api: SceneApi, id: string) => void;
}) {
  const { locale } = useLanguage();
  const { play, fx, speak, babble } = useGame();
  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLDivElement | null>>({});
  const dustRef = useRef<HTMLDivElement>(null);
  const states = useRef<Record<string, ActorState>>(
    Object.fromEntries(actors.map((a) => [a.id, { x: a.x, lift: 0, facing: 1 as const }])),
  );
  const env = useRef({ alive: true, visible: false, width: 1, unit: 4, night: false, version: 0, run: 0 });
  // Kunci ruangan ini di daftar ruangan; suara hanya keluar bila ruangan ini yang sedang dilihat.
  const [roomKey] = useState(() => Symbol("room"));
  const audible = useCallback(() => env.current.visible && focusedRoom === roomKey, [roomKey]);
  const audibleRef = useRef(audible);
  const bedsRef = useRef(beds);
  const exitRef = useRef(exit);
  const hostExitRef = useRef(hostExit ?? exit);
  const nightRef = useRef(night);
  const morningRef = useRef(morning);
  const fxRef = useRef(fx);
  const speakRef = useRef(speak);
  const babbleRef = useRef(babble);
  const nightModeRef = useRef(nightMode);
  const nightScriptRef = useRef(nightScript);
  const nightEndRef = useRef(nightEnd);
  const roomRef = useRef(roomId);
  const hostDoorRef = useRef(hostDoor);
  const hostSpotRef = useRef(hostSpot);
  const onHostArriveRef = useRef(onHostArrive);
  const outfit = useOutfit();
  const castOf = useRef<Record<string, CastId>>(Object.fromEntries(actors.map((a) => [a.id, a.cast])));
  const localeRef = useRef<Locale>(locale);
  const scriptRef = useRef(script);
  const introRef = useRef(intro);
  const [bubbles, setBubbles] = useState<
    Record<string, { text: string; align: "left" | "center" | "right"; kind: "talk" | "typing" | "emote"; whisper?: boolean } | null>
  >({});

  useEffect(() => {
    localeRef.current = locale;
    scriptRef.current = script;
    introRef.current = intro;
    nightRef.current = night;
    nightScriptRef.current = nightScript;
    nightEndRef.current = nightEnd;
    hostSpotRef.current = hostSpot;
    onHostArriveRef.current = onHostArrive;
    morningRef.current = morning;
    fxRef.current = fx;
    speakRef.current = speak;
    babbleRef.current = babble;
  });

  const apply = useCallback((id: string) => {
    const el = els.current[id];
    const st = states.current[id];
    if (!el || !st) return;
    const px = (st.x / 100) * env.current.width;
    el.style.transform = `translate3d(${px}px, ${-st.lift * env.current.unit}px, 0)`;
    const face = el.querySelector<HTMLElement>(".face");
    if (face) face.style.transform = st.facing < 0 ? "scaleX(-1)" : "";
  }, []);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    env.current.width = stage.clientWidth;
    env.current.unit = parseFloat(getComputedStyle(stage).getPropertyValue("--px")) || 4;
    Object.keys(states.current).forEach(apply);
  }, [apply]);

  // Menunggu selama panggung tidak terlihat; berhenti total saat komponen dilepas,
  // dan memotong aktivitas saat siang/malam berganti.
  const gate = useCallback(async () => {
    const check = () => {
      if (!env.current.alive) throw CANCEL;
      if (env.current.version !== env.current.run) throw INTERRUPT;
    };
    while (!env.current.visible) {
      check();
      await new Promise((r) => setTimeout(r, 300));
    }
    check();
  }, []);

  const wait = useCallback(
    async (ms: number) => {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        await gate();
        await new Promise((r) => setTimeout(r, Math.min(200, end - performance.now())));
      }
      await gate();
    },
    [gate],
  );

  // Objek API dibuat sekali; fungsinya membaca ref hanya saat dipanggil (bukan saat render).
  const [api] = useState<SceneApi>(() => {
    const set = (id: string, key: string, value: string) => {
      const el = els.current[id];
      if (el) el.dataset[key] = value;
    };
    const self: SceneApi = {
      place: (id, x) => {
        // Benda tersembunyi (misalnya di HP) memberi NaN: tokoh tetap di posisinya.
        if (!Number.isFinite(x)) return;
        states.current[id].x = x;
        apply(id);
      },
      face: (id, dir) => {
        states.current[id].facing = dir;
        apply(id);
      },
      faceTo: (id, other) => {
        states.current[id].facing = states.current[other].x >= states.current[id].x ? 1 : -1;
        apply(id);
      },
      x: (id) => states.current[id].x,
      spot: (propId, at = 0.5) => {
        const stage = stageRef.current;
        const el = stage?.querySelector<HTMLElement>(`[data-prop="${propId}"]`);
        // Benda yang disembunyikan (misalnya di layar HP) mengembalikan NaN supaya naskah melewatinya.
        if (!stage || !el || el.offsetParent === null) return NaN;
        const s = stage.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        return ((r.left + r.width * at - s.left) / s.width) * 100;
      },
      show: (id, visible) => {
        set(id, "hidden", visible ? "false" : "true");
        const cast = castOf.current[id];
        if (!cast || cast === "me") return;
        if (visible) presence.set(cast, { key: roomKey, at: Date.now(), shown: true });
        else if (presence.get(cast)?.key === roomKey) presence.delete(cast);
      },
      available: (id) => {
        const cast = castOf.current[id];
        if (cast === "me") return rizky.room() === roomRef.current;
        const holder = holderOf(cast);
        return !holder || holder.key === roomKey;
      },
      reserve: (id) => {
        const cast = castOf.current[id];
        if (!cast || cast === "me") return true;
        const holder = holderOf(cast);
        if (holder && holder.key !== roomKey) return false;
        if (!holder) presence.set(cast, { key: roomKey, at: Date.now(), shown: false });
        return true;
      },
      shown: (id) => els.current[id]?.dataset.hidden !== "true",
      pose: (id, p) => {
        const st = states.current[id];
        set(id, "legs", p.legs ?? (p.sleep && !p.sit ? "lie" : p.sit ? "sit" : "idle"));
        set(id, "sleep", p.sleep ? "true" : "false");
        set(id, "style", p.style ?? "");
        set(id, "acc", p.acc ?? "");
        st.lift = p.lift ?? 0;
        apply(id);
      },
      walk: async (id, target) => {
        await gate();
        const st = states.current[id];
        st.lift = 0;
        set(id, "legs", "idle");
        set(id, "sleep", "false");
        set(id, "style", "");
        set(id, "acc", "");
        if (!Number.isFinite(target)) return;
        st.facing = target >= st.x ? 1 : -1;
        apply(id);
        let lastStep = performance.now();
        let leg = 0;
        await new Promise<void>((resolve, reject) => {
          let last = performance.now();
          const frame = (now: number) => {
            if (!env.current.alive) return reject(CANCEL);
            if (env.current.version !== env.current.run) {
              set(id, "legs", "idle");
              return reject(INTERRUPT);
            }
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            // Saat tidak terlihat, berhenti di tempat dan cek lagi nanti.
            if (!env.current.visible) {
              setTimeout(() => requestAnimationFrame(frame), 300);
              return;
            }
            const delta = ((SPEED * dt) / env.current.width) * 100;
            const remaining = target - st.x;
            if (Math.abs(remaining) <= delta) {
              st.x = target;
              apply(id);
              set(id, "legs", "idle");
              return resolve();
            }
            st.x += Math.sign(remaining) * delta;
            apply(id);
            if (now - lastStep > STEP_MS) {
              lastStep = now;
              leg = 1 - leg;
              set(id, "legs", leg ? "a" : "b");
              if (leg && audibleRef.current()) fxRef.current("step");
            }
            requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        });
      },
      say: async (id, line, speech) => {
        await gate();
        const text = typeof line === "string" ? line : line[localeRef.current];
        const x = states.current[id].x;
        const align = x < 12 ? "left" : x > 82 ? "right" : "center";
        // Titik-titik "sedang mengetik" sebentar sebelum kalimatnya muncul, seperti orang mikir dulu.
        setBubbles((b) => ({ ...b, [id]: { text: "...", align, kind: "typing" } }));
        await wait(350 + Math.random() * 450);
        setBubbles((b) => ({ ...b, [id]: { text, align, kind: "talk" } }));
        const cast = castOf.current[id];
        // Kalimat dibacakan dengan suara tokohnya; bila tidak bisa, cukup bunyi "blip" kecil.
        const profile = SPEAKERS[cast] ?? SPEAKERS.me;
        // Dibacakan dengan suara natural bila perangkat punya; bila tidak, tokoh "bergumam" bergaya gim.
        const spoken = speech ? speech[localeRef.current] : text;
        // Rizky sedang tidur: tokoh di ruangan lain bicara berbisik.
        const whisper = !!roomRef.current && roomRef.current !== "bedroom" && rizkyAsleep();
        if (whisper) setBubbles((b) => ({ ...b, [id]: { text, align, kind: "talk", whisper } }));
        // Suara natural bawaan perangkat bila ada (misalnya Microsoft Edge); bila tidak, suara gim yang mengalir.
        const voice = audibleRef.current()
          ? speakRef.current(spoken, localeRef.current, profile, CAST_SEED[cast] ?? 0, whisper ? 0.35 : 1) ??
            babbleRef.current(spoken, localeRef.current, (VOICE[cast] ?? 300) / 2, profile.female, whisper ? 0.35 : 1)
          : null;
        await wait(Math.max(1800, text.length * 58 + 800));
        // Gelembung tetap tampil sampai kalimatnya selesai dibacakan (maksimal 5 detik tambahan).
        if (voice) await Promise.race([voice, wait(5000)]);
        setBubbles((b) => ({ ...b, [id]: null }));
        await wait(200 + Math.random() * 500);
      },
      emote: async (id, symbol) => {
        await gate();
        setBubbles((b) => ({ ...b, [id]: { text: symbol, align: "center", kind: "emote" } }));
        await wait(900);
        setBubbles((b) => ({ ...b, [id]: null }));
      },
      wait,
      prop: (propId, state) => {
        const el = stageRef.current?.querySelector<HTMLElement>(`[data-prop="${propId}"]`);
        if (!el || el.dataset.state === state) return;
        el.dataset.state = state;
        if (!audibleRef.current()) return;
        if (propId.startsWith("door")) fxRef.current(state === "open" ? "doorOpen" : "doorClose");
        else if (propId === "fridge" && state === "open") fxRef.current("fridge");
        else if (propId === "wardrobe") fxRef.current(state === "open" ? "wardrobeOpen" : "wardrobeClose");
        else if (propId === "sajadah") fxRef.current("cloth");
      },
      sfx: (kind, amount, pitch) => {
        if (audibleRef.current()) fxRef.current(kind, amount, pitch);
      },
      sing: async (id, line, ms) => {
        await gate();
        const text = `♪ ${typeof line === "string" ? line : line[localeRef.current]} ♪`;
        const x = states.current[id].x;
        const align = x < 12 ? "left" : x > 82 ? "right" : "center";
        setBubbles((b) => ({ ...b, [id]: { text, align, kind: "talk" } }));
        await wait(ms);
        setBubbles((b) => ({ ...b, [id]: null }));
      },
      fight: async (a, b, ms) => {
        await gate();
        const dust = dustRef.current;
        const mid = (states.current[a].x + states.current[b].x) / 2;
        if (dust) {
          dust.style.left = `${mid}%`;
          dust.style.visibility = "visible";
        }
        self.show(a, false);
        self.show(b, false);
        await wait(ms);
        if (dust) dust.style.visibility = "hidden";
        self.show(a, true);
        self.show(b, true);
      },
      locale: () => localeRef.current,
      night: () => env.current.night,
    };
    return self;
  });

  // Daftarkan ruangan (section pembungkus panggung) untuk menentukan ruangan mana yang terdengar.
  useEffect(() => registerRoom(roomKey, () => stageRef.current?.closest("section") ?? stageRef.current), [roomKey]);

  // Ukuran panggung dan visibilitas: dicek saat scroll/resize (diperlambat) dan berkala.
  useEffect(() => {
    measure();
    const check = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const was = env.current.visible;
      env.current.visible = r.bottom > 0 && r.top < window.innerHeight;
      // Ruangan baru terlihat lagi: Rizky langsung disesuaikan dengan jadwalnya, supaya tidak tampak
      // "tertinggal" di ruangan yang sudah ia tinggalkan (atau belum muncul di ruangan tempatnya sekarang).
      if (!was && env.current.visible && roomRef.current && states.current.me) {
        const here = rizky.room() === roomRef.current;
        if (here !== api.shown("me")) {
          if (here) {
            const target = hostSpotRef.current?.(api);
            api.pose("me", {});
            api.place("me", Number.isFinite(target) ? target! : 45);
          }
          api.show("me", here);
        }
      }
    };
    let pending: number | undefined;
    const onScroll = () => {
      if (pending === undefined) pending = window.setTimeout(() => ((pending = undefined), check()), 120);
    };
    check();
    const interval = window.setInterval(check, 1000);
    const ro = new ResizeObserver(() => {
      measure();
      check();
    });
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(pending);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure, api]);

  // Siang/malam mengikuti tema halaman (kelas "dark" di <html>).
  useEffect(() => {
    const root = document.documentElement;
    env.current.night = root.classList.contains("dark");
    const mo = new MutationObserver(() => {
      const night = root.classList.contains("dark");
      if (night !== env.current.night) {
        env.current.night = night;
        // Ruangan dengan jadwal sendiri tidak diinterupsi pergantian siang/malam.
        if (nightModeRef.current === "sleep") env.current.version++;
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Jalankan intro sekali, lalu naskah berulang selama komponen hidup.
  // Saat malam, semua tokoh tidur sampai siang; saat siang kembali, mereka bangun.
  useEffect(() => {
    const e = env.current;
    e.alive = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleIds = () => Object.keys(states.current).filter((id) => els.current[id]?.dataset.hidden !== "true");

    // Malam: tokoh yang punya tempat tidur (pemilik rumah) tidur; tamu pamit lalu pulang lewat pintu.
    const sleepAll = async () => {
      setBubbles({});
      await Promise.all(
        visibleIds()
          // Rizky diatur jadwalnya sendiri (syncHost), kecuali di ruangan tanpa jadwal.
          .filter((id) => !(roomRef.current && castOf.current[id] === "me"))
          .map(async (id, i) => {
          const bed = bedsRef.current[id];
          if (!bed) {
            await api.wait(i * 600);
            // Pemilik rumah pamit ke kamarnya; tamu pamit pulang.
            const host = castOf.current[id] === "me";
            await api.say(id, rnd(host ? BEDTIME : NIGHT_BYE));
            const door = host ? hostExitRef.current : exitRef.current;
            await api.walk(id, api.spot(door));
            api.prop(door, "open");
            await api.wait(250);
            api.show(id, false);
            await api.wait(300);
            api.prop(door, "closed");
            return;
          }
          if (bed.prop) await api.walk(id, api.spot(bed.prop, bed.at ?? 0.5));
          api.face(id, 1);
          api.pose(id, { sleep: true, sit: bed.sit, lift: bed.lift ?? 0 });
        }),
      );
    };

    const wakeAll = async () => {
      if (morningRef.current) return morningRef.current(api);
      // Pagi tiba: rombongan malam pamit pulang, benda-benda dirapikan.
      if (nightScriptRef.current) {
        setBubbles({});
        nightEndRef.current?.(api);
        const crew = visibleIds().filter((id) => castOf.current[id] !== "me");
        await Promise.all(
          crew.map(async (id, i) => {
            await api.wait(i * 700);
            await api.say(id, rnd(MORNING_BYE));
            const door = exitRef.current;
            await api.walk(id, api.spot(door));
            api.prop(door, "open");
            await api.wait(250);
            api.show(id, false);
            await api.wait(300);
            api.prop(door, "closed");
          }),
        );
        return;
      }
      setBubbles({});
      const ids = visibleIds();
      ids.forEach((id) => api.pose(id, {}));
      if (ids.length) await api.say(rnd(ids), rnd(WAKE_LINES));
    };

    // Rizky cuma satu: ikuti jadwalnya. Bila ia baru saja pindah dan ruangan ini sedang dilihat,
    // tampilkan adegan masuk/pamit; bila sudah lama, langsung tampil/hilang tanpa adegan.
    const syncHost = async () => {
      const room = roomRef.current;
      if (!room || !states.current.me) return;
      const here = rizky.room() === room;
      if (here === api.shown("me")) return;
      const recent = rizky.sinceMs() < 8000 && e.visible;
      const door = hostDoorRef.current;
      if (here) {
        const target = hostSpotRef.current?.(api);
        const to = Number.isFinite(target) ? target! : rand(35, 60);
        if (recent) {
          api.prop(door, "open");
          api.place("me", api.spot(door));
          await api.wait(250);
          api.show("me", true);
          await api.walk("me", to);
          api.prop(door, "closed");
          if (!rizkyAsleep()) await api.say("me", rnd(HOST_ARRIVE));
        } else {
          api.pose("me", {});
          api.place("me", to);
          api.show("me", true);
        }
        await onHostArriveRef.current?.(api);
        return;
      }
      if (recent) {
        const dest = rizky.room();
        api.pose("me", {});
        await api.say("me", rnd(dest === "bedroom" && (e.night || rizkyAsleep()) ? BEDTIME : LEAVE_TO(ROOM_NAME[dest])));
        await api.walk("me", api.spot(door));
        api.prop(door, "open");
        await api.wait(250);
        api.show("me", false);
        await api.wait(300);
        api.prop(door, "closed");
      } else {
        api.show("me", false);
      }
    };

    const goodnight = async (instant: boolean) => {
      if (nightRef.current) return nightRef.current(api, instant);
      if (!instant) await sleepAll();
    };

    (async () => {
      try {
        e.run = e.version;
        // Dibuka saat sudah malam: lewati intro, rumah langsung dalam keadaan tidur.
        let instant = e.night;
        try {
          if (introRef.current && !e.night) await introRef.current(api);
        } catch (err) {
          if (err !== INTERRUPT) throw err;
        }
        let slept = false;
        while (e.alive) {
          e.run = e.version;
          try {
            if (e.night && nightModeRef.current === "sleep") {
              // Ditandai sebelum tidur dimulai: kalau siang datang di tengah jalan, tetap dibangunkan.
              if (!slept) {
                slept = true;
                const now = instant;
                instant = false;
                await goodnight(now);
              }
              // Ruangan dengan kegiatan malam: rombongan malam bergantian datang sampai pagi.
              if (nightScriptRef.current) {
                await syncHost();
                await nightScriptRef.current(api);
                continue;
              }
              // Tidur sampai tema berganti (gate melempar INTERRUPT).
              for (;;) await wait(1000);
            }
            if (slept) {
              slept = false;
              await wakeAll();
            }
            await syncHost();
            await scriptRef.current(api);
            if (reduced) await wait(4000);
          } catch (err) {
            if (err !== INTERRUPT) throw err;
            setBubbles({});
          }
        }
      } catch (err) {
        if (err !== CANCEL) console.error(err);
      }
    })();
    return () => {
      e.alive = false;
      // Lepaskan semua tokoh yang dipegang ruangan ini.
      presence.forEach((holder, cast) => holder.key === roomKey && presence.delete(cast));
    };
  }, [wait, api, roomKey]);

  return (
    <div ref={stageRef} className={`relative ${className}`}>
      {children}

      <div
        ref={dustRef}
        className="pointer-events-none absolute bottom-0 z-30 -translate-x-1/2 animate-shake"
        style={{ visibility: "hidden" }}
        aria-hidden
      >
        <Sprite art={DUST} palette={DUST_PALETTE} px={PX} />
      </div>

      {actors.map((a) => {
        const isMe = a.cast === "me";
        const me = isMe ? meArt(outfit) : null;
        const art = me ?? CAST[a.cast];
        const bubble = bubbles[a.id];
        return (
          <div
            key={a.id}
            ref={(el) => {
              els.current[a.id] = el;
            }}
            className="actor absolute bottom-0 left-0 z-20 will-change-transform"
            data-legs="idle"
            data-acc=""
            data-sleep="false"
            data-style=""
            data-hidden={a.hidden ? "true" : "false"}
            style={{ marginLeft: `calc(-6 * ${PX})` }}
          >
            {/* "z" melayang saat tidur (ditampilkan lewat CSS dari data-sleep). */}
            <span className="zzz pointer-events-none absolute -top-2 left-1/2 font-pixel text-base font-bold text-ink-soft" aria-hidden>
              <span className="animate-zzz inline-block">z</span>
              <span className="animate-zzz inline-block [animation-delay:0.9s]">Z</span>
            </span>
            {bubble && (
              <p
                key={bubble.kind + bubble.text}
                role={bubble.kind === "talk" ? "status" : undefined}
                aria-hidden={bubble.kind !== "talk"}
                className={`speech absolute bottom-[calc(100%+12px)] z-40 w-max max-w-[min(260px,70vw)] border-2 border-line bg-panel leading-snug text-ink shadow-[3px_3px_0_0_var(--g-shadow)] ${
                  bubble.kind === "talk"
                    ? bubble.whisper
                      ? "px-2.5 py-1.5 text-xs italic opacity-80"
                      : "px-3 py-2 text-sm font-semibold"
                    : bubble.kind === "typing"
                      ? "px-3 py-1 font-pixel text-base tracking-widest text-ink-soft"
                      : "px-2 py-0.5 font-pixel text-lg font-bold text-cherry"
                } ${
                  bubble.align === "left" ? "left-0" : bubble.align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                {bubble.text}
              </p>
            )}
            <button
              type="button"
              className="face relative block"
              onClick={() => {
                // Tokoh yang sedang tidur menggumam; selain itu menyapa pengunjung.
                play("select");
                if (els.current[a.id]?.dataset.sleep === "true" || (env.current.night && nightModeRef.current === "sleep" && !nightScriptRef.current)) {
                  api.say(a.id, rnd(SLEEP_TALK)).catch(() => {});
                  return;
                }
                if (onActorClick) return onActorClick(api, a.id);
                api.say(a.id, rnd(GREETINGS)).catch(() => {});
              }}
              aria-label={`${CAST_INFO[a.cast].name}, ${CAST_INFO[a.cast].role[locale]}`}
              title={`${CAST_INFO[a.cast].name} · ${CAST_INFO[a.cast].role[locale]}`}
              tabIndex={-1}
            >
              <Sprite art={art.idle} palette={art.palette} px={PX} className="legs legs-idle" />
              <Sprite art={art.a} palette={art.palette} px={PX} className="legs legs-a" />
              <Sprite art={art.b} palette={art.palette} px={PX} className="legs legs-b" />
              <Sprite art={art.sit} palette={art.palette} px={PX} className="legs legs-sit" />
              <Sprite art={art.lie} palette={art.palette} px={PX} className="legs legs-lie" />
              {me && (
                <>
                  <Sprite art={me.spread} palette={me.palette} px={PX} className="legs legs-spread" />
                  {(["qiyam", "ruku", "sujud", "duduk", "pushup", "pushdown"] as const).map((p) => (
                    <Sprite key={p} art={me[p]} palette={me.palette} px={PX} className={`legs legs-${p}`} />
                  ))}
                  <Sprite art={me.sitZ} palette={me.palette} px={PX} className="legs legs-sit eyes-z" />
                  <Sprite art={me.lieZ} palette={me.palette} px={PX} className="legs legs-lie eyes-z" />
                  <Sprite art={me.spreadZ} palette={me.palette} px={PX} className="legs legs-spread eyes-z" />
                </>
              )}
              {(Object.keys(ACC_PLACEMENT) as Exclude<Acc, null>[]).map((key) => {
                const acc = ACC_PLACEMENT[key];
                return (
                  <span
                    key={key}
                    className={`acc acc-${key} absolute`}
                    style={{ left: `calc(${acc.left} * ${PX})`, top: `calc(${acc.top} * ${PX})` }}
                  >
                    <Sprite art={acc.art} palette={acc.palette} px={PX} />
                  </span>
                );
              })}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Kantong acak: mengambil item tanpa pengulangan sampai semua terpakai, lalu dikocok ulang. */
export function bag<T>(items: T[]) {
  let pool: T[] = [];
  let last: T | undefined;
  return () => {
    if (pool.length === 0) {
      pool = [...items].sort(() => Math.random() - 0.5);
      // Hindari item yang sama muncul dua kali berturut-turut saat kantong dikocok ulang.
      if (pool.length > 1 && pool[pool.length - 1] === last) pool.unshift(pool.pop()!);
    }
    last = pool.pop()!;
    return last;
  };
}

export const rand = (min: number, max: number) => min + Math.random() * (max - min);
