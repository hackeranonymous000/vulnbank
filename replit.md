# VulnBank — fintech demo

**Developed by Alexis.** A fictional neobank: accounts, cards, transfers and an admin console,
built as a self-contained demo that runs entirely on localhost with no external services.

## Run it

```bash
# Node 24 is bundled in .tools/node (gitignored)
cd Fintech-Testbed
./.tools/node/node.exe ./.tools/node/node_modules/pnpm/bin/pnpm.cjs dev
```

- **Port 8822** serves the React app and proxies `/api` to the API server on **8823**, so the
  whole product is reachable from a single origin.
- `pnpm dev:api` and `pnpm dev:web` run the halves separately.
- The database is a local SQLite file at `artifacts/api-server/.data/vulnbank.db`; it is created
  and seeded on first boot. Delete that file to reset the demo data.
- `pnpm --filter @workspace/api-server run build` bundles the API with esbuild.
- `pnpm run typecheck` type-checks the whole workspace.

If `pnpm` is on your PATH, plain `pnpm dev` works too.

### Accounts

Sign up at `/register` — every new customer gets a checking account, a virtual card and a
starting balance. One operator account (`admin`) is seeded on first boot.

## Stack

- pnpm workspace monorepo, TypeScript 5.9, Node 24
- API: Express 5 + `node:sqlite` (built into Node), pino logging
- Frontend: React 19 + Vite 7 + TailwindCSS 4 + Recharts + TanStack Query + wouter
- No external database, no Docker, no cloud dependencies

## Layout

- `artifacts/fintech-app` — React app (all pages and the core flow)
- `artifacts/api-server` — Express API, one router per feature area
- `lib/db` — SQLite connection, schema types and seed data
- `scripts/dev.mjs` — starts both processes on 8822/8823

## Pages

`/` sign in · `/register` onboarding · `/dashboard` portfolio + charts · `/accounts` account
cards · `/accounts/:id` ledger · `/transactions` searchable ledger · `/transfer` money movement ·
`/cards` virtual cards · `/profile` contact details and credentials · `/admin` operations console.

## Notes for developers

- Server code should use `req.log` or the `logger` singleton, never `console.log`.
- Auth tokens are kept in `localStorage` as `vulnbank_token`.
- `pnpm-workspace.yaml` excludes most platform-specific optional dependencies; the Windows
  binaries for rollup / tailwind oxide / lightningcss are pinned in the root `devDependencies`
  so the app runs on this machine.
