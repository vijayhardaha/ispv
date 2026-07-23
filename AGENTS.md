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

## Stack

| Layer           | Choice                                                      |
| --------------- | ----------------------------------------------------------- |
| Monorepo        | Bun workspaces                                              |
| Framework       | Next.js ^16.2.10 (App Router, Turbopack)                    |
| Language        | TypeScript ^6.0.3, React ^19.2.7                            |
| Styling         | Tailwind CSS ^4.3.3 with `@tailwindcss/postcss`             |
| Animations      | `tw-animate-css` ^1.4.0                                     |
| UI Primitives   | Radix UI (Dialog, DropdownMenu, Select, Slot)               |
| Icons           | lucide-react ^1.25.0                                        |
| Class Utils     | clsx + tailwind-merge (`cn()` helper)                       |
| Variants        | class-variance-authority ^0.7.1                             |
| Linting         | ESLint ^10.7.0 (flat config via `@vijayhardaha/dev-config`) |
| Formatting      | Prettier ^3.9.6 + `prettier-plugin-tailwindcss`             |
| Package Manager | Bun (see `bun.lock`)                                        |

## Essential Commands

| Command                | Action                                        |
| ---------------------- | --------------------------------------------- |
| `bun run dev`          | Start both frontend (:3000) and admin (:3001) |
| `bun run dev:frontend` | Frontend dev server with Turbopack            |
| `bun run dev:admin`    | Admin dev server on port 3001                 |
| `bun run build`        | Production build for both apps                |
| `bun run lint`         | ESLint check across all workspaces            |
| `bun run lint:fix`     | ESLint auto-fix                               |
| `bun run format`       | Prettier format all                           |
| `bun run format:check` | Prettier check                                |
| `bun run tsc`          | TypeScript type-check (`tsc --noEmit`)        |

Always run lint + tsc after making changes: `bun run lint && bun run tsc`.

## Frontend Knowledge Base

Detailed frontend documentation at `apps/frontend/knowledge.md` — covers components, data flow, filter architecture, hooks, SEO, and known gaps.

## Project Structure

```
apps/
├── frontend/             # @ispv/frontend — public site
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── data/         # Hardcoded video entries
│   │   ├── hooks/
│   │   └── lib/
│   ├── public/
│   ├── next.config.ts
│   └── package.json
└── admin/                # @ispv/admin — admin panel
    ├── src/
    │   ├── app/          # Pages + API routes
    │   ├── components/   # Form modals
    │   └── lib/          # Supabase client + types
    ├── supabase/migrations/
    └── package.json
chrome-extension/         # @ispv/extension
├── manifest.json
├── content.js
├── icons/
└── package.json
```

## Key paths

- Frontend `@/*` maps to `apps/frontend/src/*`
- Admin `@/*` maps to `apps/admin/src/*`
- Root shared configs at repo root
- Supabase migrations at `apps/admin/supabase/migrations/`

## Coding Conventions

### Components

- Named function declarations: `export function Foo() { ... }`
- Client components start with `'use client'`
- Server components have no directive
- Explicit `JSX.Element` return type on all components
- `React.forwardRef` for reusable UI primitives with `.displayName`
- Props interface at top of file, exported for reuse
- Use `cn()` for class merging from `@/lib/utils`

### Imports

- Named exports preferred over default exports
- `import type { ... }` for type-only imports
- Group order: React → external libs → internal modules
- Blank line separators between groups, alphabetical within groups

### Styling

- **Tailwind v4** with `@import "tailwindcss"` syntax
- Design tokens in `@theme inline` block in `index.css`
- shadcn-style CSS variables in HSL format
- Brutalist conventions: `border-2`, `border-2`, `shadow-brutal-*`, uppercase tracking-tight text, bold fonts
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

- `VideoEntry` — full video record (id, description, url, thumbnail, city, state, category, categoryName, tags, hashtags, duration, featured?)
- `VideoCategory` — `string`
- `DbCategory` — `{ id, value, name, color, description?, seo_title?, seo_description? }`
- `DbLocation` — `{ id, value, name, description? }`
- Helper functions: `getAllVideosFromDb()`, `getCategories()`, `getLocations()`, `getTags()`, `getCategoryByValue()`

## Config files

- `next.config.ts` — image remote patterns (Unsplash, Instagram CDN)
- `tsconfig.json` — extends `@vijayhardaha/dev-config/tsconfig`, `@/*` path alias
- `eslint.config.mjs` — delegates to `@vijayhardaha/dev-config/eslint/next`
- `prettier.config.mjs` — extends `@vijayhardaha/dev-config/prettier` + `prettier-plugin-tailwindcss`
- `components.json` — shadcn/ui config (`base-nova` style, RSC enabled)
- `postcss.config.mjs` — `@tailwindcss/postcss`
- `.editorconfig` — 2-space indent, LF, UTF-8

## Project state

- **No test framework** configured
- **No env files** exist (no `.env.example` either)
- **No CI/CD** (no `.github/` directory)
- **No analytics, no i18n, no PWA, no service worker**
- Data is entirely dynamic from Supabase (not hardcoded)
- The `dist/` dir is stale Vite build output (from pre-Next.js migration)
