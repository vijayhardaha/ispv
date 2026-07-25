# AGENTS.md — Indian Students Protest Vault

## Project Overview

- **Name**: `@ispv/frontend` — a Next.js static archive site (part of `ispv-monorepo`)
- **Admin**: `@ispv/admin` — Next.js admin panel at `apps/admin/`
- **Extension**: `@ispv/extension` — Chrome extension at `chrome-extension/`
- **Purpose**: Indexes peaceful Indian protest Instagram reels, organised by city, category, and hashtag
- **Version**: 0.0.0
- **License**: MIT
- **Author**: Vijay Hardaha
- **Design**: Brutalist aesthetic — heavy black borders, hard shadows, rotated card, bold uppercase fonts, saffron/navy/white/green colour palette (Indian flag inspired)
- **Design philosophy**: Documented in `PHILOSOPHY.md` at repo root

## Stack

| Layer            | Choice                                                           |
| ---------------- | ---------------------------------------------------------------- |
| Monorepo         | Bun workspaces                                                   |
| Framework        | Next.js ^16.2.11 (App Router, Turbopack)                         |
| Language         | TypeScript ^6.0.3, React ^19.2.8                                 |
| Styling          | Tailwind CSS ^4.3.3 with `@tailwindcss/postcss`                  |
| Animations       | `tw-animate-css` ^1.4.0                                          |
| UI Primitives    | Radix UI (Dialog, DropdownMenu, Select, Slot)                    |
| Icons            | lucide-react ^1.26.0                                             |
| Class Utils      | clsx + tailwind-merge (`cn()` helper)                            |
| Variants         | class-variance-authority ^0.7.1                                  |
| Validation       | Zod ^4.4.3                                                       |
| Linting          | ESLint ^10.7.0 (flat config via `@vijayhardaha/dev-config`)      |
| Formatting       | Prettier ^3.9.6 + `prettier-plugin-tailwindcss`                  |
| Package Manager  | Bun (see `bun.lock`)                                             |
| Database         | Supabase (Postgres)                                              |
| Storage          | Vercel Blob (thumbnails)                                         |
| Image Processing | sharp (thumbnail optimisation)                                   |
| Hooks            | Husky ^9.1.7 (commit-msg: commitlint, pre-push: format+tsc+lint) |
| Commitlint       | Conventional commits via `@commitlint/config-conventional`       |

## 🚫 Strict Rules: Package Manager

- **ALWAYS use `bun` and `bunx` — NEVER `npm` or `npx`.**
- Run scripts via `bun run <script>` (e.g. `bun run dev`, `bun run lint`, `bun run test`).
- Install packages with `bun add <pkg>` (not `npm install`).
- Remove packages with `bun remove <pkg>`.
- Run ad-hoc binaries with `bunx <binary>` (e.g. `bunx prettier --write .`).

## 🎯 Essential Commands (Root Workspace)

All commands run from the repo root. They fan out to the frontend and admin apps.

| Command                 | Action                                        |
| ----------------------- | --------------------------------------------- |
| `bun run dev`           | Start both frontend (:3000) and admin (:3001) |
| `bun run dev:frontend`  | Frontend dev server with Turbopack            |
| `bun run dev:admin`     | Admin dev server on port 3001                 |
| `bun run build`         | Production build for both apps                |
| `bun run lint`          | ESLint check across all workspaces            |
| `bun run lint:fix`      | ESLint auto-fix                               |
| `bun run format`        | Prettier format all                           |
| `bun run format:check`  | Prettier check                                |
| `bun run tsc`           | TypeScript type-check (`tsc --noEmit`)        |
| `bun run test`          | Run all tests (Vitest) across workspaces      |
| `bun run test:watch`    | Watch mode for tests                          |
| `bun run test:coverage` | Run tests with coverage report                |

## 📜 App-Specific Scripts

### Frontend (`apps/frontend`)

| Command                 | Action                             |
| ----------------------- | ---------------------------------- |
| `bun run dev`           | `next dev --turbopack` (port 3000) |
| `bun run build`         | `next build && next-sitemap`       |
| `bun run lint`          | `eslint .`                         |
| `bun run lint:fix`      | `eslint --fix .`                   |
| `bun run test`          | `vitest run`                       |
| `bun run test:watch`    | `vitest` (interactive watch mode)  |
| `bun run test:coverage` | `vitest run --coverage`            |
| `bun run tsc`           | `tsc --noEmit`                     |

