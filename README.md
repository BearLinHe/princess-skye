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

Import this repository in Vercel and select the Next.js framework preset. Use the project root, the default build settings, and Node.js 22 or later. No environment variables are required.

## Scope

Enter is an explicit 18+ self-declaration and reveals a welcome / coming-soon state. It is not identity or age verification. Exit replaces the current page with `about:blank`. No destination pages or private content exist yet. The gate resets on refresh. Search indexing is disabled while the site is in development; update `app/layout.tsx` when ready to launch.
