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
- **Schema:** Zod for form validation (`lib/frontend-schemas.ts`), `@vijayhardaha/schema-builder` for JSON-LD
- **Testing:** Vitest (node env, 5+ test files — utilities, adapters, constants, filtering)

## Project Structure

```
src/
├── app/              # App Router pages
│   ├── layout.tsx    # Root layout (fonts, Header, Footer, GA, JSON-LD, ReelPlayerProvider)
│   ├── page.tsx      # Homepage (server component — fetches videos, categories, locations from Supabase)
│   ├── not-found.tsx
│   ├── about/page.tsx
│   ├── categories/page.tsx, categories/[id]/page.tsx (with useCategoryPage hook)
│   ├── dmca/page.tsx
│   ├── privacy/page.tsx
│   ├── sitemap/page.tsx
│   ├── terms/page.tsx
│   ├── videos/page.tsx
│   └── why-students-are-protesting/page.tsx (multi-section content page)
├── components/
│   ├── features/     # HeroSection, FeaturedVideos, CategorySection, LocationsMap, CTASection,
│   │                 # FAQSection, ShareSection, SloganTicker, HashtagArea, SubmitVideoDialog
│   ├── layout/       # Header, Footer
│   ├── shared/       # FilterBar, VideoCard (React.memo), ReelPlayer, ReelPlayerProvider, ReelItem,
│   │                 # Pagination, TagChips (React.memo), SuccessState, GoogleAnalytics, VercelAnalytics
│   └── ui/           # Primitives (Button, Container, Dialog, Dropdown, Input, Tag)
├── constants/        # seo.ts, colors.ts, navlinks.ts, categories.ts, locations.ts, slogans.ts,
│                     # why-protest-data.tsx, data.ts (deprecated)
├── helpers/          # filterVideos.ts (with sort support), formatLocation.ts, buildThumbnailSrc.ts
├── hooks/            # useFilterState.ts, useReelPlayer.ts, useSubmitVideoForm.ts
├── lib/              # videos.ts (VideoEntry + getAllVideosFromDb), db.ts, adapt.ts, cn.ts,
│                     # format.ts, instagram.ts, supabase.ts, frontend-schemas.ts, schema.ts, seo.ts, meta.ts
```

## Data Architecture

- **Supabase** is the single source of truth (`videos`, `categories`, `locations` tables)
- `lib/videos.ts:getAllVideosFromDb()` fetches published videos ordered by `video_post_date DESC, created_at DESC`
- Raw rows go through `lib/adapt.ts:dbRowToVideoEntry()` — normalises fields, generates hashtags from tags+city, sets `trending` flag when `view_count > 1000`
- Server components fetch directly via `lib/db.ts` functions
- Client components fetch via `useEffect` → `useState`
- No caching layer, no SWR/React Query, no server-side filtering
- Categories, locations, and slogans are also available as hardcoded constants in `constants/` for use in static pages (why-protest, etc.)

### Key Types

```
VideoEntry {
  id, description, url, thumbnail, city, location, category, categoryName,
  tags, hashtags, duration, trending?, videoPostDate?, createdAt, viewCount?
}
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

- `FilterState` (`lib/frontend-schemas.ts`): `{ query, category, location, tags[], page, perPage, sort }`
- `useFilterState` (`hooks/useFilterState.ts`): Reads URL params on init, syncs back via `replaceState`
- `filterVideos()` (`helpers/filterVideos.ts`): AND logic across category, location, tags, query, then sorts by selected option
- Tags: single-select toggle, capped at 100 chips, **hidden by default** (toggle button to show)
- Location: select dropdown, "All locations" default
- Sort options: views (default), posted date, created date, city, location
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
- `cn()` for class merging
- Brutalist design: `border-2`, `shadow-brutal`, bold uppercase text

## SEO & Analytics

- `constants/seo.ts`: `SITE_CONFIG`, `SITE_METADATA` (full Next.js Metadata with OG/Twitter/robots)
- `lib/seo.ts`: `siteUrl()`, `buildMetadata()` per-page metadata builder
- `lib/schema.ts`: JSON-LD schemas (global + per-page)
- `GoogleAnalytics`: gated to production + non-empty `GOOGLE_ANALYTICS_ID` (currently empty — disabled)
- `VercelAnalytics`: exists but not wired in layout

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

- Vitest, node environment, `globals: true`
- Test files: `adapt.test.ts`, `cn.test.ts`, `format.test.ts`, `instagram.test.ts`, `filterVideos.test.ts`, `constants/__tests__/constants.test.ts`, `lib/__tests__/` files
- Covers: DB adapters, class merging, formatting utilities, Instagram URL parsing, filter logic, constants validation
- No component tests or E2E tests

## Not Wired / Known Gaps

- `VercelAnalytics` component exists but is not imported in layout
- `SubmitVideoDialog` POSTs to the admin public API endpoint — needs production URL configured in `NEXT_PUBLIC_ADMIN_URL`
- No env files tracked (only `.env.example` with Supabase placeholder values)
- `why-protest-content.tsx` (old) vs `why-protest-data.tsx` (current) — old file kept for reference
