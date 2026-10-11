// Suara suasana rumah (pintu, ketikan, obrolan) yang disusun langsung dengan WebAudio, tanpa file audio.
// Obrolan hanya berupa "blip" kecil seperti gim pixel; pintu, langkah, dan gitar dibuat semirip mungkin aslinya.

import { SONGS } from "@/content/songs";
import { chordAt, melodyOf, syllablesOf, type SongNote, type Vowel } from "@/lib/song";

export type Foley = "doorOpen" | "doorClose" | "type" | "talk" | "fridge" | "songLine" | "game" | "eat" | "step" | "wardrobeOpen" | "wardrobeClose" | "cloth" | "tv" | "cheer" | "kentongan" | "camera" | "page" | "slap";

let noise: AudioBuffer | null = null;
const noiseOf = (ctx: BaseAudioContext) => {
  if (noise && noise.sampleRate === ctx.sampleRate) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
};

const env = (ctx: BaseAudioContext, t: number, level: number, attack: number, dur: number) => {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(level, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
};

const tone = (ctx: BaseAudioContext, out: AudioNode, type: OscillatorType, f0: number, f1: number, t: number, dur: number, level: number) => {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  osc.connect(env(ctx, t, level, 0.01, dur)).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
};

const hiss = (ctx: BaseAudioContext, out: AudioNode, type: BiquadFilterType, freq: number, t: number, dur: number, level: number) => {
  const src = ctx.createBufferSource();
  src.buffer = noiseOf(ctx);
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  src.connect(f).connect(env(ctx, t, level, 0.003, dur)).connect(out);
  src.start(t, Math.random() * 0.8);
  src.stop(t + dur + 0.02);
};

/* ---------- Gitar dan nyanyian ---------- */

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Senar dipetik (Karplus-Strong): derau pendek yang diulang lewat garis tunda dan makin redam.
const strings = new Map<number, AudioBuffer>();
function stringOf(ctx: BaseAudioContext, freq: number) {
  const key = Math.round(freq * 10);
  const hit = strings.get(key);
  if (hit && hit.sampleRate === ctx.sampleRate) return hit;
  const len = Math.floor(ctx.sampleRate * 1.6);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(ctx.sampleRate / freq));
  const ring = new Float32Array(period).map(() => Math.random() * 2 - 1);
  for (let i = 0; i < len; i++) {
    const j = i % period;
    const next = ring[(j + 1) % period];
    d[i] = ring[j];
    ring[j] = 0.497 * (ring[j] + next);
  }
  strings.set(key, buf);
  return buf;
}

function strum(ctx: BaseAudioContext, out: AudioNode, notes: number[], t: number, up: boolean, level: number) {
  const order = up ? [...notes].reverse() : notes;
  order.forEach((n, i) => {
    const src = ctx.createBufferSource();
    src.buffer = stringOf(ctx, midi(n));
    const g = ctx.createGain();
    g.gain.value = level * (up ? 0.6 : 1);
    src.connect(g).connect(out);
    src.start(t + i * 0.014);
  });
}

// Formant vokal (tiga frekuensi resonansi mulut) untuk tiap huruf vokal.
const FORMANTS: Record<Vowel, [number, number, number]> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [300, 2200, 2950],
  o: [570, 840, 2410],
  u: [320, 870, 2240],
};

// Gema ruangan kecil supaya gitar dan suara tidak terdengar "kering".
let reverbIr: AudioBuffer | null = null;
function reverbOf(ctx: BaseAudioContext) {
  if (reverbIr && reverbIr.sampleRate === ctx.sampleRate) return reverbIr;
  const len = Math.floor(ctx.sampleRate * 1.4);
  reverbIr = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = reverbIr.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return reverbIr;
}

export type Voice = { shift: number; formant: number; level: number; detune: number };
const LEAD: Voice = { shift: 0, formant: 1, level: 0.38, detune: 0 };
// Teman: perempuan satu oktaf di atas dengan formant lebih tinggi; laki-laki senada, sedikit meleset.
const FEMALE: Voice = { shift: 12, formant: 1.18, level: 0.17, detune: 6 };
const MALE: Voice = { shift: 0, formant: 0.94, level: 0.17, detune: -9 };

