import "server-only";
import { readConfig } from "@/app/games/rules";
export function gameInput(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const config = readConfig(body.config);
  if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 80 || !config) return null;
  return { name: body.name.trim(), config: { spaces: config.spaces.map(s => ({ title: s.title, content: s.content })), options: config.options.map(o => ({ label: o.label, weight: o.weight })) }, version: body.version };
}
export const noCache = { "Cache-Control": "no-store" };
export const errorResponse = (message: string, status: number) => Response.json({ error: message }, { status, headers: noCache });
export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  const text = await request.text();
  if (text.length > 30000) return null;
  try { return JSON.parse(text); } catch { return null; }
}
