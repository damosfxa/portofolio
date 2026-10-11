// Pemutar musik latar: playlist siang dan malam dari /public/music, diputar acak tanpa pengulangan,
// berganti suasana mengikuti tema (siang/malam) dengan fade halus.
// Bila file gagal dimuat, beralih ke musik buatan WebAudio supaya tombol musik tetap berfungsi.
import { Lofi } from "@/lib/lofi";
import { getAudio } from "@/lib/audio";

export type Mood = "day" | "night";
export type Track = { src: string; title: string; artist: string; url: string; mood: Mood };

const HOLIZNA_BEATS = "https://opengameart.org/content/chill-beats-collection";
const HOLIZNA_SAD = "https://opengameart.org/content/sad-lo-fi-lofi-collectioni";

// Semua lagu berlisensi CC0 (domain publik) dari OpenGameArt.
export const TRACKS: Track[] = [
  // Siang: lebih ringan dan bertenaga.
  { src: "/music/etirwer.mp3", title: "Etirwer", artist: "Kistol", url: "https://opengameart.org/content/etirwer", mood: "day" },
  { src: "/music/chill-loopable.mp3", title: "Chill (Loopable)", artist: "Alex McCulloch", url: "https://opengameart.org/content/chill-loopable", mood: "day" },
  { src: "/music/city-in-the-rearview.mp3", title: "City In The Rearview", artist: "Holizna", url: HOLIZNA_BEATS, mood: "day" },
  { src: "/music/families.mp3", title: "Families", artist: "Holizna", url: HOLIZNA_BEATS, mood: "day" },
  { src: "/music/opinions.mp3", title: "Opinions", artist: "Holizna", url: HOLIZNA_BEATS, mood: "day" },
  { src: "/music/dream-pop.mp3", title: "Dream Pop", artist: "Holizna", url: HOLIZNA_BEATS, mood: "day" },
  // Malam: pelan dan hangat.
  { src: "/music/chill-lofi.mp3", title: "Chill lofi inspired", artist: "omfgdude", url: "https://opengameart.org/content/chill-lofi-inspired", mood: "night" },
  { src: "/music/fire-place.mp3", title: "Fire Place", artist: "Holizna", url: HOLIZNA_SAD, mood: "night" },
  { src: "/music/winter-blues.mp3", title: "Winter Blues", artist: "Holizna", url: HOLIZNA_SAD, mood: "night" },
  { src: "/music/small-towns.mp3", title: "Small Towns Smaller Lives", artist: "Holizna", url: HOLIZNA_SAD, mood: "night" },
  { src: "/music/yesterday.mp3", title: "Yesterday", artist: "Holizna", url: HOLIZNA_SAD, mood: "night" },
];

// Volume dasar lagu; pengaturan volume pengunjung (0 sampai 200%) diterapkan di jalur musik.
const VOLUME = 0.35;
const FADE = 0.35; // konstanta waktu fade (detik)

const currentMood = (): Mood => (document.documentElement.classList.contains("dark") ? "night" : "day");
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export class Radio {
  private audio: HTMLAudioElement | null = null;
  private level: GainNode | null = null;
  private queue: Track[] = [];
  private queueMood: Mood | null = null;
  private lastSrc = "";
  private fadeTimer: number | null = null;
  private fallback: Lofi | null = null;
  private observer: MutationObserver | null = null;
  private on = false;

  get playing() {
    return this.on;
  }

  start() {
    if (this.on) return;
    this.on = true;
    if (this.fallback) return this.fallback.start();
    this.watchMood();
    const audio = this.element();
    // Lanjutkan lagu yang dijeda bila suasananya masih sama; selain itu mulai lagu baru.
    if (!audio.src || this.queueMood !== currentMood()) return this.next();
    audio.play().then(() => this.fade(VOLUME), () => this.useFallback());
  }

  stop() {
    if (!this.on) return;
    this.on = false;
    this.observer?.disconnect();
    this.observer = null;
    if (this.fallback) return this.fallback.stop();
    this.fade(0, () => this.audio?.pause());
  }

  private element() {
    if (this.audio) return this.audio;
    const audio = new Audio();
    audio.preload = "auto";
    // Lagu dialirkan lewat WebAudio supaya volumenya bisa dinaikkan melebihi 100%.
    const { ctx, music } = getAudio();
    if (ctx.state === "suspended") ctx.resume();
    const level = ctx.createGain();
    level.gain.value = 0;
    ctx.createMediaElementSource(audio).connect(level).connect(music);
    this.level = level;
    audio.addEventListener("ended", () => this.next());
    audio.addEventListener("error", () => this.useFallback());
    this.audio = audio;
    return audio;
  }

  // Siang berganti malam (atau sebaliknya): pelankan lagu sekarang, lalu lanjut ke playlist suasana baru.
  private watchMood() {
    if (this.observer) return;
    this.observer = new MutationObserver(() => {
      if (this.on && this.queueMood && this.queueMood !== currentMood()) this.fade(0, () => this.next());
    });
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  private pickNext(): Track {
    const mood = currentMood();
    if (mood !== this.queueMood || this.queue.length === 0) {
      this.queueMood = mood;
      this.queue = shuffle(TRACKS.filter((t) => t.mood === mood));
      // Hindari lagu yang sama dua kali berturut-turut saat playlist dikocok ulang.
      if (this.queue.length > 1 && this.queue[0].src === this.lastSrc) this.queue.push(this.queue.shift()!);
    }
    const track = this.queue.shift()!;
    this.lastSrc = track.src;
    return track;
  }

  private next() {
    const audio = this.element();
    audio.src = this.pickNext().src;
    if (this.level) this.level.gain.value = 0;
    if (this.on) audio.play().then(() => this.fade(VOLUME), () => this.useFallback());
  }

  private fade(target: number, done?: () => void) {
    const level = this.level;
    if (!level) return;
    if (this.fadeTimer !== null) window.clearTimeout(this.fadeTimer);
    const ctx = level.context;
    level.gain.cancelScheduledValues(ctx.currentTime);
    level.gain.setTargetAtTime(target, ctx.currentTime, FADE);
    this.fadeTimer = window.setTimeout(() => {
      this.fadeTimer = null;
      done?.();
    }, FADE * 3500);
  }

  private useFallback() {
    if (this.fallback) return;
    this.audio?.pause();
    this.audio = null;
    this.fallback = new Lofi();
    if (this.on) this.fallback.start();
  }
}
