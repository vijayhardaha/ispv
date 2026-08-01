# Frontend Knowledge Base

## Stack

- **Package:** `@ispv/frontend` (part of the `ispv` monorepo)
- **Framework:** Next.js ^16.2.11 (App Router, Turbopack)
- **Language:** TypeScript ^6.0.3, React ^19.2.8
- **Styling:** Tailwind CSS ^4.3.3 (`@tailwindcss/postcss`), `tw-animate-css` ^1.4.0
- **UI Primitives:** Radix UI (Dialog, Select, Slot)
- **Icons:** lucide-react ^1.26.0, react-icons ^5.7.0
- **Class Utils:** clsx + tailwind-merge (`cn()`)
- **Variants:** class-variance-authority ^0.7.1
- **Database:** Supabase (browser client via `@supabase/supabase-js` ^2.110.8)
- **Schema/Validation:** Zod ^4.4.3, `@vijayhardaha/schema-builder` ^1.2.0 (JSON-LD), `lib/schema.ts` (Zod schemas)
- **SEO:** `next-sitemap` ^4.2.3 for sitemap generation, `@next/third-parties` ^16.2.11
- **Analytics:** `@vercel/analytics` ^2.0.1 (VercelAnalytics component exists but NOT wired in layout)
- **Testing:** Vitest ^4.1.10 (node env, 5+ test files — utilities, adapters, constants, filtering, formatting, Instagram)

## Project Structure

```
src/
├── app/              # App Router pages
│   ├── layout.tsx    # Root layout (fonts, Header, Footer, GA, JSON-LD, ReelPlayerProvider)
│   ├── page.tsx      # Homepage (server component — fetches videos, categories, locations from Supabase)
│   ├── not-found.tsx
│   ├── about/page.tsx
│   ├── categories/page.tsx
│   ├── categories/[id]/page.tsx (with useCategoryPage hook, CategoryHero, CategoryVideos)
│   ├── dmca/page.tsx
│   │   ├── api/og/preview.png/route.tsx  # OG preview API endpoint
│   ├── privacy/page.tsx
│   ├── sitemap/page.tsx
│   ├── terms/page.tsx
│   ├── videos/VideosPageContent.tsx + videos/page.tsx
│   └── why-students-are-protesting/page.tsx (multi-section content page with 8 sections)
├── components/
│   ├── features/     # HeroSection, FeaturedVideos, CategorySection, CategorySectionLoader,
│   │                 # LocationsMap, CTASection, FAQSection, ShareSection, SloganTicker,
│   │                 # HashtagArea, SubmitVideoDialog, RecentlyAddedVideos, PullQuoteSection
│   ├── layout/       # Header, Footer
│   ├── shared/       # FilterBar, VideoCard (React.memo), ReelPlayer, ReelPlayerProvider, ReelItem,
│   │                 # Pagination, TagChips (React.memo), SectionHeader, VideoGridSection,
│   │                 # VideoCardSkeleton, SuccessState, PageHero, GoogleAnalytics, VercelAnalytics
│   └── ui/           # Primitives (Button, Container, Dialog, Dropdown, Input, Tag)
├── constants/        # seo.ts, colors.ts, navlinks.ts, categories.ts, locations.ts, slogans.ts
├── helpers/          # filterVideos.ts (with sort support), formatLocation.ts, media.ts
├── hooks/            # useFilterState.ts, useReelPlayer.ts, useSubmitVideoForm.ts
└── lib/              # videos.ts (VideoEntry + getAllVideosFromDb), db.ts, adapt.ts, cn.ts,
                      # format.ts, instagram.ts, supabase.ts, schema.ts, seo.ts, meta.ts
```

## Data Architecture

