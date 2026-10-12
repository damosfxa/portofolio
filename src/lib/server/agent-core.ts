import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Fondasi semua agent: memastikan yang memanggil adalah admin, klien Claude, dan pencatatan biaya.

export const AGENT_MODEL = "claude-opus-5-5";

// Harga Claude Opus 5.5 per 1 juta token (USD). Penulisan cache 5 menit = 1,25× harga input.
// Pencarian web: $10 per 1.000 pencarian.
const PRICE = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2, webSearch: 0.01 };

export class AgentError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

let anthropic: Anthropic | null = null;
export function claude() {
  if (!process.env.ANTHROPIC_API_KEY) throw new AgentError("ANTHROPIC_API_KEY belum diisi di environment server.", 500);
  anthropic ??= new Anthropic();
  return anthropic;
}

/**
 * Memastikan permintaan datang dari akun admin yang sedang login.
 * Klien Supabase yang dikembalikan memakai token admin itu, jadi aturan RLS tetap berlaku.
 */
export async function requireAdmin(req: Request): Promise<SupabaseClient> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new AgentError("Belum login.", 401);
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!admins.length) throw new AgentError("ADMIN_EMAILS belum diisi di environment server.", 500);

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user?.email || !admins.includes(data.user.email.toLowerCase())) throw new AgentError("Akses ditolak.", 403);
  return db;
}

type Usage = Anthropic.Beta.BetaUsage;

export function costOf(usage: Usage) {
  const m = 1_000_000;
  return (
    (usage.input_tokens * PRICE.input) / m +
    (usage.output_tokens * PRICE.output) / m +
    ((usage.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite) / m +
    ((usage.cache_read_input_tokens ?? 0) * PRICE.cacheRead) / m +
    (usage.server_tool_use?.web_search_requests ?? 0) * PRICE.webSearch
  );
}

/** Jumlahkan pemakaian beberapa permintaan (misalnya saat pencarian dilanjutkan setelah pause_turn). */
export function addUsage(a: Usage | null, b: Usage): Usage {
  if (!a) return b;
  return {
    ...b,
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens: (a.cache_creation_input_tokens ?? 0) + (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens: (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
    server_tool_use: {
      web_fetch_requests: (a.server_tool_use?.web_fetch_requests ?? 0) + (b.server_tool_use?.web_fetch_requests ?? 0),
      web_search_requests: (a.server_tool_use?.web_search_requests ?? 0) + (b.server_tool_use?.web_search_requests ?? 0),
    },
  };
}

const monthStart = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
};

/** Total biaya Claude bulan ini dan batasnya (admin_settings → agent_budget.monthlyUsd). */
export async function budgetStatus(db: SupabaseClient) {
  const [{ data: runs }, { data: setting }] = await Promise.all([
    db.from("agent_runs").select("cost_usd").gte("created_at", monthStart()),
    db.from("admin_settings").select("value").eq("key", "agent_budget").maybeSingle(),
  ]);
  const spent = (runs ?? []).reduce((a, r) => a + Number(r.cost_usd || 0), 0);
  const limit = Number((setting?.value as { monthlyUsd?: number } | null)?.monthlyUsd ?? 15);
  return { spent, limit, remaining: Math.max(0, limit - spent) };
}

/** Hentikan agent bila budget bulan ini tidak cukup untuk satu langkah lagi. */
export async function assertBudget(db: SupabaseClient, needUsd: number) {
  const b = await budgetStatus(db);
  if (b.remaining < needUsd) {
    throw new AgentError(`Budget agent bulan ini habis ($${b.spent.toFixed(2)} dari $${b.limit.toFixed(2)}). Naikkan batasnya di halaman agent bila memang perlu.`, 402);
  }
  return b;
}

export async function logRun(db: SupabaseClient, agent: string, usage: Usage | null, meta: Record<string, unknown> = {}, model = AGENT_MODEL) {
  const { error } = await db.from("agent_runs").insert([{
    agent,
    model,
    input_tokens: usage?.input_tokens ?? 0,
    output_tokens: usage?.output_tokens ?? 0,
    cache_read: usage?.cache_read_input_tokens ?? 0,
    cache_write: usage?.cache_creation_input_tokens ?? 0,
    web_searches: usage?.server_tool_use?.web_search_requests ?? 0,
    cost_usd: usage ? costOf(usage) : 0,
    meta,
  }]);
  // Biaya tetap terjadi walau pencatatan gagal; tampilkan di log server supaya tidak hilang diam-diam.
  if (error) console.error(`Gagal mencatat biaya agent "${agent}":`, error.message);
}

/** Ubah error apa pun jadi respons JSON yang jelas untuk halaman admin. */
export function errorResponse(e: unknown) {
  if (e instanceof AgentError) return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof Anthropic.AuthenticationError) return Response.json({ error: "API key Anthropic tidak valid." }, { status: 500 });
  if (e instanceof Anthropic.RateLimitError) return Response.json({ error: "Batas permintaan Claude tercapai. Coba lagi sebentar lagi." }, { status: 429 });
  if (e instanceof Anthropic.APIError) return Response.json({ error: `Claude API error ${e.status}: ${e.message}` }, { status: 502 });
  console.error(e);
  return Response.json({ error: e instanceof Error ? e.message : "Terjadi kesalahan." }, { status: 500 });
}
