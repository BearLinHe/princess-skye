import { createSession, deleteSession, isAdmin, sameOrigin, verifyPassword } from "@/lib/admin";
import { database } from "@/lib/db";
import { errorResponse, noCache, readBody } from "@/lib/game-api";
export const runtime = "nodejs";
export async function GET() {
  try { return Response.json({ admin: await isAdmin() }, { headers: noCache }); }
  catch { return errorResponse("Unable to check your session.", 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Request not allowed.", 403);
  const body = await readBody(request);
  if (typeof body?.password !== "string" || !body.password || body.password.length > 256) return errorResponse("Enter your password.", 400);
  if (!process.env.SKYE_ADMIN_PASSWORD_HASH) return errorResponse("Admin access is not configured yet.", 503);
  try {
    const sql = database(); const bucket = Math.floor(Date.now() / 900000);
    const limits = await sql`INSERT INTO skye_login_limits (bucket, attempts) VALUES (${bucket}, 1) ON CONFLICT (bucket) DO UPDATE SET attempts = skye_login_limits.attempts + 1 RETURNING attempts`;
    if (limits[0].attempts > 30) return errorResponse("Too many attempts. Please try again in 15 minutes.", 429);
    if (!await verifyPassword(body.password)) return errorResponse("Incorrect password.", 401);
    await createSession();
    await sql`DELETE FROM skye_login_limits WHERE bucket < ${bucket - 1}`;
    return Response.json({ admin: true }, { headers: noCache });
  } catch { return errorResponse("Sign-in is unavailable. Please try again.", 503); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Request not allowed.", 403);
  try { await deleteSession(); return Response.json({ admin: false }, { headers: noCache }); }
  catch { return errorResponse("Unable to sign out. Try again.", 503); }
}