- **Supabase** is the single source of truth (`videos`, `categories`, `locations` tables)
- `lib/videos.ts:getPublishedVideos(filters)` fetches paginated, filtered published videos via the `get_frontend_videos` RPC
- `lib/videos.ts:getCategorySectionVideos(slugs, perCategory)` fetches per-category video groups via the `get_frontend_category_videos` RPC
- Raw rows go through `lib/adapt.ts:dbRowToVideoEntry()` — normalises fields, generates hashtags from tags+city, sets `trending` flag when `view_count > 1000`
- Server components fetch directly via `lib/db.ts` functions
- Client components fetch via `useEffect` → `useState`
- No caching layer, no SWR/React Query, no server-side filtering
- Categories, locations, and slogans are also available as hardcoded constants in `constants/` for use in static pages

### Key Types

```ts
VideoEntry {
  id, description, url, thumbnail, city, location, category, categoryName,
  tags, hashtags, duration, trending?, videoPostDate?, createdAt, viewCount?
}

VideoRow {
  id, video_url, video_id, video_src, category, location, city,
  tags[], description, thumbnail_url, video_post_date, view_count,
  status, created_at, updated_at
}

VideoFilters {
  category?, location?, tag?, query?, sort?, page?, perPage?
}

HomepageStats {
  totalVideos, totalCities, totalLocations, locationCounts[]
}
```

### DB Functions (`lib/db.ts`)

| Function                   | Returns                               | Notes                                        |
| -------------------------- | ------------------------------------- | -------------------------------------------- |
| `getCategories()`          | `DbCategory[]`                        | "other" pinned to end                        |
| `getLocations()`           | `DbLocation[]`                        | "foreign" pinned to end                      |
| `getCategoryByValue(v)`    | `DbCategory\|null`                    | Single lookup by slug                        |
| `getTags()`                | `string[]`                            | Via `get_tags` RPC, sorted by frequency      |
| `getFeaturedCategories()`  | `DbCategory[]`                        | 6 slugs, display order preserved             |
| `getHomepageStats()`       | `HomepageStats`                       | Aggregate stats via `get_homepage_stats` RPC |
| `getPublishedVideoCount()` | `number`                              | Published video count                        |
| `getCityCounts()`          | `number`                              | Unique city count                            |
| `getLocationCounts()`      | `number`                              | Unique location count                        |
| `getLocationVideoCounts()` | `{slug, count}[]`                     | Per-location video counts                    |
| `getCategoryCounts()`      | `{slug, count}[]`                     | Per-category video counts                    |
| `checkVideoExists(url)`    | `{exists, trashed?, status?, error?}` | Duplicate check via admin API                |

## Filter Architecture

- `FilterState` (`helpers/filterVideos.ts`): `{ query, category, location, tags[], page, perPage, sort }`
- `useFilterState` (`hooks/useFilterState.ts`): **URL-driven** — reads `q`, `location`, `tag`, `sort`, `page` from `useSearchParams` and exposes `setFilter(param, value)` which rewrites the URL via `router.replace` (resets `page`). Used by both the videos page and category pages so filters/sort/pagination live in the URL
- `filterVideos()` (`helpers/filterVideos.ts`): AND logic across category, location, tags, query, then sorts by selected option (pure helper — client pages filter server-side via the RPC)
- `SORT_OPTIONS` (`helpers/filterVideos.ts`): label/value pairs for sort dropdown
- `SortOption` type: `views_desc`, `views_asc`, `posted_date_desc`, `posted_date_asc`, `created_date_desc`, `created_date_asc`, `city_asc`, `city_desc`, `location_asc`, `location_desc`
- URL params: `q` (search, committed on Enter), `location` (slug), `tag` (single), `sort` (SortOption), `page` (1-based; also driven by `Pagination` links)
- Tags: single-select toggle, capped at 100 chips, **hidden by default** (toggle button to show)
- Location: select dropdown, "All locations" default (`location=all` clears the param)
- Tags section in FilterBar has show/hide toggle button (collapsed by default) with `aria-expanded` for accessibility

## Reel Player

- Context provider (`ReelPlayerProvider`) in root layout
- `useReelPlayer()` hook returns `{ active, play(video, list), close }`
- `ReelPlayer` full-screen overlay: vertical snap scroll, keyboard nav (j/k/arrows/escape/m), Instagram iframe embeds
- View counting fires POST to `https://admin-app.vercel.app/api/views` on embed load
- Body scroll lock when open

