import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const file = '.env.local';
const env = readFileSync(file, 'utf8');
if (/^SKYE_ADMIN_PASSWORD_HASH=/m.test(env)) {
  console.log('Admin access already configured.');
} else {
  const password = randomBytes(18).toString('base64url');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  writeFileSync(file, `${env.trimEnd()}\nSKYE_ADMIN_PASSWORD_HASH=${salt}:${hash}\n`, { mode: 0o600 });
  writeFileSync('.skye-admin-credentials.txt', `Skye private admin login\n\nURL: /games/admin\nPassword: ${password}\n\nKeep this password private.\nFor Vercel, copy DATABASE_URL and SKYE_ADMIN_PASSWORD_HASH from .env.local into project environment variables.\n`, { mode: 0o600 });
  console.log('Admin password created in the private local credentials file.');
}
