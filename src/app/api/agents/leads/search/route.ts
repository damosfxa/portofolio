import { assertBudget, errorResponse, logRun, requireAdmin } from "@/lib/server/agent-core";
import { discoverLeads } from "@/lib/server/lead-research";

// Langkah 1 Agent Cari Klien: temukan usaha lewat pencarian web, buang yang sudah pernah dianalisis.
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const db = await requireAdmin(req);
    const { query, limit } = (await req.json()) as { query?: string; limit?: number };
    const q = query?.trim();
    if (!q || q.length < 3) return Response.json({ error: "Tulis kata kunci, misalnya: rental motor Sleman" }, { status: 400 });
    const want = Math.min(10, Math.max(1, Number(limit) || 5));
    await assertBudget(db, 0.5 + 0.06 * want);

    const { data: known } = await db.from("leads").select("place_id, name");
    const knownIds = new Set((known ?? []).map((r) => r.place_id));
    const knownNames = new Set((known ?? []).map((r) => String(r.name).toLowerCase()));

    const { candidates, usage } = await discoverLeads(q, want, (known ?? []).map((r) => r.name));
    const unseen = candidates.filter((c) => !knownIds.has(c.place_id) && !knownNames.has(c.name.toLowerCase()));
    // Hanya usaha yang ramai (minimal 20 ulasan Google) yang dianalisis, supaya budget tidak habis untuk usaha kecil yang tidak aktif.
    const fresh = unseen.filter((c) => (c.reviews ?? 0) >= 20).slice(0, want);
    await logRun(db, "lead-search", usage, { query: q, found: candidates.length, fresh: fresh.length });

    return Response.json({ candidates: fresh, found: candidates.length, known: candidates.length - unseen.length });
  } catch (e) {
    return errorResponse(e);
  }
}
