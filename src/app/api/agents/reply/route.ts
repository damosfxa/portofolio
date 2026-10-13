import { AgentError, assertBudget, errorResponse, logRun, requireAdmin } from "@/lib/server/agent-core";
import { suggestReply } from "@/lib/server/reply-agent";

// Agent Balas Chat: chat klien yang ditempel di Admin → 2 pilihan balasan siap kirim.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const db = await requireAdmin(req);
    const { chat, note, leadId } = (await req.json()) as { chat?: string; note?: string; leadId?: number | null };
    const text = chat?.trim() ?? "";
    if (!text) throw new AgentError("Tempel dulu chat dari klien.");
    if (text.length > 8000) throw new AgentError("Chat terlalu panjang. Salin beberapa pesan terakhir saja.");
    await assertBudget(db, 0.05);

    const [lead, rules, templates] = await Promise.all([
      leadId ? db.from("leads").select("name, category, address, message").eq("id", leadId).maybeSingle().then((r) => r.data) : null,
      db.from("admin_settings").select("value").eq("key", "reply_rules").maybeSingle().then((r) => (Array.isArray(r.data?.value) ? (r.data.value as string[]) : [])),
      db.from("reply_templates").select("title, body").order("grp").order("sort").then((r) => r.data ?? []),
    ]);

    const { suggestion, usage, model } = await suggestReply({ chat: text, note: note?.trim() || undefined, lead, rules, templates });
    await logRun(db, "reply", usage, { lead: lead?.name ?? null, fallback: model }, model);
    return Response.json({ suggestion });
  } catch (e) {
    return errorResponse(e);
  }
}
