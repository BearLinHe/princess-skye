# Princess Skye

A responsive, English-language age-gate homepage built with Next.js App Router, React and TypeScript. Fonts are self-hosted. The supplied photograph is served locally with Next.js Image optimization.

## Local development

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev
```

## Validation

```sh
npm run build
npm run typecheck
```

## Vercel

Import this repository in Vercel and select the Next.js framework preset. Use the project root, the default build settings, and Node.js 22 or later. Set `DATABASE_URL` and `SKYE_ADMIN_PASSWORD_HASH` as server-side Vercel environment variables before deploying. Copy their values from the private local `.env.local`; do not commit them or use a `NEXT_PUBLIC_` prefix.

## Scope

The homepage provides an explicit 18+ self-declaration and a Playroom link. The `/games` route repeats this declaration when the current browser session has not accepted it. This is not identity or age verification. Exit replaces the homepage with `about:blank`. Search indexing is disabled while the site is in development.

### Puppy Steps

A 25-space inward-turning trail on a landscape, nine-column board with a dog token and Skye’s supplied photo under translucent spaces. Existing space IDs and saved instructions are preserved. A six-sided die advances the dog one space at a time. Rolls beyond the finish stop at space 24. Click any space to edit its title (28 characters) and instruction (400 characters), then save. Start again resets the game position while preserving custom content.

### The Wheel

2–12 editable choices, each with a label (48 characters) and a whole-number weight from 1 to 100. Sector sizes and selection probabilities use the same normalized weights. The pointer lands at the center of the selected sector. Controls are locked during movement and spinning; reduced-motion preferences are respected.

## Saved games and Skye administration

Neon PostgreSQL stores named game presets, each containing the full board and weighted wheel. Visitors can load and play saved games. Only Skye can edit or save after signing in at `/games/admin`.

Local setup:

```sh
# Fill DATABASE_URL in .env.local first.
node scripts/db-check.mjs
node scripts/db-migrate.mjs
node scripts/setup-admin.mjs
```

The setup script creates a random admin password in `.skye-admin-credentials.txt` and a salted scrypt hash in `.env.local`. Both files are ignored by Git. The raw password is never stored in PostgreSQL. Login creates a random HttpOnly session cookie; only its SHA-256 hash is stored in the database, with a seven-day expiry. Logout revokes the session. Login is limited to 30 attempts per 15-minute window across the site. Mutations check the session and request origin. Optimistic version checking prevents a stale device from overwriting newer edits.

Edit a space or wheel choice, apply the change to the draft, then use **Save game** to update the selected preset or **Save as new** to create another. **Import browser draft** recovers earlier local edits under `skye-playroom-v1`; save them online afterward. Browser storage holds an optional admin draft backup, not the shared source of truth. Play positions/results remain local and reset on reload.

Integration verification (local server on port 4317; creates and removes one temporary database record):

```sh
node scripts/test-game-storage.mjs
```

For Vercel, configure both server environment variables and redeploy. Database migrations must be run separately; production requests never create or alter tables. Do not upload `.env.local` or the credentials file.