### Admin (`apps/admin`)

| Command                 | Action                            |
| ----------------------- | --------------------------------- |
| `bun run dev`           | `next dev -p 3001`                |
| `bun run build`         | `next build`                      |
| `bun run start`         | `next start -p 3001`              |
| `bun run lint`          | `eslint .`                        |
| `bun run lint:fix`      | `eslint --fix .`                  |
| `bun run test`          | `vitest run`                      |
| `bun run test:watch`    | `vitest` (interactive watch mode) |
| `bun run test:coverage` | `vitest run --coverage`           |
| `bun run tsc`           | `tsc --noEmit`                    |

### Chrome Extension (`chrome-extension`)

No scripts defined. Pure static extension (Manifest V3).

## ✅ Mandatory Workflow (STRICT — Agents MUST Follow)

These steps are **required** after every code change. Do not skip any step.

1. **Autofix**: Run `bun run lint:fix && bun run format` to auto-fix lint issues and format code.
2. **Typecheck + Tests**: Run `bun run tsc && bun run test` to verify no regressions.
3. **JSDoc (REQUIRED)**: After modifying any `.ts` or `.tsx` file, **always** load and execute the `jsdoc-writer` skill on that file to ensure all exported symbols have proper JSDoc. Do not skip this even for small changes.
4. **Commit Plan (REQUIRED)**: After all changes are complete, **always** load and execute the `commit-writer` skill to generate `.tmp/git.txt` with grouped `git add` + `git commit` pairs for user review. This must be done at the end of every task, without exception.

## Knowledge Bases

- **Frontend:** `apps/frontend/knowledge.md` — components, data flow, filter architecture, hooks, SEO, known gaps
- **Admin:** `apps/admin/knowledge.md` — API routes, authentication, data schema, videos page architecture, rate limiting, security

## Project Structure

```
apps/
├── frontend/             # @ispv/frontend — public archive site
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # features/, layout/, shared/, ui/
│   │   ├── constants/    # seo.ts, colors.ts, categories.ts, locations.ts, slogans.ts, navlinks.ts
│   │   ├── hooks/        # useFilterState, useReelPlayer, useSubmitVideoForm
│   │   ├── helpers/      # filterVideos, formatLocation, media.ts
│   │   └── lib/          # db.ts, adapt.ts, cn.ts, videos.ts, format.ts, instagram.ts, schema.ts, seo.ts, supabase.ts, meta.ts
│   ├── public/
│   ├── next.config.ts
│   ├── vitest.config.ts
│   ├── next-sitemap.config.js
│   └── package.json
├── admin/                # @ispv/admin — admin panel
│   ├── src/
│   │   ├── app/          # Pages (login, dashboard, videos) + API routes (auth/, public/)
│   │   ├── components/   # layout/, ui/, features/ (VideoFormModal, LogoutButton, Toast)
│   │   ├── constants/    # categories, colors, locations, navlinks, seo, status
│   │   ├── hooks/        # usePagination
│   │   ├── lib/          # api-utils, cn, instagram, rateLimit, rpc, schemas, types, supabase, supabase-server, upload
│   │   └── proxy.ts      # Middleware (auth guard, CSRF, security headers)
│   ├── supabase/
│   │   └── migrations/   # SQL migrations
│   ├── next.config.ts
│   ├── vitest.config.ts
│   └── package.json
chrome-extension/         # @ispv/extension — ISPV Helper
├── manifest.json         # Manifest V3
├── content.js            # Injects floating collect button on Instagram reel pages
├── background.js         # Service worker: proxies API requests with Bearer token
├── options.js            # Options page: manages API token + admin URL in chrome.storage.sync
├── options.html          # Options page UI
└── package.json
```

### Videos Page (Admin) — Custom Hooks Architecture

The videos page state is split across 3 sub-hooks composed by `useVideosPageState`:

| Hook                 | File                               | Responsibility                                               |
| -------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `useVideosLoader`    | `app/videos/useVideosLoader.ts`    | Data fetching, URL filter params, pagination                 |
| `useVideosSelection` | `app/videos/useVideosSelection.ts` | Checkbox selection, select-all, indeterminate state          |
| `useVideosActions`   | `app/videos/useVideosActions.ts`   | Single/bulk/inline status actions, confirmation dialogs      |
| `useVideosPageState` | `app/videos/useVideosPageState.ts` | Composition + modal UI state (edit/showAdd) + loading effect |

