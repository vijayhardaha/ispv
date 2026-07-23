# Frontend Database Implementation Plan

## Current State

- `apps/frontend/src/lib/supabase.ts` — basic Supabase client using anon key
- `apps/frontend/src/lib/adapt.ts` — `VideoRow` type + `dbRowToVideoEntry` mapper
- `apps/frontend/src/data/videos.ts` — `getAllVideosFromDb()` fetches published videos, falls back to hardcoded `VIDEOS`
- `apps/frontend/src/app/page.tsx` — calls `getAllVideosFromDb()` in server component (broken — `useEffect` missing)
- No frontend-specific Supabase migrations or schema files
- All data originates from `apps/admin/` Supabase project (shared across monorepo)

## Architecture

The admin and frontend share a **single Supabase project**. The admin writes data (extension submissions, enrichment, moderation) and the frontend reads published data (public-facing archive).

```
Extension → POST /api/enrich → submit_video() RPC → videos table
                                                      ↓
Frontend → supabase.from('videos').select().eq('status', 'published')
                                                      ↓
                                              dbRowsToVideoEntries()
                                                      ↓
                                              VideoEntry (UI)
```

## Schema Dependencies (Shared with Admin)

Only the `videos` table is consumed by the frontend. Filtered to `status = 'published'`.

### videos table (see `apps/admin/supabase/migrations/20260723000001_initial_schema.sql` for canonical DDL)

| Column          | Type        | Used by frontend | Notes                       |
| --------------- | ----------- | ---------------- | --------------------------- |
| id              | uuid        | Yes              | Mapped to VideoEntry.id     |
| video_url       | text        | Yes              | Mapped to VideoEntry.url    |
| video_id        | text        | No               | Internal                    |
| video_src       | text        | No               | Source platform             |
| category        | text        | Yes              | Category value               |
| location        | text        | Yes              | Mapped to VideoEntry.state  |
| city            | text        | Yes              | Mapped to VideoEntry.city   |
| tags            | text[]      | Yes              | Mapped to VideoEntry.tags   |
| description     | text        | Yes              | Mapped to VideoEntry.desc   |
| thumbnail_url   | text        | Yes              | Mapped to VideoEntry.thumb  |
| video_post_date | timestamptz | No               | Display only                |
| view_count      | integer     | Yes              | Used for featured heuristic |
| status          | text        | Yes              | Filter: `published` only    |
| trashed_at      | timestamptz | No               | Soft-delete support         |
| created_at      | timestamptz | No               | Ordering                    |

### categories table

Not directly queried by the frontend. Category metadata is derived from the `category` column value on the video row and mapped via `CATEGORY_META` in `apps/frontend/src/constants/categories.ts`.

## Current Issues

### 1. Homepage uses `getAllVideosFromDb()` in an async server component

`apps/frontend/src/app/page.tsx:18` calls `await getAllVideosFromDb()`. This works for server rendering but the fallback path (`VIDEOS`) is synchronous — the hardcoded data is always available. This is acceptable for static generation but means the DB fetch happens at request time, slowing down SSR.

**Fix:** Use Next.js `generateStaticParams` + ISR, or fetch at build time in `generateStaticParams` and pass as props.

### 2. `getAllVideosFromDb()` fetches ALL published videos on every call

No pagination, no filtering. For a large archive this will be slow.

**Fix:** Add pagination via `range()` on the Supabase query, or use a dedicated RPC similar to admin's `get_videos_for_api`.

### 3. No migration files in frontend

The frontend has no `supabase/` directory or migration files. All schema lives in `apps/admin/supabase/migrations/`.

**Fix:** Create a shared migration workflow — admin migrations are authoritative. Frontend should document which admin migrations it depends on rather than duplicating them.

> **Note:** All old incremental migrations have been consolidated into a single file:
> `apps/admin/supabase/migrations/20260723000001_initial_schema.sql`

### 4. `VideoEntry.duration` field is deprecated

The frontend maps `duration: 0` from `dbRowToVideoEntry()` because no video player is implemented. The `videos` table has no `duration` column.

**Fix:** Remove `duration` from `VideoEntry` or keep as deprecated/optional for future use.

### 5. `VideoEntry.featured` is derived from `view_count > 1000`

This is a heuristic, not an explicit flag. The admin has no `featured` column on the `videos` table — `view_count` is the proxy.

**Fix:** Add a `featured` boolean column to the `videos` table if editorial control is needed, or accept the view-count heuristic.

## Implementation Steps

### Phase 1: Consolidate Existing Integration (1-2 days)

1. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to frontend `.env.local` (same values as admin)
2. Verify `getAllVideosFromDb()` works end-to-end against production Supabase
3. Remove hardcoded `VIDEOS` fallback once DB data is verified complete
4. Clean up unused hardcoded data arrays (`REEL_IDS`, `THUMBNAILS`, `DESCRIPTIONS`, `SUBMITTERS`, `CITIES`)

### Phase 2: Read-Optimized RPC (2-3 days)

1. Create a new migration `20260722000011_create_get_published_videos_rpc.sql` in admin:

