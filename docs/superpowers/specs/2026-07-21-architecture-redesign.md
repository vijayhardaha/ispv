# Architecture Redesign — Indian Students Protest Vault

**Date**: 2026-07-21
**Status**: Draft
**Author**: AI agent (build agent)

---

## 1. Motivation

The current codebase has accumulated several architectural issues that hinder scalability:

- ReelPlayer state management duplicated across 5 components
- Filter/search logic duplicated across 2 pages
- Tone color system triplicated across 3 UI components
- Dead code (3 unused utilities, 1 unused component, 1 backup file)
- Placeholder variables leaking into production code
- Missing `'use client'` directive on FilterBar
- No shared hooks directory
- Single monolithic utils.ts mixing unrelated concerns
- Monolithic data/videos.ts mixing types, constants, raw data, and helpers

The goal is a scalable directory layout with clear module boundaries, feature-adjacent data placement, and shadcn/ui compatibility.

---

## 2. Directory Structure

```
src/
├── app/                    # Next.js App Router (unchanged)
├── components/
│   ├── ui/                 # shadcn CLI primitives — kept as-is for compatibility
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Dropdown.tsx
│   │   └── Container.tsx   # Unused — cleanup task
│   ├── layout/             # App chrome
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── shared/             # Reusable domain chunks
│   │   ├── VideoCard.tsx
│   │   ├── ReelPlayer.tsx
│   │   ├── ReelPlayerProvider.tsx    # Imports context from hooks/, renders overlay
│   │   ├── FilterBar.tsx
│   │   └── Pagination.tsx
│   └── features/           # Page-section assemblies
│       ├── HeroSection.tsx
│       ├── SloganTicker.tsx
│       ├── FeaturedVideos.tsx
│       ├── CategorySection.tsx
│       ├── CitiesMap.tsx
│       ├── SubmitVideoDialog.tsx
│       └── FlagStripe.tsx
├── data/
│   ├── videos.ts           # VideoEntry/VideoCategory types + 80 raw video records
│   └── slogans.ts          # Slogan strings (unchanged)
├── constants/              # Shared constants
│   ├── categories.ts       # CATEGORIES array (extracted from videos.ts)
│   └── colors.ts           # Tone type + toneMap (single source for Card/Dialog/Badge)
├── hooks/
│   ├── useReelPlayer.ts    # Creates context, exports hook + context
│   └── useFilterState.ts   # Shared filter state management
├── lib/                    # Single-purpose utilities
│   ├── cn.ts               # cn() class merge utility
│   ├── instagram.ts        # extractInstagramId()
│   └── format.ts           # formatNumber(), timeAgo() — for future use
├── helpers/                # Pure computation helpers
│   └── filterVideos.ts     # filterVideos(videos, state) — shared filter logic
└── index.css               # Global styles (unchanged)
```

**Key decisions**:

- No `types/` directory — types stay in their source files, exported when cross-file use is needed
- `components/ui/` preserved for shadcn CLI compatibility
- All page-section components (HeroSection, SloganTicker, etc.) flatten into `features/` instead of `home/`

---

## 3. Component Layer Boundaries

Dependency rules — each layer can only import from the layers below it:

| Layer       | Contains                                | Can import from                                           |
| ----------- | --------------------------------------- | --------------------------------------------------------- |
| `ui/`       | Primitives (Button, Card, Dialog…)      | `lib/`, `constants/`                                      |
| `layout/`   | App chrome (Header, Footer)             | `ui/`, `lib/`, `constants/`, `shared/`                    |
| `shared/`   | Reusable chunks (VideoCard, FilterBar…) | `ui/`, `lib/`, `constants/`, `data/`, `hooks/`            |
| `features/` | Page sections (HeroSection, CitiesMap…) | `shared/`, `ui/`, `lib/`, `constants/`, `data/`, `hooks/` |

**Direction**: `ui/` ← `shared/` ← `features/` — never the reverse.

---

## 4. State Management — ReelPlayerProvider

A React context replaces the duplicated `useState<VideoEntry | null>` pattern across 5 components.

**Files**:

