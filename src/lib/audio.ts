// Jalur audio bersama untuk seluruh halaman: semua suara melewati penguat "musik" atau "efek",
// lalu limiter, baru ke speaker. Volume masing-masing bisa diatur 0 sampai 200% (0 sampai 2).

/** "voice" = suara obrolan (Web Speech API), maksimal 100% karena dibatasi browser. */
export type Channel = "music" | "sfx" | "voice";

type Graph = { ctx: AudioContext; music: GainNode; sfx: GainNode; voice: GainNode };

const KEYS: Record<Channel, string> = { music: "rr_vol_music", sfx: "rr_vol_sfx", voice: "rr_vol_voice" };
let graph: Graph | null = null;

export function readVolume(ch: Channel): number {
  try {
    const v = parseFloat(localStorage.getItem(KEYS[ch]) ?? "");
    if (Number.isFinite(v)) return Math.min(2, Math.max(0, v));
  } catch {}
  return 1;
}

/** Buat (sekali) AudioContext dan jalurnya. Dipanggil saat ada interaksi pengunjung. */
export function getAudio(): Graph {
  if (graph) return graph;
  const ctx = new AudioContext();
  // Limiter: menjaga suara tetap bersih walau volume dinaikkan sampai 200%.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.15;
  limiter.connect(ctx.destination);
  const music = ctx.createGain();
  const sfx = ctx.createGain();
  // Suara obrolan bergaya gim (dipakai bila perangkat tidak punya suara natural).
  const voice = ctx.createGain();
  music.gain.value = readVolume("music");
  sfx.gain.value = readVolume("sfx");
  voice.gain.value = readVolume("voice");
  music.connect(limiter);
  sfx.connect(limiter);
  voice.connect(limiter);
  graph = { ctx, music, sfx, voice };
  return graph;
}

/** Ubah volume (0 sampai 2) dan simpan untuk kunjungan berikutnya. */
export function setVolume(ch: Channel, value: number) {
  const v = Math.min(2, Math.max(0, value));
  try {
    localStorage.setItem(KEYS[ch], String(v));
  } catch {}
  if (graph) graph[ch].gain.setTargetAtTime(v, graph.ctx.currentTime, 0.05);
}

export function audioReady() {
  return graph !== null && graph.ctx.state === "running";
}
