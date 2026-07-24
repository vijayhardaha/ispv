# Admin Knowledge Base

## Stack

- **Framework:** Next.js 16 (App Router, Turbopak)
- **Language:** TypeScript 6, React 19
- **Styling:** Tailwind CSS 4, `tw-animate-css`
- **UI Primitives:** Radix UI (Dialog, Select, Slot)
- **Icons:** lucide-react
- **Database:** Supabase (server client via `@supabase/ssr`, browser client via `@supabase/supabase-js`)
- **Blob Storage:** Vercel Blob (thumbnails)
- **Image Processing:** sharp (thumbnail optimisation)
- **Validation:** Zod, server-side via schemas
- **Testing:** Vitest (node env, 8 test files — utilities + API routes)
- **Linting:** ESLint via `@vijayhardaha/dev-config`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (auth guard, SkipContent, AdminHeader, AdminMain, AdminFooter)
│   ├── page.tsx                # Dashboard — status counts, categories with counts, locations with counts
│   ├── Providers.tsx           # ToastProvider + QueryProvider wrapper
│   ├── login/page.tsx          # Login page with email/password
│   ├── videos/
│   │   ├── page.tsx            # Videos CRUD table (filterable, paginated, bulk actions, inline status)
│   │   ├── useVideosPageState.ts  # Composes useVideosLoader + useVideosSelection + useVideosActions
│   │   ├── useVideosLoader.ts     # Data fetching, URL params, pagination
│   │   ├── useVideosSelection.ts  # Checkbox selection state
│   │   └── useVideosActions.ts    # Single/bulk/inline status actions
│   └── api/
│       ├── auth/               # Authenticated API routes (behind Supabase auth)
│       │   ├── videos/         # GET list, POST create, PUT update, POST single action
│       │   ├── videos/[id]/    # PUT update, POST single action (trash/restore/delete)
│       │   ├── videos/bulk/    # POST bulk action
│       │   ├── views/          # POST view count increment (auth version)
│       │   ├── enrich/         # POST enrich metadata (nodejs, sharp-based thumbnail processing)
│       │   └── submit/         # POST create from admin form
│       └── public/             # Public API routes (no auth, rate-limited)
│           ├── submit/         # POST video submission from frontend
│           └── views/          # POST view count increment
├── components/
│   ├── layout/                 # AdminHeader, AdminMain, AdminFooter, SkipContent
│   ├── ui/                     # Button, Container, Box, Select, Modal, Pagination, SearchInput, DeleteConfirmDialog
│   └── features/               # VideoFormModal, LogoutButton, Toast
├── constants/                  # categories, colors, locations, navlinks, seo, status
├── hooks/                      # usePagination
├── lib/
│   ├── api-utils.ts            # requireUser, jsonError, deleteVideoById, createServiceSupabase, checkDuplicate
│   ├── cn.ts                   # clsx + tailwind-merge
│   ├── instagram.ts            # extractIgId, detectSource, displayVideoUrl, reconstructIgUrl
│   ├── rateLimit.ts            # checkRateLimit (Upstash Redis + in-memory fallback)
│   ├── rpc.ts                  # getVideosForApi (pagination-aware RPC)
│   ├── schemas.ts              # Zod schemas: submitVideoBody, enrichVideoBody, videoForm
│   ├── types.ts                # VideoRecord, GetVideosApiResponse, PaginationMeta (re-exports)
│   ├── supabase.ts             # createClient (browser client)
│   ├── supabase-server.ts      # createServerSupabase (server client with cookies)
│   └── upload.ts               # uploadBuffer (Vercel Blob)
└── proxy.ts                    # Middleware: auth guard, CSRF, security headers, rate limiting
```

## Authentication

- Supabase Auth with email/password
- Middleware (`proxy.ts`) protects all routes except `/login` and `/api/public/*`
- API routes use `createServerSupabase()` to verify session via cookies
- The middleware also refreshes expired access tokens transparently

## API Routes

| Route                   | Method | Auth         | Runtime | Purpose                              |
| ----------------------- | ------ | ------------ | ------- | ------------------------------------ |
| `/api/auth/videos`      | GET    | Required     | Edge    | List all videos                      |
| `/api/auth/videos`      | POST   | Required     | Edge    | Create video                         |
| `/api/auth/videos/[id]` | PUT    | Required     | Edge    | Update video                         |
| `/api/auth/videos/[id]` | POST   | Required     | Edge    | Single action (trash/restore/delete) |
| `/api/auth/videos/bulk` | POST   | Required     | Edge    | Bulk action                          |
| `/api/auth/views`       | POST   | Required     | Edge    | Increment view count                 |
| `/api/auth/enrich`      | POST   | Bearer token | Node.js | Enrich video metadata (thumbnail)    |
| `/api/auth/submit`      | POST   | Required     | Edge    | Create from admin form               |
| `/api/public/submit`    | POST   | Public       | Edge    | Frontend video submission            |
| `/api/public/views`     | POST   | Public       | Edge    | Public view count increment          |

## Data Schema (Supabase)

### `videos` table

| Column            | Type        | Notes                                           |
| ----------------- | ----------- | ----------------------------------------------- |
| `id`              | UUID        | Primary key                                     |
| `video_url`       | text        | Original Instagram URL                          |
| `video_id`        | text        | Extracted Instagram media ID                    |
| `video_src`       | text        | 'instagram' or 'youtube'                        |
| `category`        | text        | Category slug                                   |
| `location`        | text        | Location slug                                   |
| `city`            | text        | City name                                       |
| `tags`            | text[]      | Searchable tags                                 |
| `description`     | text        | Video description                               |
| `thumbnail_url`   | text        | Vercel Blob URL                                 |
| `video_post_date` | timestamptz | Instagram post date                             |
| `view_count`      | integer     | View counter                                    |
| `status`          | text        | draft/pending_review/published/rejected/trashed |
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

1. **`useVideosLoader`** — Manages data fetching (trashed vs normal), URL filter params (status, search), and pagination
2. **`useVideosSelection`** — Manages checkbox selection, select-all, and indeterminate state
3. **`useVideosActions`** — Handles single actions (trash/restore/delete), bulk actions, and inline status changes

These are composed by `useVideosPageState` which also adds modal UI state (edit/showAdd).

### Sub-components

- `VideosPageHeader` — Title + Add Video button
- `VideosFilterBar` — Search input + status dropdown + reset
- `BulkActionsToolbar` — Selection count + bulk action select + apply/clear
- `VideosTable` — Sortable table with header, VideoRow per entry
- `VideoRow` — Single table row with checkbox, thumbnail, URL, city, category badge, tags, status cell, dates, actions
- `CategoryBadge` — Coloured category chip
- `StatusCell` — Inline status dropdown (active) or static badge (trashed)
- `VideoActions` — Edit/Trash or Restore/Purge buttons
- `Td` — Consistent table cell wrapper

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

- Vitest, node environment
- Test files cover: constants, API routes, instagram utilities, cn, schemas
- No component tests or E2E tests

## Configuration

- `next.config.ts` — Image remote patterns for Instagram CDN, Vercel Blob
- All Supabase + Vercel env vars in `.env.local` (not tracked in git)
- Edge runtime for most API routes, Node.js for enrich route (sharp dependency)
