# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains VulnBank — an intentionally vulnerable fintech web app for security testing and education.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui

## Artifacts

### fintech-app (react-vite, previewPath: /)
VulnBank — a fictional neobank app intentionally vulnerable for security testing. Dark navy/teal design.

Pages:
- `/` — Login page (with test credential autofill hints)
- `/register` — Registration
- `/dashboard` — Dashboard with balance, accounts, recent transactions
- `/accounts` — Account list
- `/accounts/:accountId` — Account detail with transactions
- `/transactions` — Full transaction list (SQL injection via search field)
- `/transfer` — Transfer money between accounts
- `/profile` — User profile (IDOR vulnerable)
- `/profile/:userId` — View any user's profile by ID (IDOR)
- `/admin` — Admin panel (broken access control — no role check); includes stats, user management, audit log (XSS), all transactions, SSRF tester, CVE reference

### api-server (Express API, previewPath: /api)
Backend REST API serving all fintech endpoints.

## DB Schema

Tables:
- `users` — id, username, email, full_name, password_hash (SHA-256, no salt), role, phone, address
- `accounts` — id, user_id, type, balance, account_number, routing_number, currency
- `transactions` — id, account_id, type, amount, description, category, balance_after, reference_id
- `audit_logs` — id, action, details (XSS-vulnerable), user_id, ip_address, created_at

## Intentional Vulnerabilities (CVE Reference)

1. **SQL Injection (CWE-89)** — `/api/transactions?search=` uses raw string interpolation. Try: `' OR '1'='1`
2. **IDOR (CWE-639)** — `/api/users/:userId` and `/api/accounts/:accountId` don't verify ownership
3. **Broken Access Control (CWE-284)** — `/api/admin/*` only checks authentication, not authorization
4. **JWT None Algorithm (CVE-2015-9235)** — `verifyToken` accepts `alg:"none"` tokens (unsigned)
5. **Mass Assignment (CWE-915)** — `PUT /api/users/:userId` allows setting the `role` field
6. **Stored XSS (CWE-79)** — Audit log `details` stored and rendered via `dangerouslySetInnerHTML`
7. **SSRF (CWE-918)** — `POST /api/webhook/notify` fetches any user-supplied URL server-side
8. **Weak Password Hashing (CWE-916)** — SHA-256 without salt (rainbow tables work)

## Test Credentials

- `alice` / `password123` — Regular user (userId: 1)
- `bob` / `password123` — Regular user (userId: 2)
- `admin` / `admin123` — Admin user (userId: 3)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Important Notes

- Never use `console.log` in server code — use `req.log` or singleton `logger` from `src/lib/logger.ts`
- Auth token: JWT-like stored in `localStorage` as `vulnbank_token`; `setAuthTokenGetter` called at module level
- Token format: `base64url(header).base64url(payload).base64url(sig)` — but `alg:none` skips sig check
- API codegen output: `lib/api-client-react/src/` and `lib/api-spec/zod/`
- OpenAPI spec: `lib/api-spec/openapi.yaml`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
