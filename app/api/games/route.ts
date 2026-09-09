import { randomUUID } from "node:crypto";
import { database } from "@/lib/db";
import { isAdmin, sameOrigin } from "@/lib/admin";
import { errorResponse, gameInput, noCache, readBody } from "@/lib/game-api";
export const runtime = "nodejs";
export async function GET() {
  try {
    const sql = database();
    const games = await sql`SELECT id, name, config, version, updated_at FROM skye_game_presets ORDER BY created_at ASC LIMIT 100`;
    return Response.json({ games }, { headers: noCache });
  } catch { return errorResponse("Saved games are unavailable. Please try again.", 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Request not allowed.", 403);
  try {
    if (!await isAdmin()) return errorResponse("Only Skye can save games. Please sign in.", 401);
    const input = gameInput(await readBody(request));
    if (!input) return errorResponse("Check the game name, spaces and wheel choices.", 400);
    const sql = database();
    const games = await sql`INSERT INTO skye_game_presets (id, name, config) VALUES (${randomUUID()}, ${input.name}, ${JSON.stringify(input.config)}::jsonb) RETURNING id, name, config, version, updated_at`;
    return Response.json({ game: games[0] }, { status: 201, headers: noCache });
  } catch { return errorResponse("Your game could not be saved. Your draft is still here.", 503); }
}
