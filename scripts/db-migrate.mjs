import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
nextEnv.loadEnvConfig(process.cwd());
try {
  const sql = neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(15000) } });
  const source = await readFile(new URL('../db/001-playroom.sql', import.meta.url), 'utf8');
  await sql.transaction(source.split(';').map(s => s.trim()).filter(Boolean).map(s => sql.query(s)));
  console.log('Playroom tables are ready.');
} catch { console.error('Database setup failed. Check connectivity and database permissions.'); process.exitCode = 1; }
