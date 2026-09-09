import { database } from "@/lib/db";
import { isAdmin, sameOrigin } from "@/lib/admin";
import { errorResponse, gameInput, noCache, readBody } from "@/lib/game-api";
export const runtime = "nodejs";
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return errorResponse("Request not allowed.", 403);
  try {
    if (!await isAdmin()) return errorResponse("Only Skye can save games. Please sign in.", 401);
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/i.test(id)) return errorResponse("Invalid game.", 400);
    const input = gameInput(await readBody(request));
    if (!input || !Number.isInteger(input.version) || Number(input.version) < 1) return errorResponse("Check your game settings.", 400);
    const sql = database();
    const games = await sql`UPDATE skye_game_presets SET name = ${input.name}, config = ${JSON.stringify(input.config)}::jsonb, version = version + 1, updated_at = now() WHERE id = ${id}::uuid AND version = ${input.version as number} RETURNING id, name, config, version, updated_at`;
    if (!games.length) return errorResponse("This game changed on another device. Save as a new game to keep your draft, or reload the saved version.", 409);
    return Response.json({ game: games[0] }, { headers: noCache });
  } catch { return errorResponse("Your game could not be saved. Your draft is still here.", 503); }
}
