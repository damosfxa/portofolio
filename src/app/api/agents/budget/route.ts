import { budgetStatus, errorResponse, requireAdmin } from "@/lib/server/agent-core";

// Ringkasan pemakaian biaya agent bulan ini.
export async function GET(req: Request) {
  try {
    const db = await requireAdmin(req);
    return Response.json(await budgetStatus(db));
  } catch (e) {
    return errorResponse(e);
  }
}
