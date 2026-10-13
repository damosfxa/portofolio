import { assertBudget, errorResponse, logRun, requireAdmin } from "@/lib/server/agent-core";
import { readWebsite, type PlaceCandidate } from "@/lib/server/lead-research";
import { analyzeLead } from "@/lib/server/lead-agent";

// Langkah 2 Agent Cari Klien: baca website usaha, analisis dengan Claude, simpan sebagai calon klien.
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const db = await requireAdmin(req);
    const { candidate, query } = (await req.json()) as { candidate?: PlaceCandidate; query?: string };
    if (!candidate?.place_id || !candidate.name) return Response.json({ error: "Data usaha tidak lengkap." }, { status: 400 });
    await assertBudget(db, 0.08);

    const site = candidate.website ? await readWebsite(candidate.website) : null;
    const { analysis, usage, model } = await analyzeLead(candidate, site);
    await logRun(db, "lead-analyze", usage, { place: candidate.name, fallback: model }, model);

    const followUp = new Date(Date.now() + analysis.follow_up_days * 86400000).toISOString().slice(0, 10);
    const { data, error } = await db
      .from("leads")
      .upsert(
        [{
          ...candidate,
          query: query ?? null,
          fit_score: analysis.fit_score,
          fit_reason: analysis.fit_reason,
          observations: analysis.observations,
          problem: analysis.problem,
          offer: analysis.offer,
          message: analysis.message,
          // Skor 6 ke bawah langsung disembunyikan (tab Dilewati), tetap diingat supaya tidak dianalisis ulang.
          status: analysis.fit_score <= 6 ? "lewati" : "baru",
          next_follow_up: followUp,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "place_id" },
      )
      .select()
      .single();
    if (error) throw new Error("Gagal menyimpan calon klien: " + error.message);

    return Response.json({ lead: data });
  } catch (e) {
    return errorResponse(e);
  }
}
