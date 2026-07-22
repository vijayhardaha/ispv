# Reel Vault — Admin Backend Design

**Date:** 2026-07-22
**Project:** Indian Students Protest Vault
**Stack:** Next.js + Supabase + Vercel Blob

## Monorepo Structure

```
apps/
├── frontend/        # Existing Next.js static site (unchanged)
└── admin/           # New Next.js app — auth, API, dashboard
```

Both deployed separately via `vercel --cwd apps/frontend` and `vercel --cwd apps/admin`.

## Database

### Supabase Project

- **Auth:** Built-in Supabase auth, email/password only
- **Storage:** Vercel Blob (separate from Supabase) for thumbnail images
- **Migrations:** Timestamped SQL files in `api/supabase/migrations/`

### Migration Files

```
api/supabase/migrations/
├── 20260722000001_create_extensions.sql
├── 20260722000002_create_tables.sql
├── 20260722000003_enable_rls.sql
├── 20260722000004_create_functions.sql
├── 20260722000005_create_indexes.sql
├── 20260722000006_create_get_videos_rpc.sql
└── 20260722000007_create_submit_video_rpc.sql
```

### Tables

```sql
-- videos
CREATE TABLE public.videos (
  id                uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ig_url            text NOT NULL UNIQUE,

  -- Public submission (raw/unprocessed)
  submitted_tags    text,
  submitted_category text,
  submitted_state   text,
  submitted_city    text,

  -- Curated fields
  category          text REFERENCES public.categories(id),
  state             text,
  city              text,
  tags              text[],
  description       text,

  -- Media
  thumbnail_url     text,

  -- Dates
  ig_post_date      timestamptz,
  created_at        timestamptz DEFAULT NOW(),
  updated_at        timestamptz DEFAULT NOW(),

  -- Workflow
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  enriched_by       uuid REFERENCES auth.users(id)
);

-- categories (seeded from frontend constants, editable via admin)
CREATE TABLE public.categories (
  id              text PRIMARY KEY,
  label           text NOT NULL,
  color           text NOT NULL,
  description     text
);

-- states (fixed dropdown)
CREATE TABLE public.states (
  id    serial PRIMARY KEY,
  name  text NOT NULL UNIQUE
);
```

### Extensions

- `uuid-ossp` — for `uuid_generate_v4()`
- `pg_trgm` — for trigram search on tags/description (in `extensions` schema)

### Functions

- `update_updated_at_column()` — trigger function for `updated_at` auto-update on `videos`
- `get_videos_for_api(filters jsonb)` — RPC returning paginated/filtered video list as JSON
- `submit_video(p_ig_url text, p_tags text, p_category text, p_state text, p_city text)` — RPC for public submission, `SECURITY DEFINER`, `GRANT EXECUTE TO anon`

### Indexes

- `idx_videos_status` on `videos(status)`
- `idx_videos_category` on `videos(category)`
- `idx_videos_created_at` on `videos(created_at DESC)`
- `idx_videos_ig_post_date` on `videos(ig_post_date DESC)`
- `idx_videos_status_created_at` composite on `videos(status, created_at DESC)`

### RLS Policies

| Table        | Role            | Policy                                                                  |
| ------------ | --------------- | ----------------------------------------------------------------------- |
| `videos`     | `anon`          | `SELECT` where `status = 'published'` (public frontend reads published) |
| `videos`     | `authenticated` | `ALL` (admin can CRUD)                                                  |
| `categories` | `anon`          | `SELECT`                                                                |
| `categories` | `authenticated` | `ALL`                                                                   |
| `states`     | `anon`          | `SELECT`                                                                |
| `states`     | `authenticated` | `ALL`                                                                   |

## Admin Pages

| Page       | Route         | Description                                                        |
| ---------- | ------------- | ------------------------------------------------------------------ |
| Login      | `/login`      | Supabase email/password sign-in                                    |
| Dashboard  | `/`           | Stats cards: total / draft / pending_review / published / rejected |
| Videos     | `/videos`     | Table with status filter tabs + Add/Edit modal                     |
| Categories | `/categories` | Table + Add/Edit modal (CRUD)                                      |
| States     | `/states`     | Table + Add/Edit modal (CRUD)                                      |

### Videos Table Columns

Thumbnail (small), ig_url, city, category (colored badge), status badge, ig_post_date, created_at, edit button.

### Video Edit Modal Fields

- ig_url (readonly text input)
- Category (dropdown from `categories` table)
- State (dropdown from `states` table)
- City (text input)
- Tags (text input, comma-separated, stored as `text[]`)
- Description (textarea)
- ig_post_date (date picker)
- Thumbnail (preview + upload button → Vercel Blob)
- Status dropdown (draft / pending_review / published / rejected)

## API Routes

| Method | Path               | Auth            | Purpose                     |
| ------ | ------------------ | --------------- | --------------------------- |
| POST   | `/api/submit`      | `anon`          | Public video URL submission |
| POST   | `/api/enrich`      | Bearer token¹   | Chrome extension enrichment |
| GET    | `/api/videos`      | `authenticated` | List videos (admin)         |
| GET    | `/api/videos/[id]` | `authenticated` | Get single video            |
| PUT    | `/api/videos/[id]` | `authenticated` | Update video                |
| DELETE | `/api/videos/[id]` | `authenticated` | Delete video                |
| POST   | `/api/upload`      | `authenticated` | Upload image to Vercel Blob |

¹ Chrome extension sends a shared API token (env var) to authenticate.

## Data Flow

### Public Submission

1. User fills form on frontend website → `POST /api/submit`
2. Creates video record with `status = 'draft'`, populated `submitted_*` fields
3. Admin sees it in the dashboard under "Draft" tab

### Chrome Extension Enrichment

1. Admin opens Instagram URL in browser
2. Clicks + button in extension
3. Extension sends `POST /api/enrich` with `{ ig_url, og_image, ig_post_date }`
4. Server finds existing record by `ig_url` or creates new draft
5. Updates `ig_post_date`, `og_image_url` (later downloaded to Vercel Blob)

### Admin Curation

1. Admin navigates to `/videos`
2. Filters by status, finds draft/pending entries
3. Opens edit modal, fills curated fields (category, state, city, tags)
4. Uploads thumbnail (downloads from og:image URL or uploads manually)
5. Sets `ig_post_date` from the Instagram post
6. Changes status to `published`
7. Frontend site regenerates/rebuilds to reflect new published videos

## Hosting

- **Admin app:** Vercel (separate deployment from frontend)
- **Database:** Supabase (shared between admin API and frontend queries)
- **Image storage:** Vercel Blob
- **Auth:** Supabase Auth (email/password)
