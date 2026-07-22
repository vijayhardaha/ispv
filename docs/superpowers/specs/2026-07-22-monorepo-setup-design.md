# Monorepo Setup Design

**Date:** 2026-07-22
**Status:** Draft
**Author:** build agent
**Project:** Indian Students Protest Vault

## Purpose

Consolidate three independent projects (frontend site, admin panel, Chrome extension) into a single Bun workspace monorepo with shared tooling.

## Projects

| Project   | Current location    | New location        | Package name            |
| --------- | ------------------- | ------------------- | ----------------------- |
| Frontend  | `/` (root)          | `apps/frontend/`    | `@reel-vault/frontend`  |
| Admin     | `apps/admin/`       | `apps/admin/`       | `@reel-vault/admin`     |
| Extension | `chrome-extension/` | `chrome-extension/` | `@reel-vault/extension` |

## Directory Structure

```
/ (workspace root)
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── eslint.config.mjs       # extends root + Next.js plugin
│   │   ├── tsconfig.json          # extends root tsconfig
│   │   └── package.json           # @reel-vault/frontend
│   └── admin/
│       ├── src/
│       ├── supabase/migrations/
│       ├── eslint.config.mjs       # extends root (no Next.js plugin)
│       ├── tsconfig.json          # extends root tsconfig
│       └── package.json           # @reel-vault/admin
├── chrome-extension/
│   ├── manifest.json
│   ├── content.js
│   └── package.json               # @reel-vault/extension (NEW)
├── package.json                   # workspace root (private, workspaces field)
├── bun.lock                       # single lockfile for all workspaces
├── eslint.config.mjs              # base/shared ESLint config
├── prettier.config.mjs            # shared Prettier config
├── tsconfig.json                  # base TypeScript config (extends @vijayhardaha/dev-config)
├── AGENTS.md
├── .editorconfig
├── .gitignore
└── .vscode/
```

## Root package.json

```json
{
  "name": "reel-vault-monorepo",
  "private": true,
  "workspaces": ["apps/*", "chrome-extension"],
  "scripts": {
    "dev:frontend": "bun run --filter @reel-vault/frontend dev",
    "dev:admin": "bun run --filter @reel-vault/admin dev",
    "dev": "bun run dev:frontend & bun run dev:admin",
    "build": "bun run --filter @reel-vault/frontend build && bun run --filter @reel-vault/admin build",
    "lint": "bun run --filter @reel-vault/frontend lint && bun run --filter @reel-vault/admin lint",
    "lint:fix": "bun run --filter @reel-vault/frontend lint:fix && bun run --filter @reel-vault/admin lint:fix",
    "tsc": "bun run --filter @reel-vault/frontend tsc && bun run --filter @reel-vault/admin tsc",
    "format": "prettier --write --log-level error .",
    "format:check": "prettier --check ."
  }
}
```

## Shared Tooling

### ESLint

Each Next.js app needs its own `eslint.config.mjs` in its project root (Next.js build expects it). Root `bun run lint` delegates via `--filter` to each workspace's own `lint` script.

- **Root** (`eslint.config.mjs`) — minimal base config, currently delegates to `@vijayhardaha/dev-config/eslint/next`. Will be a shared base that workspace configs import from.
- **`apps/frontend/eslint.config.mjs`** — imports root + Next.js plugin via `eslint-config-next` (required for `next build`).
- **`apps/admin/eslint.config.mjs`** — imports root, clean TS/React config without Next.js plugin.
- **Chrome extension** — no ESLint (plain JS, minimal).

### Prettier

- Single root `prettier.config.mjs` extends `@vijayhardaha/dev-config/prettier` + `prettier-plugin-tailwindcss`
- Covers all files across all workspaces (Prettier formats by file path, not by workspace config)
- Each workspace's `package.json` gets a `format`/`format:check` script for independent use, but root scripts cover the whole repo

### TypeScript

- Root `tsconfig.json` extends `@vijayhardaha/dev-config/tsconfig` with base settings
- Each app's `tsconfig.json` extends root and adds its own `paths`, `include`, `plugins`

## Package Renames

| Current name                    | New name                |
| ------------------------------- | ----------------------- |
| `indian-students-protest-vault` | `@reel-vault/frontend`  |
| `reel-vault-admin`              | `@reel-vault/admin`     |
| (none)                          | `@reel-vault/extension` |

## Git History Preservation

- Use `git mv` for files moved from root → `apps/frontend/` to preserve history
- Root `package.json` is replaced (not moved) — content changes completely
- Shared config files (`eslint.config.mjs`, `prettier.config.mjs`, `tsconfig.json`) stay at root and are modified in-place

## Vercel Deployment

No structural config changes needed. Each app deploys as its own Vercel project:

- **Frontend project**: Root directory = `apps/frontend/`, build = `bun run build`
- **Admin project**: Root directory = `apps/admin/`, build = `bun run build`

Both share the `bun.lock` at repo root. No `vercel.json` changes required.

## Design Decisions

- **No shared `packages/` workspace**: The frontend data is hardcoded, admin data comes from Supabase. A shared package would be premature abstraction.
- **Chrome extension included in workspaces**: Allows lint/format to cover it without separate config.
- **Bun workspaces over Turborepo**: Simpler, zero extra dependencies, sufficient for 3 projects.

## Files Changed

| File                              | Action                         |
| --------------------------------- | ------------------------------ |
| `src/` (root)                     | `git mv` → `apps/frontend/`    |
| `public/` (root)                  | `git mv` → `apps/frontend/`    |
| `next.config.ts`                  | `git mv` → `apps/frontend/`    |
| `postcss.config.mjs`              | `git mv` → `apps/frontend/`    |
| `next-env.d.ts`                   | `git mv` → `apps/frontend/`    |
| `components.json`                 | `git mv` → `apps/frontend/`    |
| `eslint.config.mjs` (root)        | Replace with base config       |
| `apps/frontend/eslint.config.mjs` | Create (extends root + Next)   |
| `apps/admin/eslint.config.mjs`    | Create (extends root, no Next) |
| `tsconfig.json`                   | Replace with workspace base    |
| `package.json` (root)             | Replace with workspace root    |
| `prettier.config.mjs`             | Keep (already global)          |
| `apps/admin/package.json`         | Add `@reel-vault/admin`        |
| `apps/admin/tsconfig.json`        | Extend root tsconfig           |
| `chrome-extension/package.json`   | Create                         |
| `AGENTS.md`                       | Update paths                   |
| `.gitignore`                      | Update ignore patterns         |
| `.vscode/settings.json`           | Update workspace settings      |
