# Frontend Knowledge Base

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 6, React 19
- **Styling:** Tailwind CSS 4 (`@tailwindcss/postcss`), `tw-animate-css`
- **UI Primitives:** Radix UI (Dialog, Select, Slot)
- **Icons:** lucide-react
- **Class Utils:** clsx + tailwind-merge (`cn()`)
- **Variants:** class-variance-authority
- **Database:** Supabase (browser client via `@supabase/supabase-js`)
- **Schema:** `@vijayhardaha/schema-builder` for JSON-LD
- **Testing:** Vitest (node env, no jsdom, 5 test files — utilities only)

## Project Structure

```
src/
├── app/              # App Router pages
│   ├── layout.tsx    # Root layout (fonts, Header, Footer, GA, JSON-LD, ReelPlayerProvider)
│   ├── page.tsx      # Homepage (server component)
│   ├── not-found.tsx
│   ├── about/page.tsx
│   ├── categories/page.tsx, categories/[id]/page.tsx
│   ├── dmca/page.tsx
│   ├── privacy/page.tsx
│   ├── sitemap/page.tsx
│   ├── terms/page.tsx
│   ├── videos/page.tsx
│   └── why-students-are-protesting/page.tsx
├── components/
│   ├── features/     # Feature-specific (HeroSection, FeaturedVideos, CategorySection, LocationsMap, etc.)
│   ├── layout/       # Header, Footer
│   ├── shared/       # FilterBar, VideoCard, ReelPlayer, Pagination, GoogleAnalytics, VercelAnalytics
│   └── ui/           # Primitives (Button, Dialog, Dropdown, Input, Badge, Card, Container, Tag)
├── constants/        # seo.ts, colors.ts, navlinks.ts
├── data/             # videos.ts (VideoEntry + getAllVideosFromDb), slogans.ts
├── helpers/          # filterVideos.ts + tests
├── hooks/            # useFilterState.ts, useReelPlayer.ts
├── lib/              # db.ts, adapt.ts, cn.ts, format.ts, instagram.ts, supabase.ts + tests
└── utils/            # schema.ts, seo.ts, meta.ts
```

## Data Architecture

- **Supabase** is the single source of truth (`videos`, `categories`, `locations` tables)
- `data/videos.ts:getAllVideosFromDb()` fetches published videos with joined category name/color
- Raw rows go through `lib/adapt.ts:dbRowToVideoEntry()` — normalizes fields, generates hashtags from tags+city, sets `featured` flag when `view_count > 1000`
- Server components fetch directly via `lib/db.ts` functions
- Client components fetch via `useEffect` -> `useState`
- No caching layer, no SWR/React Query, no server-side filtering

### Key Types

```
VideoEntry { id, description, url, thumbnail, city, state, category, categoryName, tags, hashtags, duration, featured? }
DbCategory  { id, value, name, color, description?, seo_title?, seo_description? }
DbLocation  { id, value, name, description? }
```

### DB Functions (`lib/db.ts`)

| Function                  | Returns            | Notes                                   |
| ------------------------- | ------------------ | --------------------------------------- |
| `getCategories()`         | `DbCategory[]`     | "other" pinned to end                   |
| `getLocations()`          | `DbLocation[]`     | "foreign" pinned to end                 |
| `getCategoryByValue(v)`   | `DbCategory\|null` | Single lookup by slug                   |
| `getTags()`               | `string[]`         | Via `get_tags` RPC, sorted by frequency |
| `getFeaturedCategories()` | `DbCategory[]`     | 6 slugs, display order preserved        |

## Filter Architecture

- `FilterState` (`components/shared/FilterBar.tsx`): `{ query, category, location, tags[], page, perPage }`
- `useFilterState` (`hooks/useFilterState.ts`): Reads URL params on init, syncs back via `replaceState`
- `filterVideos()` (`helpers/filterVideos.ts`): AND logic across category, location, tags, query
- Tags: single-select toggle, capped at 100 chips
- Location: select dropdown, "All locations" default

## Reel Player

- Context provider (`ReelPlayerProvider`) in root layout
- `useReelPlayer()` hook returns `{ active, play(video, list), close }`
- `ReelPlayer` full-screen overlay: vertical snap scroll, keyboard nav (j/k/arrows/escape/m), Instagram iframe embeds
- View counting fires POST to `https://admin-app.vercel.app/api/views` on embed load
- Body scroll lock when open

## Component Conventions

- Named function exports (`export function Foo()`)
- Explicit `JSX.Element` return type
- Props interfaces at top of file, exported for reuse
- Server components: no directive
- Client components: `'use client'` at top
- `cn()` for class merging
- Brutalist design: `border-2`, `shadow-brutal`, bold uppercase text

## SEO & Analytics

- `constants/seo.ts`: `SITE_CONFIG`, `SITE_METADATA` (full Next.js Metadata with OG/Twitter/robots)
- `utils/schema.ts`: `globalSchema()` returns Person + Organization + WebSite JSON-LD
- `utils/meta.ts`: `buildMetadata()` per-page metadata builder
- `GoogleAnalytics`: gated to production + non-empty `GOOGLE_ANALYTICS_ID` (currently empty — disabled)
- `VercelAnalytics`: exists but not wired in layout

## Testing

- Vitest, node environment, `globals: true`
- 5 test files: `adapt.test.ts`, `cn.test.ts`, `format.test.ts`, `instagram.test.ts`, `filterVideos.test.ts`
- No component tests or E2E tests

## Not Wired / Known Gaps

- `VercelAnalytics` component exists but is not imported in layout
- `SubmitVideoDialog` uses mock timeout (1.2s) — no real API integration
- No env files tracked (only `.env.example` with Supabase placeholder values)
