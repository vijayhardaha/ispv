# AGENTS.md — Indian Students Protest Vault

## Project Overview

- **Name**: `indian-students-protest-vault` — a Next.js static archive site
- **Purpose**: Indexes peaceful Indian protest Instagram reels, organised by city, category, and hashtag
- **Version**: 0.0.0
- **License**: MIT
- **Author**: Vijay Hardaha
- **Design**: Brutalist aesthetic — heavy black borders, hard shadows, rotated card, bold uppercase fonts, saffron/navy/white/green colour palette (Indian flag inspired)

## Stack

| Layer           | Choice                                                      |
| --------------- | ----------------------------------------------------------- |
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

| Command                | Action                                 |
| ---------------------- | -------------------------------------- |
| `bun run dev`          | Dev server with Turbopack              |
| `bun run build`        | Production build                       |
| `bun run lint`         | ESLint check (all files)               |
| `bun run lint:fix`     | ESLint auto-fix                        |
| `bun run format`       | Prettier format all                    |
| `bun run format:check` | Prettier check                         |
| `bun run tsc`          | TypeScript type-check (`tsc --noEmit`) |

Always run lint + tsc after making changes: `bun run lint:fix && bun run tsc`.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout (Header + Footer + fonts)
│   ├── page.tsx          # Homepage
│   ├── about/page.tsx
│   ├── categories/page.tsx
│   ├── categories/[id]/page.tsx
│   ├── videos/page.tsx
│   └── not-found.tsx
├── components/           # React components
│   ├── filters/          # FilterBar, Pagination
│   ├── flags/            # FlagStripe
│   ├── home/             # HeroSection, SloganTicker, FeaturedVideos, CategorySection, CitiesMap
│   ├── layout/           # Header, Footer
│   ├── submit/           # SubmitVideoDialog
│   ├── ui/               # Button, Card, Dialog, Input, Badge, Dropdown, Container
│   └── videos/           # VideoCard, ReelPlayer
├── data/
│   ├── slogans.ts        # Peaceful protest slogans
│   └── videos.ts         # Hardcoded video entries, categories, cities, helpers
├── hooks/                # (empty — custom hooks go here)
├── lib/
│   └── utils.ts          # cn(), formatNumber(), timeAgo(), extractInstagramId(), instagramEmbedUrl()
└── index.css             # Global styles (Tailwind v4 + shadcn CSS vars)
```

## Key paths

- `@/*` maps to `./src/*`
- Components: `@/components/...`
- Utilities: `@/lib/utils`
- Data: `@/data/...`
- Global CSS: `@/index.css`

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
- Brutalist conventions: `border-2`, `border-2`, `shadow-brutal-*`, uppercase tracking-wider text, bold fonts
- Custom utilities defined with `@utility` and `@layer utilities`
- No CSS modules — all styling inline via Tailwind utilities

### Typography

- Body: Space Grotesk (`--font-body`)
- Display/Headings: Poppins (`--font-display`)
- Mono: JetBrains Mono (`--font-mono`)
- All headings: `font-display`, `font-extrabold`, `tracking-tight`

## Data Architecture

All video data is hardcoded in `src/data/videos.ts`. There is no backend or database.

Key types:

- `VideoEntry` — full video record (id, description, url, thumbnail, city, state, category, tags, hashtags, duration, featured?)
- `VideoCategory` — `'all' | 'marches' | 'rallies' | 'candlelight' | 'art' | 'youth' | 'press'`
- Helper functions: `getAllVideos()`, `getVideosByCity()`, `getVideosByCategory()`, `getCategoryById()`, `getAllCities()`

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
- Data is entirely static/hardcoded
- The `dist/` dir is stale Vite build output (from pre-Next.js migration)
