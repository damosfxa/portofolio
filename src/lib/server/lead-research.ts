import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AGENT_MODEL, AgentError, addUsage, claude } from "./agent-core";

// Penemuan usaha lewat pencarian web Claude (tanpa Google Cloud), dan pembacaan website usaha secara singkat.

export type PlaceCandidate = {
  place_id: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  maps_url: string | null;
  rating: number | null;
  reviews: number | null;
  source_url: string | null;
};

const Found = z.object({
  businesses: z.array(
    z.object({
      name: z.string(),
      category: z.string().nullable(),
      address: z.string().nullable().describe("Alamat atau minimal kecamatan dan kota"),
      phone: z.string().nullable().describe("Nomor WhatsApp atau telepon yang dicantumkan publik"),
      website: z.string().nullable().describe("Website milik usaha sendiri, bukan media sosial"),
      instagram: z.string().nullable().describe("URL atau username Instagram"),
      maps_url: z.string().nullable(),
      rating: z.number().nullable(),
      reviews: z.number().int().nullable(),
      source_url: z.string().nullable().describe("Halaman tempat data ini ditemukan"),
    }),
  ),
});

const slug = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** Kunci unik untuk mencegah usaha yang sama dianalisis dua kali. */
export const leadKey = (name: string, address: string | null) => `web:${slug(name)}:${slug((address ?? "").split(",").slice(-2).join(" "))}`;

/**
 * Cari usaha nyata dengan pencarian web Claude, lalu rapikan hasilnya jadi data terstruktur.
 * Langkah 1 memakai alat pencarian; langkah 2 hanya merapikan teks hasil langkah 1.
 */
export async function discoverLeads(query: string, want: number, avoid: string[]) {
  const ai = claude();
  let usage: Anthropic.Beta.BetaUsage | null = null;

  const messages: Anthropic.Beta.BetaMessageParam[] = [{
    role: "user",
    content: `Cari ${want + 2} usaha nyata di Indonesia yang cocok dengan: "${query}".

Untuk setiap usaha kumpulkan dari sumber publik (Google Maps, direktori usaha, Instagram, website usaha): nama, kategori, alamat atau area, nomor WhatsApp/telepon yang dicantumkan publik, website milik sendiri (bila ada), Instagram, rating dan jumlah ulasan Google (bila terlihat), link Google Maps (bila ada), dan halaman sumbernya.

Aturan:
- Hanya usaha yang masih beroperasi. Utamakan usaha lokal kecil-menengah, bukan waralaba nasional atau kantor cabang perusahaan besar.
- Jangan mengarang data. Bila tidak ditemukan, tulis "tidak ditemukan".
- Lewati usaha berikut karena sudah pernah dianalisis: ${avoid.length ? avoid.slice(0, 80).join("; ") : "(belum ada)"}.

Tulis hasilnya sebagai daftar bernomor, satu usaha per nomor.`,
  }];

  let response: Anthropic.Beta.BetaMessage | null = null;
  for (let turn = 0; turn < 4; turn++) {
    response = await ai.beta.messages.create({
      model: AGENT_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5, user_location: { type: "approximate", country: "ID" } }],
      messages,
    });
    usage = addUsage(usage, response.usage);
    if (response.stop_reason !== "pause_turn") break;
    // Pencarian yang dijeda dilanjutkan dengan mengirim balik giliran asisten apa adanya.
    messages.push({ role: "assistant", content: response.content });
  }
  if (!response) throw new AgentError("Pencarian tidak berjalan.", 502);
  if (response.stop_reason === "refusal") throw new AgentError("Claude menolak pencarian ini. Coba kata kunci lain.", 502);

  const text = response.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
  if (!text) throw new AgentError("Pencarian tidak menemukan hasil. Coba kata kunci yang lebih spesifik, misalnya tambahkan nama kota.", 404);

  const parsed = await ai.beta.messages.parse({
    model: AGENT_MODEL,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(Found) },
    messages: [{
      role: "user",
      content: `Ubah daftar usaha berikut menjadi data terstruktur. Tulisan "tidak ditemukan" menjadi null. Jangan menambah usaha atau data yang tidak ada di teks.

${text}`,
    }],
  });
  usage = addUsage(usage, parsed.usage);
  const list = parsed.parsed_output?.businesses ?? [];

  const clean = (v: string | null) => (v && !/tidak ditemukan|^-$/i.test(v) ? v.trim() : null);
  const candidates: PlaceCandidate[] = list.map((b) => {
    const address = clean(b.address);
    return {
      place_id: leadKey(b.name, address),
      name: b.name.trim(),
      category: clean(b.category),
      address,
      phone: clean(b.phone),
      website: clean(b.website),
      instagram: clean(b.instagram),
      maps_url: clean(b.maps_url),
      rating: b.rating,
      reviews: b.reviews,
      source_url: clean(b.source_url),
    };
  });
  return { candidates, usage };
}