See `apps/admin/knowledge.md` for full details.

## Key paths

- Frontend `@/*` maps to `apps/frontend/src/*`
- Admin `@/*` maps to `apps/admin/src/*`
- Root shared configs at repo root
- Supabase migrations at `apps/admin/supabase/migrations/`
- Chrome extension at `chrome-extension/`

## Coding Conventions

### Components

- Named function declarations: `export function Foo() { ... }`
- Client components start with `'use client'`
- Server components have no directive
- Explicit `JSX.Element` return type on all components
- `React.forwardRef` for reusable UI primitives with `.displayName`
- Props interface at top of file, exported for reuse
- Use `cn()` for class merging from `@/lib/cn`
- **Frontend only**: `React.memo` wraps `VideoCard` and `TagChips`; `useCallback`/`useMemo` for stable references

### Imports

- Named exports preferred over default exports
- `import type { ... }` for type-only imports
- Group order: React → external libs → internal modules
- Blank line separators between groups, alphabetical within groups

### Styling

- **Tailwind v4** with `@import "tailwindcss"` syntax
- Design tokens in `@theme inline` block in `globals.css`
- shadcn-style CSS variables in HSL format
- Brutalist conventions: `border-2`, `shadow-brutal-*`, uppercase tracking-tight text, bold fonts
- Custom utilities defined with `@utility` and `@layer utilities`
- No CSS modules — all styling inline via Tailwind utilities

### Typography

- Body: Space Grotesk (`--font-body`)
- Display/Headings: Poppins (`--font-display`)
- Mono: JetBrains Mono (`--font-mono`)
- All headings: `font-display`, `font-extrabold`, `tracking-tight`

## Data Architecture

All video data is stored in Supabase (`videos`, `categories`, `locations` tables). The frontend fetches from Supabase via `lib/db.ts` (server components) or `useEffect` (client components). See `apps/frontend/knowledge.md` for full Data Architecture details.

Key types:

- `VideoEntry` — full video record (id, description, url, thumbnail, city, location, category, categoryName, tags, hashtags, duration, trending?, videoPostDate?, createdAt, viewCount?)
- `VideoRow` — raw Supabase row shape (id, video_url, video_id, video_src, category, location, city, tags, description, thumbnail_url, video_post_date, view_count, status, created_at, updated_at)
- `DbCategory` — `{ slug, name, tag, color, description | null }`
- `DbLocation` — `{ slug, name }`
- `VideoFilters` — `{ category?, location?, tag?, query?, sort?, page?, perPage? }`
- `FilterState` — `{ query, category, location, tags[], page, perPage, sort }` (in `helpers/filterVideos.ts`)
- `SortOption` — union of field+direction strings like `views_desc`, `posted_date_desc`, `city_asc`, etc.
- `HomepageStats` — `{ totalVideos, totalCities, totalLocations, locationCounts[] }`
- `SeoProps` — `{ title, description, path?, postfix? }` (in `lib/meta.ts`)
- `VideoRecord` (admin) — full DB row type (includes status, trashed_at, video_src, video_id, view_count, etc.)
- `CategoryRecord` (admin) — `{ slug, name, tag, color, description | null }`
- `LocationRecord` (admin) — `{ slug, name }`

Admin-specific types:

- `GetVideosFilters` — `{ status?, search?, category?, location?, trashed?, page?, perPage? }` (in `lib/rpc.ts`)
- `GetVideosApiResponse` — `{ data: VideoRecord[], pagination: PaginationMeta }` (in `lib/types.ts`)
- `PaginationMeta` — `{ page, per_page, total_count, total_pages, has_next, has_previous }`

### Helper Functions

**Frontend (`lib/`):**

