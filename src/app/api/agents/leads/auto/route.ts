import { createClient } from "@supabase/supabase-js";
import { assertBudget, errorResponse, logRun } from "@/lib/server/agent-core";
import { discoverLeads, readWebsite } from "@/lib/server/lead-research";
import { analyzeLead } from "@/lib/server/lead-agent";

// Agent Cari Klien otomatis (mingguan, lewat Vercel Cron). Hanya menyiapkan calon dan draf pesan.
// Tidak pernah mengirim pesan. Dipanggil Vercel dengan header Authorization: Bearer CRON_SECRET.
export const maxDuration = 300;

const KATA = ["toko bahan bangunan", "distributor sembako", "jasa kebersihan", "bimbel", "percetakan", "ekspedisi kecil"];
const KOTA = ["Yogyakarta", "Sleman", "Solo", "Semarang", "Surabaya"];
const PER_KOMBINASI = 3; // jumlah usaha yang dianalisis per kombinasi kata kunci dan kota
const MIN_ULASAN = 20;

// Tiga kombinasi per minggu. Kata kunci berputar supaya semua tercakup dalam dua minggu.
function kombinasiMinggu(): string[] {
  const minggu = Math.floor(Date.now() / (7 * 86400000));
  return [0, 1, 2].map((i) => `${KATA[(minggu * 3 + i) % KATA.length]} ${KOTA[(minggu + i) % KOTA.length]}`);
}

export async function GET(req: Request) {
  try {
    const rahasia = process.env.CRON_SECRET;
    if (!rahasia || req.headers.get("authorization") !== `Bearer ${rahasia}`) {
      return Response.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: known } = await db.from("leads").select("place_id, name");
    const knownIds = new Set((known ?? []).map((r) => r.place_id));
    const knownNames = new Set((known ?? []).map((r) => String(r.name).toLowerCase()));

    const ringkasan: { query: string; ditemukan: number; disimpan: number; catatan?: string }[] = [];

    for (const query of kombinasiMinggu()) {
      try {
        await assertBudget(db, 0.5 + 0.06 * PER_KOMBINASI);
        const { candidates, usage } = await discoverLeads(query, 10, [...knownNames]);
        await logRun(db, "lead-search-auto", usage, { query, found: candidates.length });

        const baru = candidates
          .filter((c) => !knownIds.has(c.place_id) && !knownNames.has(c.name.toLowerCase()))
          // Jumlah ulasan yang tidak diketahui tetap dianalisis; yang jelas sepi dibuang.
          .filter((c) => c.reviews == null || c.reviews >= MIN_ULASAN)
          .slice(0, PER_KOMBINASI);

        let disimpan = 0;
        for (const candidate of baru) {
          await assertBudget(db, 0.08);
          const site = candidate.website ? await readWebsite(candidate.website) : null;
          const { analysis, usage: u, model } = await analyzeLead(candidate, site);
          await logRun(db, "lead-analyze-auto", u, { place: candidate.name, fallback: model }, model);

          const followUp = new Date(Date.now() + analysis.follow_up_days * 86400000).toISOString().slice(0, 10);
          const { error } = await db.from("leads").upsert(
            [{
              ...candidate,
              query,
              fit_score: analysis.fit_score,
              fit_reason: analysis.fit_reason,
              observations: analysis.observations,
              problem: analysis.problem,
              offer: analysis.offer,
              message: analysis.message,
              status: analysis.fit_score <= 7 ? "lewati" : "baru",
              next_follow_up: followUp,
              updated_at: new Date().toISOString(),
            }],
            { onConflict: "place_id" },
          );
          if (error) throw new Error("Gagal menyimpan: " + error.message);

          knownIds.add(candidate.place_id);
          knownNames.add(candidate.name.toLowerCase());
          disimpan++;
        }
        ringkasan.push({ query, ditemukan: candidates.length, disimpan });
      } catch (e) {
        // Kalau budget habis atau satu pencarian gagal, lanjutkan ke kombinasi berikutnya, lalu laporkan.
        ringkasan.push({ query, ditemukan: 0, disimpan: 0, catatan: e instanceof Error ? e.message : "gagal" });
      }
    }

    console.log("lead-auto ringkasan", JSON.stringify(ringkasan));
    return Response.json({ ok: true, minggu: ringkasan });
  } catch (e) {
    return errorResponse(e);
  }
}