export type SiteReport = {
  url: string;
  reachable: boolean;
  /** Halaman media sosial atau marketplace, bukan website milik sendiri. */
  isSocialOnly: boolean;
  title: string | null;
  description: string | null;
  mobileFriendly: boolean | null;
  https: boolean;
  signals: string[];
  text: string;
  note?: string;
};

const SOCIAL = /(instagram\.com|facebook\.com|tiktok\.com|shopee\.|tokopedia\.|linktr\.ee|wa\.me|whatsapp\.com|bit\.ly|google\.com\/maps|business\.site)/i;

const SIGNALS: [RegExp, string][] = [
  [/wa\.me|api\.whatsapp\.com|whatsapp/i, "ada tautan WhatsApp"],
  [/booking|reservasi|pesan sekarang|book now|order now|checkout|keranjang|add to cart/i, "ada fitur pesan/booking"],
  [/<form/i, "ada formulir"],
  [/harga|price|tarif|pricelist/i, "mencantumkan harga"],
  [/wordpress|wp-content/i, "dibuat dengan WordPress"],
  [/wix\.com|wixstatic/i, "dibuat dengan Wix"],
  [/blogspot|blogger\.com/i, "memakai Blogspot"],
];

/** Baca website secara singkat dan aman: batas waktu, batas ukuran, tanpa menjalankan skrip. */
export async function readWebsite(url: string): Promise<SiteReport> {
  const base: SiteReport = { url, reachable: false, isSocialOnly: SOCIAL.test(url), title: null, description: null, mobileFriendly: null, https: url.startsWith("https://"), signals: [], text: "" };
  if (base.isSocialOnly) return { ...base, note: "Tautan mengarah ke media sosial atau marketplace, bukan website sendiri." };

  // Dua kali coba dengan jeda waktu lebih panjang dan identitas browser biasa, supaya website yang
  // sekadar lambat atau menolak bot tidak dianggap mati.
  const attempts = [
    { timeout: 12000, agent: "Mozilla/5.0 (compatible; RizkyLeadResearch/1.0; +https://rizkyrhamadani.com)" },
    { timeout: 20000, agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" },
  ];
  let res: Response | null = null;
  let lastError: unknown = null;
  for (const a of attempts) {
    try {
      res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(a.timeout), headers: { "User-Agent": a.agent, Accept: "text/html" } });
      if (res.ok || ![403, 429, 500, 502, 503, 504].includes(res.status)) break;
    } catch (e) {
      lastError = e;
      res = null;
    }
  }
  if (!res) {
    const timeout = lastError instanceof Error && lastError.name === "TimeoutError";
    return { ...base, note: `${timeout ? "Website sangat lambat merespons" : "Website belum bisa dibuka"} saat dicek otomatis (2 kali dicoba). Belum pasti mati; perlu dicek manual.` };
  }

  try {
    if (!res.ok) {
      const blocked = [403, 429].includes(res.status);
      return { ...base, note: blocked ? `Website menolak pemeriksaan otomatis (status ${res.status}); kemungkinan tetap bisa dibuka orang biasa.` : `Website membalas status ${res.status}; perlu dicek manual.` };
    }
    if (!(res.headers.get("content-type") ?? "").includes("text/html")) return { ...base, reachable: true, note: "Bukan halaman HTML." };

    const html = (await res.text()).slice(0, 400_000);
    const pick = (re: RegExp) => html.match(re)?.[1]?.replace(/\s+/g, " ").trim() || null;
    const text = html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

    return {
      ...base,
      url: res.url || url,
      https: (res.url || url).startsWith("https://"),
      reachable: true,
      title: pick(/<title[^>]*>([\s\S]*?)<\/title>/i),
      description: pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i),
      mobileFriendly: /<meta[^>]+name=["']viewport["']/i.test(html),
      signals: SIGNALS.filter(([re]) => re.test(html)).map(([, label]) => label),
      text: text.slice(0, 5000),
    };
  } catch {
    return { ...base, note: "Isi website gagal dibaca saat dicek otomatis; perlu dicek manual." };
  }
}