- `src/hooks/useReelPlayer.ts` — creates the React context, exports `ReelPlayerContext` and `useReelPlayer()` consumer hook
- `src/components/shared/ReelPlayerProvider.tsx` — imports context, renders `<ReelPlayer>` overlay when active, provides context to children
- `src/components/shared/ReelPlayer.tsx` — the overlay modal (logic unchanged, reads from context)

**Provider role**:

- Wraps children
- Manages `activeVideo: VideoEntry | null` internally
- Renders `<ReelPlayer>` as a portal when active
- `useReelPlayer()` returns `{ play(video), close(), active, setActive }`

**Integration**:

- `<ReelPlayerProvider>` wraps `<Header>` + `<main>` + `<Footer>` in `layout.tsx`
- Any component calls `const { play } = useReelPlayer()` then `play(video)` on click
- All 5 existing `<ReelPlayer>` instances and their state are removed from individual components

---

## 5. Data Layer

**`src/data/videos.ts`** — canonical source for:

- `VideoEntry` interface (exported)
- `VideoCategory` type (exported)
- `VIDEOS` array (80 records, built from `buildVideos()`)
- `getVideoById(id)` — lookup helper
- `getVideosByCity(city)` — new, was missing from docs
- `getVideosByCategory(cat)` — new, was missing from docs
- `getAllCities()` — new, was missing from docs

**`src/constants/categories.ts`** — extracted from `videos.ts`:

- `CATEGORIES` array
- `ALL_TAGS`, `ALL_HASHTAGS` computed arrays

**`src/constants/colors.ts`** — shared tone system:

- `Tone` type (union literal: `'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime'`)
- `toneMap` record mapping tone → Tailwind class string
- Imported by `ui/Card`, `ui/Dialog`, `ui/Badge` — removing the triple duplication

**`src/helpers/filterVideos.ts`** — single source for filter logic:

- `filterVideos(videos: VideoEntry[], state: FilterState): VideoEntry[]`
- Used by both `VideosPage` and `CategoryPage`

---

## 6. Hooks & Utilities

### Hooks (`src/hooks/`)

| Hook             | API                                    | Purpose                                                     |
| ---------------- | -------------------------------------- | ----------------------------------------------------------- |
| `useReelPlayer`  | `{ play(v), close(), active }`         | Creates ReelPlayer context, exports context + consumer hook |
| `useFilterState` | `{ state, setState, filtered, total }` | FilterState management + URL sync + filter                  |

`useFilterState` encapsulates:

- `useState<FilterState>`
- `useMemo` for `filterVideos(videos, state)`
- `useEffect` → `useSearchParams` sync for URL persistence
- Exports `state`, `setState`, `filtered`, `total`

`useReelPlayer` (in `src/hooks/`) creates the React context. The `<ReelPlayerProvider>` component in `shared/` imports this context, renders `<ReelPlayer>`, and provides the consumer hook. Context definition lives in `hooks/`, the provider component lives in `shared/`.

### Lib (`src/lib/`)

| File           | Functions                         | Notes                         |
| -------------- | --------------------------------- | ----------------------------- |
| `cn.ts`        | `cn(...inputs)`                   | From current utils.ts         |
| `instagram.ts` | `extractInstagramId(url)`         | From current utils.ts         |
| `format.ts`    | `formatNumber(n)`, `timeAgo(iso)` | Currently unused — future use |

### Helpers (`src/helpers/`)

| File              | Functions                                                              |
| ----------------- | ---------------------------------------------------------------------- |
| `filterVideos.ts` | `filterVideos(videos: VideoEntry[], state: FilterState): VideoEntry[]` |

---

## 7. Implied Cleanup Tasks (not designed, listed for implementation)

These are identified issues to fix during implementation, not part of the architecture design:

1. Remove `Button.backup.tsx` (dead file)
2. Remove `Container.tsx` (unused component) or start using it
3. Fix `__VG_EMAIL_...` placeholder in `Footer.tsx`
4. Fix `__VG_IPV4_...` placeholders in `FlagStripe.tsx`
5. Add missing `'use client'` directive to `FilterBar.tsx`
6. Remove `'use client'` from `AboutPage` (no client logic)
7. Delete unused utilities from old `utils.ts` (after extraction)
8. Fix `animate-snapIn` — either define the keyframe or remove the class
9. Add page-specific metadata to pages that can have it (server components)