/** Satu suku kata dinyanyikan: konsonan singkat di awal, lalu vokal bernada dengan vibrato. */
function singSyllable(ctx: BaseAudioContext, out: AudioNode, note: SongNote, t: number, dur: number, v: Voice) {
  const f0 = midi(note.midi + v.shift);
  const { onset, vowel } = note.syl;
  // Konsonan: letupan (p, t, k) atau desis (s, f, h) dari derau yang disaring.
  if (onset === "plosive") hiss(ctx, out, "bandpass", 2500, t, 0.025, v.level * 0.5);
  if (onset === "fricative") hiss(ctx, out, "highpass", 4500, t, 0.07, v.level * 0.35);
  const start = t + (onset === "fricative" ? 0.05 : onset === "plosive" ? 0.02 : 0);
  const end = t + dur;

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.detune.value = v.detune;
  // Nada sedikit meluncur naik di awal, seperti penyanyi mencari nada.
  osc.frequency.setValueAtTime(f0 * 0.97, start);
  osc.frequency.linearRampToValueAtTime(f0, start + 0.06);
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.value = 5.2;
  depth.gain.setValueAtTime(0, start);
  depth.gain.linearRampToValueAtTime(dur > 0.4 ? f0 * 0.018 : 0, Math.min(end, start + 0.35));
  lfo.connect(depth).connect(osc.frequency);

  const g = ctx.createGain();
  const attack = onset === "soft" ? 0.05 : 0.025;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(v.level, start + attack);
  g.gain.setValueAtTime(v.level * 0.9, Math.max(start + attack, end - 0.08));
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  FORMANTS[vowel].forEach((f, i) => {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f * v.formant;
    bp.Q.value = [7, 9, 11][i];
    const fg = ctx.createGain();
    fg.gain.value = [1, 0.55, 0.25][i];
    osc.connect(bp).connect(fg).connect(g);
  });
  g.connect(out);
  osc.start(start);
  lfo.start(start);
  osc.stop(end + 0.05);
  lfo.stop(end + 0.05);
}

const BPM = 96;
const EIGHTH = 60 / BPM / 2;
const CHORDS: Record<string, number[]> = {
  C: [48, 52, 55, 60, 64],
  G: [43, 47, 50, 55, 59, 67],
  Am: [45, 52, 57, 60, 64],
  F: [41, 48, 53, 57, 60],
};
/** Nomor "baris" khusus untuk bagian instrumental (gitar saja). */
export const INSTRUMENTAL = 9;
/** Lama satu baris lagu (ms). */
export const SONG_LINE_MS = Math.round(16 * EIGHTH * 1000);
const STRUM = [
  [0, false],
  [2, false],
  [3, true],
  [5, true],
  [6, false],
  [7, true],
] as const;

/**
 * Satu baris lagu: gitar dipetik pelan sebagai pengiring, vokal menyanyikan setiap suku kata lirik.
 * `friends`: 1 = teman laki-laki ikut, 2 = teman perempuan ikut, 3 = keduanya.
 */
/** Pengali volume gitar dan vokal (dipakai saat menguji keseimbangan suara). */
export const songMix = { guitar: 1, voice: 1 };

