import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { neon } from '@neondatabase/serverless';
loadEnvConfig(process.cwd());
try {
  if (!process.env.DATABASE_URL) throw new Error('Missing configuration');
  const sql = neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(15000) } });
  const rows = await sql`SELECT 1 AS connected`;
  console.log(rows[0]?.connected === 1 ? 'Database connection verified.' : 'Unexpected database response.');
} catch {
  console.error('Database connection failed. Check network access and DATABASE_URL.');
  process.exitCode = 1;
}
