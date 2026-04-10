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
- `/` — Login page
- `/register` — Registration
- `/dashboard` — Dashboard with balance, accounts, recent transactions
- `/accounts` — Account list
- `/accounts/:accountId` — Account detail with transactions
- `/transactions` — Full transaction list (SQL injection via search field)
- `/transfer` — Transfer money between accounts
- `/profile` — User profile (IDOR vulnerable)
- `/profile/:userId` — View any user's profile by ID (IDOR)
- `/admin` — Admin panel (broken access control — no role check)

### api-server (Express API, previewPath: /api)
Backend REST API serving all fintech endpoints.

## Intentional Vulnerabilities (for testing)

1. **SQL Injection** — `/api/transactions?search=` uses raw string interpolation
2. **IDOR (Insecure Direct Object Reference)** — `/api/users/:userId` and `/api/accounts/:accountId` don't verify ownership
3. **Broken Access Control** — `/api/admin/users` only checks authentication, not authorization (role)
4. **Weak Token** — JWT-style token signature verification is skipped (only payload is decoded)
5. **Weak Password Hashing** — SHA-256 without salt instead of bcrypt

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

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
