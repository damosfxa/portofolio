"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Radio } from "@/lib/radio";
import { playBabble, playFoley, type Foley } from "@/lib/foley";
import { getAudio, readVolume } from "@/lib/audio";
import { speak as speakText, stopSpeaking, type VoiceProfile } from "@/lib/speech";

export type Sfx = "select" | "coin" | "jump" | "start" | "powerup" | "meow";

type Note = { f: number; t: number; d: number; to?: number };

// Efek suara dibuat langsung dengan gelombang segitiga (lebih lembut dari kotak), tanpa file audio.
const SFX: Record<Sfx, Note[]> = {
  select: [{ f: 880, t: 0, d: 0.05 }],
  coin: [
    { f: 988, t: 0, d: 0.07 },
    { f: 1319, t: 0.07, d: 0.28 },
  ],
  jump: [{ f: 300, t: 0, d: 0.16, to: 820 }],
  start: [
    { f: 523, t: 0, d: 0.09 },
    { f: 659, t: 0.09, d: 0.09 },
    { f: 784, t: 0.18, d: 0.09 },
    { f: 1047, t: 0.27, d: 0.22 },
  ],
  powerup: [
    { f: 392, t: 0, d: 0.06 },
    { f: 523, t: 0.06, d: 0.06 },
    { f: 659, t: 0.12, d: 0.06 },
    { f: 784, t: 0.18, d: 0.06 },
    { f: 1047, t: 0.24, d: 0.14 },
  ],
  meow: [
    { f: 760, t: 0, d: 0.12, to: 980 },
    { f: 980, t: 0.12, d: 0.22, to: 620 },
  ],
};

type GameState = {
  soundOn: boolean;
  toggleSound: () => void;
  musicOn: boolean;
  toggleMusic: () => void;
  play: (sfx: Sfx) => void;
  /** Suara suasana (pintu, ketikan, obrolan); diam bila efek suara dimatikan. */
  fx: (kind: Foley, amount?: number, pitch?: number) => void;
  /** Bacakan kalimat obrolan; null bila tidak bisa (suara mati, tidak ada suara bahasa ini, atau sedang ada yang bicara). */
  /** `factor` = pengali volume (misalnya 0.35 untuk berbisik). */
  speak: (text: string, lang: "id" | "en", voice: VoiceProfile, seed: number, factor?: number) => Promise<void> | null;
  /** Suara obrolan bergaya gim (bergumam mengikuti suku kata); null bila suara mati. */
  babble: (text: string, lang: "id" | "en", base: number, female: boolean, factor?: number) => Promise<void> | null;
};

const GameContext = createContext<GameState>({
  soundOn: false,
  toggleSound: () => {},
  musicOn: false,
  toggleMusic: () => {},
  play: () => {},
  fx: () => {},
  speak: () => null,
  babble: () => null,
});

export const useGame = () => useContext(GameContext);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const radioRef = useRef<Radio | null>(null);

  // Musik hanya dimulai lewat klik pengunjung (browser memblokir audio otomatis).
  const toggleMusic = useCallback(() => {
    const radio = (radioRef.current ??= new Radio());
    if (radio.playing) {
      radio.stop();
      setMusicOn(false);
    } else {
      radio.start();
      setMusicOn(true);
    }
  }, []);

  useEffect(() => () => radioRef.current?.stop(), []);

  useEffect(() => {
    try {
      // Efek suara mati secara bawaan (misalnya perekrut membuka di kantor); menyala bila pengunjung pernah menyalakannya.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("rr_sound") === "on") setSoundOn(true);
    } catch {}
    // Browser baru mengizinkan suara setelah interaksi pertama; siapkan AudioContext saat itu.
    const unlock = () => {
      try {
        const ctx = (ctxRef.current ??= getAudio().ctx);
        if (ctx.state === "suspended") ctx.resume();
      } catch {}
    };
    // Menggulir halaman tidak dihitung sebagai interaksi oleh browser, jadi suara baru aktif setelah klik, sentuh, atau tombol.
    const events = ["pointerdown", "touchstart", "click", "keydown"] as const;
    events.forEach((ev) => window.addEventListener(ev, unlock, { once: true, passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, unlock));
  }, []);

  const soundRef = useRef(soundOn);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // Hanya berbunyi bila AudioContext sudah berjalan, supaya suara tidak menumpuk lalu meledak bersamaan.
  const fx = useCallback((kind: Foley, amount?: number, pitch?: number) => {
    const ctx = ctxRef.current;
    if (!soundRef.current || !ctx || ctx.state !== "running" || document.hidden) return;
    try {
      playFoley(ctx, kind, amount, pitch, getAudio().sfx);
    } catch {}
  }, []);

  const speak = useCallback((text: string, lang: "id" | "en", voice: VoiceProfile, seed: number, factor = 1) => {
    const ctx = ctxRef.current;
    // Sama seperti efek suara: hanya setelah pengunjung berinteraksi dan efek suara menyala.
    if (!soundRef.current || !ctx || ctx.state !== "running" || document.hidden) return null;
    return speakText(text, lang, voice, readVolume("voice") * factor, seed);
  }, []);

  const babble = useCallback((text: string, lang: "id" | "en", base: number, female: boolean, factor = 1) => {
    const ctx = ctxRef.current;
    if (!soundRef.current || !ctx || ctx.state !== "running" || document.hidden) return null;
    try {
      const ms = playBabble(ctx, getAudio().voice, text, lang, base, female, factor);
      return new Promise<void>((r) => window.setTimeout(r, ms));
    } catch {
      return null;
    }
  }, []);

  // Hentikan suara obrolan saat tab disembunyikan atau halaman ditutup.
  useEffect(() => {
    const onHide = () => document.hidden && stopSpeaking();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      stopSpeaking();
    };
  }, []);

  const playNotes = useCallback((notes: Note[]) => {
    try {
      const ctx = (ctxRef.current ??= getAudio().ctx);
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      for (const n of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, now + n.t);
        if (n.to) osc.frequency.linearRampToValueAtTime(n.to, now + n.t + n.d);
        gain.gain.setValueAtTime(0.09, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
        osc.connect(gain).connect(getAudio().sfx);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.02);
      }
    } catch {
      // Browser tanpa WebAudio: diam saja.
    }
  }, []);

  const play = useCallback(
    (sfx: Sfx) => {
      if (soundOn) playNotes(SFX[sfx]);
    },
    [soundOn, playNotes],
  );

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem("rr_sound", next ? "on" : "off");
    } catch {}
    // Bunyi konfirmasi saat suara dinyalakan.
    if (next) playNotes(SFX.select);
  }, [soundOn, playNotes]);

  return (
    <GameContext.Provider value={{ soundOn, toggleSound, musicOn, toggleMusic, play, fx, speak, babble }}>
      {children}
    </GameContext.Provider>
  );
}
