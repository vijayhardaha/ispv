# Admin Knowledge Base

## Stack

- **Package:** `@ispv/admin` (part of the `ispv` monorepo)
- **Framework:** Next.js ^16.2.11 (App Router, Turbopack)
- **Language:** TypeScript ^6.0.3, React ^19.2.8
- **Styling:** Tailwind CSS ^4.3.3 (`@tailwindcss/postcss`), `tw-animate-css` ^1.4.0
- **UI Primitives:** Radix UI (Dialog, Select, Slot) — via apps/frontend, not direct
- **Icons:** lucide-react
- **Database:** Supabase (server client via `@supabase/ssr` ^0.12.3, browser client via `@supabase/supabase-js` ^2.110.8)
- **Blob Storage:** `@vercel/blob` ^2.6.1 (thumbnails)
- **Image Processing:** sharp ^0.35.3 (thumbnail optimisation)
- **Validation:** Zod ^4.4.3, server-side via schemas (submitVideoBodySchema, enrichVideoBodySchema, videoFormSchema)
- **Redis:** `@upstash/redis` ^1.38.0 (rate limiting, fallback to in-memory)
- **Testing:** Vitest ^4.1.10 (node env, 16 test files — utilities + API routes)
- **Linting:** ESLint via `@vijayhardaha/dev-config` ^2.2.0

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (auth guard, SkipContent, AdminSidebar + AdminMain + AdminFooter)
│   ├── loading.tsx             # Loading fallback
│   ├── error.tsx               # Error boundary
│   ├── Providers.tsx           # ToastProvider + QueryProvider wrapper
│   ├── page.tsx                # Dashboard — status counts, categories with counts, locations with counts
│   ├── login/page.tsx          # Login page with email/password
│   └── videos/
│       ├── page.tsx            # Videos CRUD table (filterable, paginated, bulk actions, inline status)
│       ├── useVideosPageState.ts  # Composes useVideosLoader + useVideosSelection + useVideosActions
│       ├── useVideosLoader.ts     # Data fetching, URL params, pagination
│       ├── useVideosSelection.ts  # Checkbox selection state
│       └── useVideosActions.ts    # Single/bulk/inline status actions
├── app/api/
│   ├── auth/               # Authenticated API routes (behind Supabase auth)
│   │   ├── videos/         # GET list, POST create
│   │   ├── videos/[id]/    # PUT update, POST single action (trash/restore/delete)
│   │   ├── videos/bulk/    # POST bulk action
│   │   ├── views/          # POST view count increment
│   │   ├── enrich/         # POST enrich metadata (Node.js runtime, sharp-based thumbnail processing)
│   │   └── submit/         # POST create from admin form
│   └── public/             # Public API routes (no auth, rate-limited)
│       ├── submit/         # POST video submission from frontend
│       ├── views/          # POST view count increment
│       └── check-video/    # GET duplicate check
├── components/
│   ├── layout/             # AdminSidebar, AdminMain, AdminFooter, SkipContent
│   ├── ui/                 # Button, Container, Box, Select, Modal, Pagination, SearchInput, DeleteConfirmDialog
│   ├── VideoFormModal.tsx  # Add/edit video modal form
│   ├── LogoutButton.tsx
│   └── Toast.tsx           # Toast notification component + useToast hook
├── constants/              # categories.ts, colors.ts, locations.ts, navlinks.ts, seo.ts, status.ts
├── hooks/                  # usePagination.ts
├── lib/
│   ├── api-utils.ts        # requireUser, jsonError, deleteVideoById, createServiceSupabase, checkDuplicate
│   ├── cn.ts               # clsx + tailwind-merge
│   ├── instagram.ts        # extractIgId, detectSource, displayVideoUrl, reconstructIgUrl
│   ├── rateLimit.ts        # checkRateLimit (Upstash Redis + in-memory fallback)
│   ├── rpc.ts              # getVideosForApi (pagination-aware RPC)
│   ├── schemas.ts          # Zod schemas: submitVideoBodySchema, enrichVideoBodySchema, videoFormSchema + VideoRecord interface
│   ├── types.ts            # Re-exports VideoRecord, defines GetVideosApiResponse, PaginationMeta
│   ├── supabase.ts         # createClient (browser client)
│   ├── supabase-server.ts  # createServerSupabase (server client with cookies)
│   ├── seo.ts              # siteUrl
│   ├── upload.ts           # sanitizeFilename, uploadBuffer, deleteBlob (Vercel Blob)
│   └── rateLimit.ts        # checkRateLimit (Upstash Redis + in-memory fallback)
└── proxy.ts                # Middleware: auth guard, CSRF, security headers, rate limiting
```

## Authentication

- Supabase Auth with email/password
- Middleware (`proxy.ts`) protects all routes except `/login` and `/api/public/*`
- API routes use `createServerSupabase()` to verify session via cookies
- The middleware also refreshes expired access tokens transparently
- `/api/auth/enrich` uses a separate Bearer token (`ENRICH_API_TOKEN`) for extension API access

## API Routes

| Route                     | Method | Auth         | Runtime | Purpose                                 |
| ------------------------- | ------ | ------------ | ------- | --------------------------------------- |
| `/api/auth/videos`        | GET    | Required     | Edge    | List all videos (paginated, filterable) |
| `/api/auth/videos`        | POST   | Required     | Edge    | Create video                            |
| `/api/auth/videos/[id]`   | PUT    | Required     | Edge    | Update video                            |
| `/api/auth/videos/[id]`   | POST   | Required     | Edge    | Single action (trash/restore/delete)    |
| `/api/auth/videos/bulk`   | POST   | Required     | Edge    | Bulk action                             |
| `/api/auth/views`         | POST   | Required     | Edge    | Increment view count                    |
| `/api/auth/enrich`        | POST   | Bearer token | Node.js | Enrich video metadata (thumbnail)       |
| `/api/auth/submit`        | POST   | Required     | Edge    | Create from admin form                  |
| `/api/public/submit`      | POST   | Public       | Edge    | Frontend video submission               |
| `/api/public/views`       | POST   | Public       | Edge    | Public view count increment             |
| `/api/public/check-video` | GET    | Public       | Edge    | Check if video already exists           |

## Data Schema (Supabase)

### `videos` table

| Column            | Type        | Notes                                           |
| ----------------- | ----------- | ----------------------------------------------- |
| `id`              | UUID        | Primary key                                     |
| `video_url`       | text        | Original Instagram URL                          |
| `video_id`        | text        | Extracted Instagram media ID                    |
| `video_src`       | text        | 'instagram' or 'youtube'                        |
| `categories`      | text[]      | Category slugs (multiple allowed)               |
| `location`        | text        | Location slug                                   |
| `city`            | text        | City name                                       |
| `tags`            | text[]      | Searchable tags                                 |
| `description`     | text        | Video description                               |
| `thumbnail_url`   | text        | Vercel Blob URL                                 |
| `video_post_date` | timestamptz | Instagram post date                             |
| `view_count`      | integer     | View counter                                    |
| `status`          | text        | draft/published/rejected/trashed                  |
| `trashed_at`      | timestamptz | Soft-delete timestamp                           |
| `created_at`      | timestamptz | Record creation                                 |
| `updated_at`      | timestamptz | Last update                                     |

### RPC Functions

| Function             | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `get_videos_for_api` | Paginated video list with filtering          |
| `get_tags`           | Tag frequency for autocomplete               |
| `submit_video`       | Atomic video submission with duplicate check |
| `increment_view`     | View count increment                         |

## Videos Page Architecture

The videos page (`app/videos/page.tsx`) is the most complex component. Its state is split across 3 custom hooks:

1. **`useVideosLoader`** — Manages data fetching (trashed vs normal), URL filter params (status, search, category, location, sort, page), pagination, status tab counts, and `applyFilters`
2. **`useVideosSelection`** — Manages checkbox selection, select-all, and indeterminate state
3. **`useVideosActions`** — Handles single actions (trash/restore/delete), bulk actions, and inline status changes

These are composed by `useVideosPageState` which also adds modal UI state (edit/showAdd).

### Sub-components

- `VideosPageHeader` — Title + Add Video button
- `StatusTabs` — Status links with counts (All / Draft / Pending / Published / Rejected / Trashed), URL-param driven
- `SearchInput` — Search box + submit button with icon/label, syncs `?q=` on submit
- `VideosToolbar` — Row 2 toolbar: bulk action select + Apply/Clear, category/location filter dropdowns + Filter/Reset, results count + pagination on the right
- `VideosTable` — Sortable table with header, VideoRow per entry
- `VideoRow` — Single table row with checkbox, thumbnail, URL, city, category badge, tags, status cell, dates, actions
- `CategoryBadge` — Coloured category chip
- `StatusCell` — Inline status dropdown (active) or static badge (trashed)
- `VideoActions` — Edit/Trash or Restore/Purge buttons
- `Td` — Consistent table cell wrapper

### Page layout (WordPress-style)

- **Row 1:** Status tabs (left) + search input with submit button (right)
- **Row 2:** Bulk action dropdown + Apply, then category/location filter dropdowns + Filter/Reset, then results count + pagination (right)
- **After table:** results count + pagination only (no bulk controls)

### URL param system

- All filters, sorting, and pagination read from and write to URL search params (`status`, `q`, `category`, `location`, `sort`, `dir`, `page`) — the page reloads data from the URL instead of local state
- Status tabs and pagination are plain links carrying the params; category/location dropdowns are staged locally and applied via the Filter button (`applyFilters`)
- `useVideosLoader` fetches per-status counts once on mount via `get_dashboard_stats` for the status tabs

### VideoFormModal

- Modal for creating/editing videos
- Fields: Instagram URL, Categories (checkbox multi-select), Status (radio buttons), Location (with "—" placeholder), City, Tags, Description
- Category state is a `string[]` of slugs; empty selection sends `null`
- Status radios cover draft/published/rejected; defaults to "draft"
- Location defaults to "delhi"
- URL field is disabled when editing
- Modal content scrolls when taller than the viewport (overflow-y-auto overlay)

## Rate Limiting

- Public endpoints (`/api/public/*`) are rate-limited via `checkRateLimit()`
- Uses Upstash Redis when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- Falls back to in-memory Map when Redis is unavailable
- Separate limiters for submit (5/min/IP) and views

## Security

- **CSRF protection**: Origin header validation in middleware for state-changing requests
- **Security headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- **Request size**: 100 KB max for API request bodies
- **Private IP blocking**: Thumbnail enrichment blocks SSRF via DNS lookups + private IP range checks
- **Soft delete**: Videos are trashed (not deleted) by default; permanent delete is a separate action
- **Auth**: All admin routes require valid Supabase session except `/login` and `/api/public/*`

## Testing

- Vitest ^4.1.10, node environment
- Test files: `auth-videos.test.ts`, `auth-videos-id.test.ts`, `auth-bulk.test.ts`, `auth-enrich.test.ts`, `auth-submit-views.test.ts`, `public-submit.test.ts`, `public-views.test.ts`, `public-check-video.test.ts`, `status.test.ts`, `constants.test.ts`, `cn.test.ts`, `instagram.test.ts`, `rateLimit.test.ts`, `rpc.test.ts`, `seo.test.ts`, `upload.test.ts`
- Covers: API route handlers, constants validation, URL parsing, rate limiting, RPC, class merging, SEO, upload
- No component tests or E2E tests

## Configuration

- `next.config.ts` — Image remote patterns for Instagram CDN, Vercel Blob, Unsplash
- All Supabase + Vercel env vars in `.env.local` (not tracked in git)
- Edge runtime for most API routes, Node.js for enrich route (sharp dependency)
- `vercel.json` — Build: `bun run build`, install: `bun install`
