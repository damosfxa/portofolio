import { getAudio } from "@/lib/audio";

// Musik lo-fi yang disusun langsung di browser dengan WebAudio (tanpa file audio).
// Akor, bass, drum, dan melodi acak dijadwalkan sedikit di depan waktu supaya tetap rapi.

const BPM = 74;
const STEP = 60 / BPM / 4; // durasi 1/16
const LOOKAHEAD = 0.15;
const TICK_MS = 30;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Fmaj7, Em7, Dm7, Cmaj7 (nada MIDI), satu akor per bar.
const CHORDS = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60],
  [48, 52, 55, 59],
];
const BASS = [41, 40, 38, 36];
// Nada melodi dari skala C mayor pentatonik, oktaf atas.
const MELODY = [72, 74, 76, 79, 81, 84];

export class Lofi {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;

  get playing() {
    return this.timer !== null;
  }

  start() {
    if (this.timer !== null) return;
    if (!this.ctx) this.setup();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") ctx.resume();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.22, ctx.currentTime, 0.4);
    this.startCrackle();
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), TICK_MS);
  }

  stop() {
    if (this.timer === null || !this.ctx) return;
    window.clearInterval(this.timer);
    this.timer = null;
    // Turunkan volume perlahan, lalu hentikan desis piringan.
    this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    const crackle = this.crackle;
    this.crackle = null;
    window.setTimeout(() => crackle?.stop(), 1200);
  }

  private setup() {
    const { ctx, music } = getAudio();
    const master = ctx.createGain();
    master.gain.value = 0;
    // Filter low-pass memberi kesan hangat dan sedikit "teredam" khas lo-fi.
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2200;
    master.connect(lowpass).connect(music);

    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.noise = noise;
  }

  private startCrackle() {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0008 ? Math.random() * 0.6 : (Math.random() * 2 - 1) * 0.015;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    src.connect(g).connect(this.master!);
    src.start();
    this.crackle = src;
  }

  private schedule() {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime);
      // Swing: ketukan 1/16 genap sedikit diperpanjang.
      this.nextTime += STEP * (this.step % 2 === 0 ? 1.12 : 0.88);
      this.step = (this.step + 1) % 64;
    }
  }

  private playStep(step: number, t: number) {
    const bar = Math.floor(step / 16);
    const inBar = step % 16;

    if (inBar === 0) {
      CHORDS[bar].forEach((n, i) => this.keys(midi(n), t + i * 0.012, STEP * 15));
      this.bass(midi(BASS[bar]), t, STEP * 6);
    }
    if (inBar === 8) this.bass(midi(BASS[bar] + 7), t, STEP * 4);

    if (inBar === 0 || inBar === 10) this.kick(t);
    if (inBar === 4 || inBar === 12) this.snare(t);
    if (inBar % 2 === 0) this.hat(t, inBar % 4 === 0 ? 0.05 : 0.03);

    // Melodi jarang dan acak, supaya tidak terdengar berulang.
    if (inBar % 4 === 2 && Math.random() < 0.35) {
      const note = MELODY[Math.floor(Math.random() * MELODY.length)];
      this.keys(midi(note), t, STEP * 3, 0.05);
    }
  }

  private keys(freq: number, t: number, dur: number, level = 0.06) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc2.type = "sine";
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2.001;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    osc.connect(g);
    osc2.connect(g2).connect(g);
    g.connect(this.master!);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
  }

  private bass(freq: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, level: number, dur: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.02);
  }

  private snare(t: number) {
    this.noiseHit(t, "bandpass", 1800, 0.16, 0.16);
  }

  private hat(t: number, level: number) {
    this.noiseHit(t, "highpass", 7000, level, 0.04);
  }
}
