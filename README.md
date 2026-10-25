# Bupa Books

A responsive React + TypeScript coding-challenge application. Fetch community books on demand, group by owner age, sort alphabetically and filter hardcover editions.

## Run
Requires Node.js 22.12+ and pnpm (or npm).

```sh
pnpm install --frozen-lockfile
pnpm dev
# Open http://localhost:5173
```

```sh
pnpm test
pnpm build
pnpm start
# Production build served at http://localhost:3001
```

For npm, use `npm install`, `npm run dev`, `npm test`, `npm run build`, `npm start`. pnpm-lock.yaml is the canonical reproducible lockfile.

## Architecture
- `src/books.ts`: runtime validation, schema normalization, grouping/filtering/sorting and API client.
- `src/App.tsx`: accessible React UI with explicit initial, loading, success, empty and failure states.
- `server/app.mjs`: Express serves the built app and exposes a single fixed upstream proxy route.
- Vite proxies `/api` to Express during development. The same endpoint is provided by Express in production; no development-only CORS workaround is needed.

The live API returned HTTP 200 during development with lowercase `name` / `books`, unlike the provided uppercase `NAME` / `BOOKS` example. Both are accepted; lowercase takes precedence when both are supplied. Browser-origin permission was not advertised in the inspected response, so a same-origin backend is included. No credentials, paging, database or Power Platform license is required.

## Behaviour and assumptions
- Get Books fetches a fresh snapshot. Loading disables repeat requests. Hardcover changes use the last successful snapshot and make no network call.
- Whole-number ages >=18 are Adults; 0–17 are Children. Missing/invalid ages, invalid titles/types or malformed records fail the whole refresh visibly rather than silently omit books. Previous results survive a failed refresh.
- Missing/null `books` is empty. Missing/null type is shown as “Unspecified format” and is excluded from hardcover results.
- Titles are trimmed; alphabetical ordering uses explicit English locale with case/accent-insensitive comparison. Equal names retain source order. Duplicates are preserved across and within owners.
- Hardcover comparison is case-insensitive and ignores surrounding whitespace.
- Both groups remain visible after successful loading even when empty. Filtered headings match the requested text exactly.
- At <=600px shelves stack; above 600px they form two columns. Primary blue is #0079c8. No reference screenshots were supplied.
- No automatic sample-data fallback: an unavailable API is shown as an error, not disguised by mock results.
- UI uses English for the assessment; code comments and delivery documentation are English.

## Reliability, privacy and deployment
The server uses a fixed HTTPS upstream (not an open proxy), a 10-second upstream timeout, a 2 MiB response limit, safe error responses, and no-store API caching. It does not forward upstream cookies or log owner payloads. The client has a 15-second request deadline and cancels on unmount.

Deploy on a Node-capable host/container: install dependencies, run `pnpm build`, then `pnpm start`. Configure `HOST=0.0.0.0` and the host-provided `PORT` when required. The server defaults to loopback for local use. A static-only host cannot run the included proxy: supply an equivalent serverless route for `/api/bookowners` first. Enable HTTPS at the hosting edge. Before public production, add edge rate limiting, availability monitoring and appropriate security headers/CSP, and review dependency/security policy. Web fonts are fetched from Google Fonts; system-font fallbacks work offline. Self-host fonts if external requests are restricted.

## Verification
Automated tests cover 17/18 boundary, mixed schemas, case-insensitive sorting, duplicate preservation, hardcover filtering, malformed data, empty groups, on-demand fetch, failure/retry and retaining previous results. Proxy tests cover fixed routing, stripping cookies and safe upstream errors. `pnpm build` includes strict TypeScript checking.

Manual checklist: run live API fetch; toggle and reset filter; refresh; inspect 375, 600, 601 and desktop widths; navigate with keyboard; inspect long titles and empty/error states; verify the production `/api/bookowners` endpoint on the deployment host.

## Submission
Commit this folder (excluding node_modules and dist) to GitHub or Bitbucket. Include this README and the lockfile. For a private repository, grant the recruitment contact access before sharing the repository URL.

### Verified locally (25 October 2026)
- 14 automated tests passed across domain, UI and proxy layers.
- Strict TypeScript check and Vite production build passed.
- Production server fetched the real API through the browser: 10 books (6 adult, 4 child); hardcover filter returned 6 (4 adult, 2 child) with correct headings.
- Browser layout checked at 375, 600, 601 and 1280px: single column at <=600, two columns above, with no horizontal page overflow.
- Hosted deployment, full screen-reader audit and public-load testing remain unverified.
