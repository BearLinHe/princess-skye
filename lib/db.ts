import "server-only";
import { neon } from "@neondatabase/serverless";

export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Database is not configured");
  return neon(url, { fetchOptions: { signal: AbortSignal.timeout(10000) } });
}