```sql
CREATE OR REPLACE FUNCTION public.get_published_videos(
  p_category text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_page int DEFAULT 1,
  p_per_page int DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  offset_count int := (p_page - 1) * p_per_page;
  result jsonb;
BEGIN
  SELECT COALESCE(JSONB_AGG(row_to_json(t)), '[]'::jsonb) INTO result
  FROM (
    SELECT
      v.id, v.ig_url, v.city, v.state, v.tags,
      v.description, v.thumbnail_url,
      c.name AS category_name, c.color AS category_color,
      COUNT(*) OVER() AS total_count
    FROM public.videos v
    LEFT JOIN public.categories c ON c.value = v.category
    WHERE v.status = 'published'
      AND (p_category IS NULL OR v.category = p_category)
      AND (p_city IS NULL OR LOWER(v.city) = LOWER(p_city))
      AND (p_search IS NULL
        OR v.description ILIKE '%' || p_search || '%'
        OR v.city ILIKE '%' || p_search || '%'
        OR v.tags::text ILIKE '%' || p_search || '%')
      AND (p_tags IS NULL OR v.tags && p_tags)
    ORDER BY v.created_at DESC
    LIMIT p_per_page
    OFFSET offset_count
  ) t;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_videos TO anon, authenticated;
```

2. Create `apps/frontend/src/lib/rpc.ts` with typed wrapper:

```typescript
import { supabase } from "@/lib/supabase";

export interface PublishedVideoRow {
  id: string;
  ig_url: string;
  city: string | null;
  state: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  category_name: string | null;
  category_color: string | null;
  total_count?: number;
}

export interface PublishedVideoFilters {
  category?: string;
  city?: string;
  search?: string;
  tags?: string[];
  page?: number;
  perPage?: number;
}

export interface PublishedVideoResponse {
  videos: PublishedVideoRow[];
  total: number;
}

export async function getPublishedVideos(filters: PublishedVideoFilters = {}): Promise<PublishedVideoResponse> {
  const { data, error } = await supabase.rpc("get_published_videos", {
    p_category: filters.category ?? null,
    p_city: filters.city ?? null,
    p_search: filters.search ?? null,
    p_tags: filters.tags ?? null,
    p_page: filters.page ?? 1,
    p_per_page: filters.perPage ?? 50
  });

  if (error) throw error;

  const videos = (data as unknown as PublishedVideoRow[]) ?? [];
  return { videos, total: videos[0]?.total_count ?? 0 };
}
```

### Phase 3: Remove Hardcoded Data (1 day)

1. Delete hardcoded arrays from `apps/frontend/src/data/videos.ts`: `REEL_IDS`, `THUMBNAILS`, `DESCRIPTIONS`, `SUBMITTERS`, `CITIES`
2. Make `getAllVideosFromDb()` the only data source (no fallback)
3. Remove `VIDEOS`, `ALL_TAGS`, `ALL_HASHTAGS` exports and all synchronous helper functions (`getVideoById`, `getVideosByCity`, etc.)
4. Update all imports across frontend pages and components

### Phase 4: View Tracking (1 day)

1. Add `apps/frontend/src/lib/views.ts`:

```typescript
import { supabase } from "@/lib/supabase";

export async function trackVideoView(videoId: string): Promise<void> {
  await supabase.rpc("increment_video_view", { p_video_id: videoId });
}
```

2. Call `trackVideoView()` from the ReelPlayer component when a video plays

### Phase 5: Featured Videos (0.5 day)

1. Either add `featured` column to `videos` table (admin migration) for editorial control
2. Or keep view-count heuristic and adjust threshold as needed

## Files to Create

| File                               | Purpose                 |
| ---------------------------------- | ----------------------- |
| `apps/frontend/src/lib/rpc.ts`     | Typed RPC wrappers      |
| `apps/frontend/src/lib/views.ts`   | View tracking           |
| `apps/frontend/src/lib/filters.ts` | Filter state + URL sync |

## Files to Modify

| File                                                  | Change                                |
| ----------------------------------------------------- | ------------------------------------- |
| `apps/frontend/src/data/videos.ts`                    | Remove hardcoded fallback             |
| `apps/frontend/src/lib/adapt.ts`                      | Add `PublishedVideoRow` mapping       |
| `apps/frontend/src/app/page.tsx`                      | Use RPC instead of direct table query |
| `apps/frontend/src/components/features/FilterBar.tsx` | Use RPC for filtering                 |
| `apps/frontend/src/components/shared/Pagination.tsx`  | Use RPC total count                   |

## Migration Files to Add

| Location                                           | Purpose                     |
| -------------------------------------------------- | --------------------------- |
| `apps/admin/supabase/migrations/`                  | Frontend read-optimized RPC |

All schema is consolidated into a single file: `apps/admin/supabase/migrations/20260723000001_initial_schema.sql`.

## Rollout Order

1. Phase 1 — verify existing integration works
2. Phase 2 — add RPC + client wrapper (backward compatible)
3. Phase 3 — remove hardcoded data (breaking change)
4. Phase 4 — add view tracking
5. Phase 5 — featured video control

Each phase is independent and can be deployed incrementally.