## Component Conventions

- Named `const` function exports: `export const Foo = (...) => { ... }`
- **`React.memo`** wraps `VideoCard` and `TagChips` to skip re-renders when props don't change
- **`useCallback`** / **`useMemo`** used throughout for stable references (CategorySection, FilterBar, useSubmitVideoForm, ReelPlayerProvider)
- Explicit `JSX.Element` return type
- Props interfaces at top of file, exported for reuse
- Server components: no directive
- Client components: `'use client'` at top
- `cn()` for class merging from `@/lib/cn`
- Brutalist design: `border-2`, `shadow-brutal`, bold uppercase text

## SEO & Analytics

- `constants/seo.ts`: `SITE_CONFIG`, `SITE_METADATA` (full Next.js Metadata with OG/Twitter/robots)
- `lib/seo.ts`: `siteUrl()`, `buildMetadata()` per-page metadata builder
- `lib/schema.ts`: JSON-LD schemas (global + per-page) using `@vijayhardaha/schema-builder`
- `GoogleAnalytics`: gated to production + non-empty `GOOGLE_ANALYTICS_ID` (currently empty — disabled)
- `VercelAnalytics`: component exists at `shared/VercelAnalytics.tsx` but NOT imported in `layout.tsx`

## Performance Optimisations Applied

| File                     | Optimisation                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| `VideoCard.tsx`          | `React.memo` — skips re-render unless video/onPlay/className change |
| `TagChips.tsx`           | `React.memo` — skips re-render unless tags/selected/onSelect stable |
| `CategorySection.tsx`    | `useMemo` for items slice + `useCallback` for handlePlay            |
| `FilterBar.tsx`          | `useCallback` for selectTag → stable onSelect for TagChips.memo     |
| `ReelPlayerProvider.tsx` | `useCallback` for play/close context values                         |
| `useSubmitVideoForm.ts`  | `useCallback` on all 7 internal handlers                            |

## Testing

- Vitest ^4.1.10, node environment, `globals: true`
- Test files: `adapt.test.ts`, `cn.test.ts`, `format.test.ts`, `instagram.test.ts`, `seo.test.ts`, `videos.test.ts`, `schema.test.ts`, `meta.test.ts`, `filterVideos.test.ts`, `formatLocation.test.ts`, `media.test.ts`, `constants.test.ts`, `slogans.test.ts`
- Covers: DB adapters, class merging, formatting utilities, Instagram URL parsing, SEO helpers, filter logic, constants validation, media helpers
- No component tests or E2E tests

## Not Wired / Known Gaps

- `VercelAnalytics` component exists at `shared/VercelAnalytics.tsx` but is not imported in layout.tsx
- `GoogleAnalytics` component is gated to production + non-empty `NEXT_PUBLIC_GA_ID` (currently empty — disabled)
- `SubmitVideoDialog` POSTs to the admin public API endpoint — needs production URL configured in `NEXT_PUBLIC_ADMIN_URL`
- No env files tracked (only `.env.example` with Supabase placeholder values)

## Config Files

| File                     | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `next.config.ts`         | Image remote patterns (Unsplash, Vercel Blob)                            |
| `postcss.config.mjs`     | `@tailwindcss/postcss` plugin                                            |
| `tsconfig.json`          | Extends `@vijayhardaha/dev-config/tsconfig`, `@/*` alias, vitest globals |
| `eslint.config.mjs`      | Delegates to `@vijayhardaha/dev-config/eslint/next`                      |
| `vitest.config.ts`       | Node env, `@` alias, V8 coverage, globals                                |
| `components.json`        | shadcn/ui new-york style, RSC enabled                                    |
| `next-sitemap.config.js` | Sitemap with dynamic category paths                                      |
| `.vercelignore`          | Allowlist for Vercel deployment                                          |
| `vercel.json`            | Build: `bun run build`, install: `bun install`                           |
