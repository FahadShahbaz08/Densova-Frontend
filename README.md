# Densova Frontend

The Densova storefront and admin application, migrated from Vite/React Router to Next.js App Router using normal JavaScript.

## Local development

1. Copy `.env.example` to `.env.local` and update the URLs if needed.
2. Install dependencies with `npm install`.
3. Start development with `npm run dev`.
4. Open `http://localhost:3000`.

## Commands

- `npm run dev` — local Next.js development server
- `npm run build` — optimized production build
- `npm start` — run the production build
- `npm run lint` — ESLint validation
- `npm test` — Vitest unit tests

## SEO and discovery

Next.js generates route metadata, canonical URLs, Open Graph and Twitter fields, JSON-LD for the organization and products, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, and `/llms.txt`. Product URLs are added to the sitemap from the public API. Checkout, account, order-confirmation, and admin URLs are marked `noindex` and blocked from crawler discovery.

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin and `NEXT_PUBLIC_API_URL` to the backend API base URL before deploying.

## Deployment

This is a server-rendered Next.js application. Deploy it to a Node.js-compatible host and run `npm run build` followed by `npm start`. The previous Apache SPA rewrite file is intentionally removed because it would route Next.js asset and metadata requests incorrectly.
