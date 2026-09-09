import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { database } from "./db";

const derive = promisify(scrypt);
export const SESSION_COOKIE = "skye_admin";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const sql = database();
  const rows = await sql`SELECT 1 FROM skye_admin_sessions WHERE token_hash = ${tokenHash(token)} AND expires_at > now()`;
  return rows.length === 1;
}
export async function verifyPassword(password: string) {
  const stored = process.env.SKYE_ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  const [salt, expected] = stored.split(":");
  if (!salt || !expected || !/^[a-f0-9]{128}$/.test(expected)) return false;
  const actual = await derive(password, salt, 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const sql = database();
  const jar = await cookies();
  const old = jar.get(SESSION_COOKIE)?.value;
  if (old) await sql`DELETE FROM skye_admin_sessions WHERE token_hash = ${tokenHash(old)}`;
  await sql`DELETE FROM skye_admin_sessions WHERE expires_at <= now()`;
  await sql`INSERT INTO skye_admin_sessions (token_hash, expires_at) VALUES (${tokenHash(token)}, now() + interval '7 days')`;
  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 604800 });
}
export async function deleteSession() {
  const jar = await cookies(); const token = jar.get(SESSION_COOKIE)?.value;
  if (token) { const sql = database(); await sql`DELETE FROM skye_admin_sessions WHERE token_hash = ${tokenHash(token)}`; }
  jar.delete(SESSION_COOKIE);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.host === request.headers.get("host");
  } catch { return false; }
}