- `getCategories()` — returns `DbCategory[]` with "Other" pinned last
- `getLocations()` — returns `DbLocation[]` with "Foreign" pinned last
- `getCategoryByValue(value)` — single lookup by slug
- `getFeaturedCategories()` — returns 6 featured categories in display order
- `getTags()` — via `get_tags` RPC, sorted by frequency
- `getPublishedVideos(filters)` — paginated, filtered published videos via `get_frontend_videos` RPC
- `getCategorySectionVideos(slugs, perCategory)` — per-category video sections via `get_frontend_category_videos` RPC
- `getHomepageStats()` — aggregate homepage stats via `get_homepage_stats` RPC
- `checkVideoExists(url)` — checks admin public API for duplicate URL
- `getPublishedVideoCount()`, `getCityCounts()`, `getLocationCounts()` — count helpers
- `getLocationVideoCounts()`, `getCategoryCounts()` — per-location/per-category counts
- `siteUrl()`, `getPermaLink(path)` — URL utilities (in `lib/seo.ts`)
- `buildMetadata(props)` — Next.js Metadata builder (in `lib/meta.ts`)
- `buildBreadcrumbs(path, currentPage)` — breadcrumb item builder
- `globalSchema()` — global JSON-LD schema objects (Person, Organization, WebSite)
- `formatNumber(n)`, `timeAgo(iso)` — formatting utilities (in `lib/format.ts`)
- `extractInstagramId(url)` — extracts media ID from Instagram URL (in `lib/instagram.ts`)

**Frontend (`helpers/`):**

- `filterVideos(videos, state)` — AND filter + sort by category, location, tags, query
- `formatLocationLabel(city, location)` — location label with deduplication (in `helpers/formatLocation.ts`)
- `getThumbnailSrc(thumbnail, fallback?)` — thumbnail URL with fallback (in `helpers/media.ts`)

**DB Adapter (`lib/adapt.ts`):**

- `dbRowToVideoEntry(row)` — normalises a single DB row → `VideoEntry` (sets `trending` flag when `view_count > 1000`)
- `dbRowsToVideoEntries(rows)` — maps an array of rows to `VideoEntry[]`

**Admin (`lib/`):**

- `getVideosForApi(supabase, filters)` — paginated video list RPC (in `lib/rpc.ts`)
- `requireUser(supabase)` — auth guard returning 401 or null
- `jsonError(error, status?)` — builds JSON error response
- `deleteVideoById(supabase, id)` — permanent delete with blob cleanup
- `createServiceSupabase()` — service-role client for public endpoints
- `checkDuplicate(supabase, field, value, excludeId?)` — duplicate URL/ID check
- `checkRateLimit(req, prefix, limit, windowSec)` — Redis/in-memory rate limiting
- `extractIgId(url)`, `normalizeIgUrl(url)`, `detectSource(url)`, `displayVideoUrl(v)`, `reconstructIgUrl(id)` — Instagram URL utilities
- `sanitizeFilename(name)`, `uploadBuffer(buffer, filename)`, `deleteBlob(url)` — Vercel Blob utilities

## Config files

| File                                | Purpose                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `next.config.ts`                    | Image remote patterns (Instagram CDN, Vercel Blob)                           |
| `tsconfig.json`                     | Extends `@vijayhardaha/dev-config/tsconfig`, `@/*` path alias                |
| `eslint.config.mjs`                 | Delegates to `@vijayhardaha/dev-config/eslint/next`                          |
| `prettier.config.mjs`               | Extends `@vijayhardaha/dev-config/prettier` + `prettier-plugin-tailwindcss`  |
| `components.json` (frontend)        | shadcn/ui config (new-york style, RSC enabled)                               |
| `postcss.config.mjs`                | `@tailwindcss/postcss`                                                       |
| `vitest.config.ts`                  | Per-app Vitest config (node env, global setup, coverage, `@` alias)          |
| `vercel.json`                       | Build/install commands for Vercel                                            |
| `.editorconfig`                     | 2-space indent, LF, UTF-8                                                    |
| `commitlint.config.mjs`             | Conventional commits via `@vijayhardaha/dev-config`                          |
| `.husky/commit-msg`                 | Runs commitlint on commit message                                            |
| `.husky/pre-push`                   | Runs `bun run format && bun run format:check && bun run tsc && bun run lint` |
| `next-sitemap.config.js` (frontend) | Sitemap generation with dynamic category paths                               |

## Project state

- **Vitest ^4.1.10** configured per-app with **164 tests total** (admin: 8+ files, frontend: 5+ files)
- **No env files** tracked in git (`.env.example` files exist locally)
- **No CI/CD** (no `.github/` directory)
- **No analytics, no i18n, no PWA, no service worker** — GoogleAnalytics component gated to production + non-empty GA ID (currently disabled)
- **VercelAnalytics** component exists in frontend but not wired in layout
- Data is entirely dynamic from Supabase (not hardcoded)
- **Design philosophy** documented in `PHILOSOPHY.md` at repo root