function songLine(ctx: BaseAudioContext, dest: AudioNode, songIndex: number, line: number, friends: number) {
  const t0 = ctx.currentTime + 0.05;
  const song = SONGS[songIndex % SONGS.length];
  // Kompresor menjaga vokal dan gitar seimbang; gema dicampur sedikit.
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  comp.connect(dest);
  const dry = ctx.createGain();
  dry.connect(comp);
  const verb = ctx.createConvolver();
  verb.buffer = reverbOf(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.22;
  verb.connect(wet).connect(comp);
  const bus = ctx.createGain();
  bus.connect(dry);
  bus.connect(verb);

  // Gitar: lebih pelan dan sedikit diredam supaya vokal terdengar jelas di depan.
  const guitar = ctx.createBiquadFilter();
  guitar.type = "lowpass";
  guitar.frequency.value = 2600;
  guitar.connect(bus);
  [0, 1].forEach((bar) => {
    const notes = CHORDS[chordAt(song, line, bar)];
    for (const [step, up] of STRUM) strum(ctx, guitar, notes, t0 + (bar * 8 + step) * EIGHTH, up, 0.045 * songMix.guitar);
  });

  // Baris 9 = bagian instrumental (intro/outro): hanya gitar.
  if (line === INSTRUMENTAL) return;
  const voices = [LEAD, ...(friends & 1 ? [MALE] : []), ...(friends & 2 ? [FEMALE] : [])];
  for (const note of melodyOf(songIndex, line)) {
    const t = t0 + note.step * EIGHTH;
    const dur = note.len * EIGHTH * 0.92;
    voices.forEach((v) => singSyllable(ctx, bus, note, t, dur, { ...v, level: v.level * songMix.voice }));
  }
}

/**
 * Mainkan satu suara. `amount` = jumlah huruf untuk obrolan, atau lama mengetik (ms) untuk ketikan.
 * `pitch` = nada dasar suara tokoh saat mengobrol.
 */
export function playFoley(ctx: BaseAudioContext, kind: Foley, amount = 0, pitch = 320, out: AudioNode = ctx.destination) {
  const t = ctx.currentTime + 0.01;
  switch (kind) {
    case "doorOpen": {
      // Gagang diputar ("klek"), lalu engsel berderit saat daun pintu bergerak.
      hiss(ctx, out, "bandpass", 3200, t, 0.03, 0.12);
      tone(ctx, out, "square", 1900, 1500, t, 0.025, 0.025);
      const body = ctx.createBiquadFilter();
      body.type = "bandpass";
      body.frequency.value = 900;
      body.Q.value = 3;
      body.connect(out);
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const c0 = t + 0.08;
      // Derit tidak rata: frekuensi naik turun acak seperti engsel kering.
      osc.frequency.setValueAtTime(320, c0);
      for (let i = 1; i <= 6; i++) osc.frequency.linearRampToValueAtTime(300 + Math.random() * 160, c0 + i * 0.08);
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 31;
      depth.gain.value = 40;
      lfo.connect(depth).connect(osc.frequency);
      osc.connect(env(ctx, c0, 0.06, 0.06, 0.55)).connect(body);
      osc.start(c0);
      lfo.start(c0);
      osc.stop(c0 + 0.6);
      lfo.stop(c0 + 0.6);
      break;
    }
    case "doorClose":
      // Daun pintu kayu menutup ("duk") lalu kunci gagang terkunci ("klik").
      tone(ctx, out, "sine", 110, 48, t, 0.22, 0.3);
      hiss(ctx, out, "lowpass", 500, t, 0.12, 0.22);
      hiss(ctx, out, "bandpass", 2800, t + 0.06, 0.025, 0.1);
      tone(ctx, out, "square", 2100, 1700, t + 0.06, 0.02, 0.02);
      break;
    case "wardrobeOpen": {
      // Pintu lemari kayu: "klek" kait magnet, derit pendek, lalu gantungan baju beradu ("ting").
      hiss(ctx, out, "bandpass", 2200, t, 0.03, 0.1);
      const body = ctx.createBiquadFilter();
      body.type = "bandpass";
      body.frequency.value = 1300;
      body.Q.value = 4;
      body.connect(out);
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(520, t + 0.05);
      osc.frequency.linearRampToValueAtTime(430, t + 0.3);
      osc.connect(env(ctx, t + 0.05, 0.045, 0.04, 0.3)).connect(body);
      osc.start(t + 0.05);
      osc.stop(t + 0.4);
      [0.32, 0.4, 0.47].forEach((d, i) => tone(ctx, out, "sine", 2400 + i * 380, 2350 + i * 380, t + d, 0.25, 0.02));
      break;
    }
    case "wardrobeClose":
      // Daun lemari menutup: "tok" kayu tipis dan kait magnet.
      tone(ctx, out, "sine", 190, 90, t, 0.12, 0.2);
      hiss(ctx, out, "lowpass", 900, t, 0.06, 0.14);
      hiss(ctx, out, "bandpass", 2600, t + 0.04, 0.02, 0.08);
      break;
    case "cloth": {
      // Kain (sajadah) dibentangkan atau digulung: desis lembut yang menyapu.
      const src = ctx.createBufferSource();
      src.buffer = noiseOf(ctx);
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(600, t);
      f.frequency.linearRampToValueAtTime(2200, t + 0.35);
      src.connect(f).connect(env(ctx, t, 0.09, 0.08, 0.45)).connect(out);
      src.start(t);
      src.stop(t + 0.5);
      break;
    }
    case "tv": {
      // Suara film dari TV: gumaman orang bicara yang teredam (derau dengan naik-turun seperti suku kata).
      const src = ctx.createBufferSource();
      src.buffer = noiseOf(ctx);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 650;
      f.Q.value = 2;
      const g = ctx.createGain();
      const end = t + Math.min(6000, amount || 3000) / 1000;
      g.gain.setValueAtTime(0.0001, t);
      for (let at = t; at < end; at += 0.12 + Math.random() * 0.12) g.gain.linearRampToValueAtTime(Math.random() < 0.25 ? 0.005 : 0.03 + Math.random() * 0.03, at);
      g.gain.linearRampToValueAtTime(0.0001, end + 0.1);
      src.connect(f).connect(g).connect(out);
      src.start(t);
      src.stop(end + 0.2);
      break;
    }
    case "cheer": {
      // Sorak penonton bola dari TV: derau lebar yang membesar lalu mereda.
      const src = ctx.createBufferSource();
      src.buffer = noiseOf(ctx);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 1100;
      f.Q.value = 0.7;
      src.connect(f).connect(env(ctx, t, 0.09, 0.35, 1.8)).connect(out);
      src.start(t);
      src.stop(t + 1.9);
      break;
    }
    case "kentongan":
      // Kentongan ronda: tiga ketukan kayu berongga.
      [0, 0.28, 0.56].forEach((d) => {
        tone(ctx, out, "sine", 740, 640, t + d, 0.16, 0.22);
        tone(ctx, out, "triangle", 1480, 1300, t + d, 0.06, 0.05);
        hiss(ctx, out, "bandpass", 1800, t + d, 0.015, 0.08);
      });
      break;
    case "camera":
      // Jepretan kamera HP: dua klik pendek.
      hiss(ctx, out, "highpass", 3500, t, 0.02, 0.12);
      hiss(ctx, out, "highpass", 2500, t + 0.07, 0.03, 0.09);
      break;
    case "page": {
      // Halaman buku dibalik.
      const src = ctx.createBufferSource();
      src.buffer = noiseOf(ctx);
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.setValueAtTime(1500, t);
      f.frequency.linearRampToValueAtTime(4500, t + 0.18);
      src.connect(f).connect(env(ctx, t, 0.06, 0.03, 0.22)).connect(out);
      src.start(t);
      src.stop(t + 0.25);
      break;
    }
    case "slap":
      // Tepukan tangan (nyamuk).
      hiss(ctx, out, "bandpass", 1200, t, 0.05, 0.25);
      tone(ctx, out, "sine", 180, 90, t, 0.06, 0.12);
      break;
    case "step":
      // Langkah kaki di lantai kayu, sangat pelan.
      hiss(ctx, out, "lowpass", 380 + Math.random() * 120, t, 0.05, 0.05);
      break;
    case "fridge":
      hiss(ctx, out, "bandpass", 900, t, 0.12, 0.04);
      tone(ctx, out, "sine", 70, 60, t + 0.02, 0.3, 0.03);
      break;
    case "type": {
      // Ketukan tuts dengan jeda tak beraturan, sesekali spasi yang lebih berat.
      let at = t;
      const end = t + Math.min(4000, amount || 1500) / 1000;
      while (at < end) {
        const space = Math.random() < 0.15;
        hiss(ctx, out, "bandpass", space ? 1400 : 2600 + Math.random() * 1800, at, space ? 0.03 : 0.018, space ? 0.04 : 0.028);
        at += 0.06 + Math.random() * 0.09 + (Math.random() < 0.1 ? 0.25 : 0);
      }
      break;
    }
    case "songLine":
      // `amount` = nomor lagu x 10 + nomor baris, `pitch` = teman yang ikut bernyanyi (lihat songLine).
      songLine(ctx, out, Math.floor(amount / 10), amount % 10, pitch);
      break;
    case "game": {
      // Bunyi gim 8-bit yang pelan dari speaker PC.
      let at = t;
      const end = t + Math.min(5000, amount || 2000) / 1000;
      const scale = [72, 74, 76, 79, 81, 84];
      while (at < end) {
        const n = scale[Math.floor(Math.random() * scale.length)];
        tone(ctx, out, "square", midi(n), midi(n) * (Math.random() < 0.2 ? 1.5 : 1), at, 0.07, 0.012);
        at += 0.12 + Math.random() * 0.25;
      }
      break;
    }
    case "eat":
      for (let i = 0; i < 3; i++) hiss(ctx, out, "lowpass", 700, t + i * 0.22, 0.07, 0.05);
      break;
    case "talk": {
      // Satu blip per suku kata (perkiraan), sangat pelan.
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 1600;
      f.connect(out);
      const syllables = Math.max(2, Math.min(9, Math.round(amount / 5)));
      for (let i = 0; i < syllables; i++) {
        const p = pitch * (0.88 + Math.random() * 0.28);
        tone(ctx, f, "triangle", p, p * 0.94, t + i * 0.085, 0.06, 0.022);
      }
      break;
    }
  }
}

/* ---------- Suara obrolan bergaya gim ---------- */

/**
 * Tokoh "berbicara" dengan satu suara yang mengalir (bukan nada terpisah per suku kata):
 * satu sumber suara melewati tiga filter resonansi mulut yang bergeser halus dari vokal ke vokal,
 * dengan konsonan sebagai desis/letupan kecil, nada yang turun pelan sepanjang kalimat (naik di akhir
 * pertanyaan), dan jeda napas di koma serta titik. Mengembalikan lama bunyinya (ms).
 */
export function playBabble(ctx: BaseAudioContext, out: AudioNode, text: string, lang: "id" | "en", base: number, female: boolean, gain = 1) {
  // Pecah per frasa supaya ada jeda di koma dan titik.
  const phrases = text
    .split(/(?<=[,.!?;:])\s+/)
    .map((p) => ({ syls: syllablesOf(p, lang), end: p.trim().slice(-1) }))
    .filter((p) => p.syls.length);
  if (!phrases.length) return 0;

  const excited = text.includes("!");
  const fShift = female ? 1.17 : 1;
  const level = (excited ? 0.48 : 0.4) * gain;
  const t0 = ctx.currentTime + 0.04;

  // Sumber suara: gelombang gergaji (pita suara) + sedikit desah napas.
  const glottal = ctx.createOscillator();
  glottal.type = "sawtooth";
  const breath = ctx.createBufferSource();
  breath.buffer = noiseOf(ctx);
  breath.loop = true;
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.06;
  const source = ctx.createGain();
  glottal.connect(source);
  breath.connect(breathGain).connect(source);

  // Tiga filter resonansi mulut (formant) yang frekuensinya digeser mengikuti vokal.
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  const filters = [0, 1, 2].map((i) => {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = [5, 7, 9][i];
    const g = ctx.createGain();
    g.gain.value = [1, 0.5, 0.22][i];
    source.connect(bp).connect(g).connect(amp);
    return bp;
  });
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 3600;
  amp.connect(soften).connect(out);

  // Sedikit getaran alami pada nada.
  const jitter = ctx.createOscillator();
  const jitterDepth = ctx.createGain();
  jitter.frequency.value = 5.5;
  jitterDepth.gain.value = base * 0.012;
  jitter.connect(jitterDepth).connect(glottal.frequency);

  let t = t0;
  const total = phrases.reduce((n, p) => n + p.syls.length, 0);
  let k = 0;
  phrases.forEach((phrase, pi) => {
    const question = phrase.end === "?";
    phrase.syls.forEach((syl, i) => {
      const lastInPhrase = i === phrase.syls.length - 1;
      // Lama suku kata: 5 sampai 7 suku kata per detik, suku kata akhir frasa sedikit lebih panjang.
      const dur = (0.13 + Math.random() * 0.05) * (lastInPhrase ? 1.6 : 1);
      // Nada turun pelan sepanjang kalimat, tekanan kecil di suku kata tertentu, naik di akhir pertanyaan.
      const progress = k / Math.max(1, total - 1);
      let hz = base * (1.08 - progress * 0.16) * (i % 3 === 0 ? 1.06 : 1);
      if (lastInPhrase) hz *= question ? 1.3 : 0.9;
      glottal.frequency.linearRampToValueAtTime(hz, t + dur * 0.4);

      // Mulut bergeser ke bentuk vokal suku kata ini.
      FORMANTS[syl.vowel].forEach((f, fi) => filters[fi].frequency.setTargetAtTime(f * fShift, t, 0.025));

      // Keras-lemah: sedikit melemah di awal suku kata (konsonan), penuh di vokal.
      const dip = syl.onset === "plosive" ? 0.08 : syl.onset === "fricative" ? 0.2 : syl.onset === "soft" ? 0.45 : 0.75;
      amp.gain.setTargetAtTime(level * dip, t, 0.012);
      amp.gain.setTargetAtTime(level, t + 0.035, 0.02);
      if (syl.onset === "plosive") hiss(ctx, out, "bandpass", 2400, t + 0.02, 0.02, level * 0.18);
      if (syl.onset === "fricative") hiss(ctx, out, "highpass", 4200, t, 0.06, level * 0.12);

      t += dur;
      k++;
    });
    // Jeda napas di akhir frasa (lebih panjang di titik daripada koma).
    if (pi < phrases.length - 1) {
      amp.gain.setTargetAtTime(0.0001, t - 0.03, 0.03);
      t += phrase.end === "," ? 0.16 : 0.26;
    }
  });
  amp.gain.setTargetAtTime(0.0001, t - 0.04, 0.04);

  glottal.frequency.setValueAtTime(base * 1.08, t0);
  glottal.start(t0);
  breath.start(t0, Math.random() * 0.5);
  jitter.start(t0);
  const stop = t + 0.25;
  glottal.stop(stop);
  breath.stop(stop);
  jitter.stop(stop);
  return Math.round((t - ctx.currentTime) * 1000);
}
