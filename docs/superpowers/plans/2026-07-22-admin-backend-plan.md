# Admin Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js admin app with Supabase backend for managing the Indian Students Protest Vault video archive.

**Architecture:** Monorepo with `apps/admin` (Next.js) + `api/supabase/migrations` (SQL). Supabase for auth/DB/RPCs, Vercel Blob for images. Admin pages use Supabase client-side auth + server components for data fetching via Supabase client.

**Tech Stack:** Next.js ^16.2, Supabase JS client, Vercel Blob, Tailwind CSS

## Global Constraints

- Node requirement: ^20
- Package manager: Bun
- Admin app port: 3001 (dev)
- Database schema namespaced under `public` schema, extensions under `extensions` schema
- All CRUD modals use client components, data fetching via server components or server actions
- RLS policies: `anon` gets read on published videos + categories + states; `authenticated` gets all

## File Structure

```
apps/admin/
├── package.json
├── next.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard
│   │   ├── login/page.tsx
│   │   ├── videos/page.tsx
│   │   ├── categories/page.tsx
│   │   └── states/page.tsx
│   ├── components/
│   │   ├── VideoFormModal.tsx
│   │   ├── CategoryFormModal.tsx
│   │   └── StateFormModal.tsx
│   ├── lib/
│   │   └── supabase.ts
│   └── api/
│       ├── submit/route.ts
│       ├── enrich/route.ts
│       ├── videos/route.ts
│       ├── videos/[id]/route.ts
│       └── upload/route.ts
api/supabase/migrations/
├── 20260722000001_create_extensions.sql
├── 20260722000002_create_tables.sql
├── 20260722000003_enable_rls.sql
├── 20260722000004_create_functions.sql
├── 20260722000005_create_indexes.sql
├── 20260722000006_create_get_videos_rpc.sql
├── 20260722000007_create_submit_video_rpc.sql
└── 20260722000008_create_increment_view_rpc.sql
```

---

### Task 1: Scaffold apps/admin Next.js project

**Files:**

- Create: `apps/admin/package.json`
- Create: `apps/admin/next.config.ts`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/src/app/layout.tsx`

**Interfaces:**

- Produces: Working Next.js dev server at port 3001 with Tailwind + Supabase client

- [ ] **Step 1: Create package.json**

Create `apps/admin/package.json`:

```json
{
  "name": "reel-vault-admin",
  "version": "0.1.0",
  "private": true,
  "scripts": { "dev": "next dev -p 3001", "build": "next build", "start": "next start -p 3001" },
  "dependencies": {
    "next": "^16.2.10",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.6.0",
    "@vercel/blob": "^0.27.0",
    "lucide-react": "^1.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "tailwindcss": "^4.3.3",
    "@tailwindcss/postcss": "^4.3.3",
    "postcss": "^8.5.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

`apps/admin/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

`apps/admin/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.mjs**

`apps/admin/postcss.config.mjs`:

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

- [ ] **Step 5: Create root layout with Tailwind**

`apps/admin/src/app/layout.tsx`:

```tsx
import type { JSX, ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Install dependencies**

Run: `cd apps/admin && bun install`

- [ ] **Step 7: Verify dev server starts**

Run: `cd apps/admin && timeout 10 bun run dev 2>&1 || true`
Expected: Next.js starts on port 3001 without errors

- [ ] **Step 8: Commit**

```bash
git add apps/admin/package.json apps/admin/next.config.ts apps/admin/tsconfig.json apps/admin/postcss.config.mjs apps/admin/src/app/layout.tsx
git commit -m "feat: scaffold admin Next.js app"
```

---

### Task 2: Create Supabase migrations

**Files:**

- Create: `api/supabase/migrations/20260722000001_create_extensions.sql`
- Create: `api/supabase/migrations/20260722000002_create_tables.sql`
- Create: `api/supabase/migrations/20260722000003_enable_rls.sql`
- Create: `api/supabase/migrations/20260722000004_create_functions.sql`
- Create: `api/supabase/migrations/20260722000005_create_indexes.sql`
- Create: `api/supabase/migrations/20260722000006_create_get_videos_rpc.sql`
- Create: `api/supabase/migrations/20260722000007_create_submit_video_rpc.sql`

**Interfaces:**

- Produces: Complete Supabase schema with tables, RLS, functions, indexes

- [ ] **Step 1: Create extensions**

`api/supabase/migrations/20260722000001_create_extensions.sql`:

```sql
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";
ALTER ROLE authenticator SET search_path TO public, extensions;
ALTER ROLE postgres SET search_path TO public, extensions;
```

- [ ] **Step 2: Create tables**

`api/supabase/migrations/20260722000002_create_tables.sql`:

```sql
CREATE TABLE public.videos (
  id                uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ig_url            text NOT NULL UNIQUE,
  submitted_tags    text,
  submitted_category text,
  submitted_state   text,
  submitted_city    text,
  category          text REFERENCES public.categories(id),
  state             text,
  city              text,
  tags              text[],
  description       text,
  thumbnail_url     text,
  ig_post_date      timestamptz,
  view_count        integer DEFAULT 0,
  created_at        timestamptz DEFAULT NOW(),
  updated_at        timestamptz DEFAULT NOW(),
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  enriched_by       uuid REFERENCES auth.users(id)
);

CREATE TABLE public.categories (
  id          text PRIMARY KEY,
  label       text NOT NULL,
  color       text NOT NULL,
  description text
);

CREATE TABLE public.states (
  id    serial PRIMARY KEY,
  name  text NOT NULL UNIQUE
);
```

- [ ] **Step 3: Enable RLS**

`api/supabase/migrations/20260722000003_enable_rls.sql`:

```sql
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

-- anon: read published videos only
CREATE POLICY "anon_read_published_videos" ON public.videos
  FOR SELECT TO anon USING (status = 'published');

-- anon: read categories and states
CREATE POLICY "anon_read_categories" ON public.categories
  FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_states" ON public.states
  FOR SELECT TO anon USING (TRUE);

-- authenticated: full access
CREATE POLICY "auth_all_videos" ON public.videos
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_all_categories" ON public.categories
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_all_states" ON public.states
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
```

- [ ] **Step 4: Create functions**

`api/supabase/migrations/20260722000004_create_functions.sql`:

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

- [ ] **Step 5: Create indexes**

`api/supabase/migrations/20260722000005_create_indexes.sql`:

```sql
CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_videos_category ON public.videos(category);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_ig_post_date ON public.videos(ig_post_date DESC);
CREATE INDEX idx_videos_status_created_at ON public.videos(status, created_at DESC);
```

- [ ] **Step 6: Create get_videos RPC**

`api/supabase/migrations/20260722000006_create_get_videos_rpc.sql`:

```sql
CREATE OR REPLACE FUNCTION public.get_videos_for_api(filters jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  status_filter text := filters->>'status';
  page_num int := COALESCE((filters->>'page')::int, 1);
  per_page int := COALESCE((filters->>'per_page')::int, 50);
  offset_count int := (page_num - 1) * per_page;
  result jsonb;
BEGIN
  SELECT COALESCE(JSONB_AGG(row_to_json(t)), '[]'::jsonb) INTO result
  FROM (
    SELECT
      v.id, v.ig_url, v.category, v.state, v.city, v.tags,
      v.description, v.thumbnail_url, v.ig_post_date,
      v.status, v.created_at, v.updated_at,
      v.submitted_tags, v.submitted_category, v.submitted_state, v.submitted_city,
      c.label AS category_label, c.color AS category_color,
      COUNT(*) OVER() AS total_count
    FROM public.videos v
    LEFT JOIN public.categories c ON c.id = v.category
    WHERE (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
    ORDER BY v.created_at DESC
    LIMIT per_page
    OFFSET offset_count
  ) t;
  RETURN result;
END;
$$;
```

- [ ] **Step 7: Create submit_video RPC**

`api/supabase/migrations/20260722000007_create_submit_video_rpc.sql`:
```sql
CREATE OR REPLACE FUNCTION public.submit_video(
  p_ig_url text,
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_city text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result jsonb;
BEGIN
  -- Check if already exists
  SELECT id INTO existing_id FROM public.videos WHERE ig_url = p_ig_url LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.videos SET
      submitted_tags = COALESCE(p_tags, submitted_tags),
      submitted_category = COALESCE(p_category, submitted_category),
      submitted_state = COALESCE(p_state, submitted_state),
      submitted_city = COALESCE(p_city, submitted_city)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (ig_url, submitted_tags, submitted_category, submitted_state, submitted_city)
  VALUES (p_ig_url, p_tags, p_category, p_state, p_city)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_video TO anon;
```

- [ ] **Step 8: Create increment view RPC**

`api/supabase/migrations/20260722000008_create_increment_view_rpc.sql`:
```sql
CREATE OR REPLACE FUNCTION public.increment_video_view(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos
  SET view_count = view_count + 1
  WHERE id = p_video_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_video_view TO anon;
```

```sql
CREATE OR REPLACE FUNCTION public.submit_video(
  p_ig_url text,
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_city text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result jsonb;
BEGIN
  -- Check if already exists
  SELECT id INTO existing_id FROM public.videos WHERE ig_url = p_ig_url LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.videos SET
      submitted_tags = COALESCE(p_tags, submitted_tags),
      submitted_category = COALESCE(p_category, submitted_category),
      submitted_state = COALESCE(p_state, submitted_state),
      submitted_city = COALESCE(p_city, submitted_city)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (ig_url, submitted_tags, submitted_category, submitted_state, submitted_city)
  VALUES (p_ig_url, p_tags, p_category, p_state, p_city)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_video TO anon;
```

- [ ] **Step 8: Commit**

```bash
git add api/supabase/
git commit -m "feat: add Supabase migrations for admin backend"
```

---

### Task 3: Create Supabase client + auth utilities

**Files:**

- Create: `apps/admin/src/lib/supabase.ts`

**Interfaces:**

- Produces: `createClient()` for server components, `createBrowserClient()` for client components

- [ ] **Step 1: Create supabase lib**

`apps/admin/src/lib/supabase.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/lib/supabase.ts
git commit -m "feat: add Supabase client utilities"
```

---

### Task 4: Create Login page

**Files:**

- Create: `apps/admin/src/app/login/page.tsx`

**Interfaces:**

- Produces: `/login` page with email/password form, redirects to `/` on success

- [ ] **Step 1: Create login page**

`apps/admin/src/app/login/page.tsx`:

```tsx
"use client";

import { useState, type JSX } from "react";

import { createClient } from "@/lib/supabase";

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]">
        <h1 className="font-display mb-6 text-center text-2xl font-extrabold uppercase">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-xs font-bold text-red-600 uppercase">{error}</p>}
          <button
            type="submit"
            className="w-full border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase transition-colors hover:bg-yellow-300"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/app/login/page.tsx
git commit -m "feat: add login page"
```

---

### Task 5: Create Dashboard page

**Files:**

- Create: `apps/admin/src/app/page.tsx`

**Interfaces:**

- Produces: `/` page with stat cards (total/draft/pending/published/rejected)

- [ ] **Step 1: Create dashboard page**

`apps/admin/src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import type { JSX } from "react";

import { createServerSupabase } from "@/lib/supabase";

export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: total } = await supabase.from('videos').select('*', { count: 'exact', head: true });
  const { count: draft } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'draft');
  const { count: pending } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'pending_review');
  const { count: published } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: rejected } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
  const stats = [
    { label: "Total", color: "bg-black", count: 0 },
    { label: "Draft", color: "bg-gray-400", count: 0 },
    { label: "Pending", color: "bg-yellow-400", count: 0 },
    { label: "Published", color: "bg-green-500", count: 0 },
    { label: "Rejected", color: "bg-red-500", count: 0 }
  ];

  return (
    <div className="p-6">
      <h1 className="mb-8 text-3xl font-extrabold uppercase">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]">
            <div className={`mb-2 h-3 w-3 ${s.color}`} />
            <div className="text-3xl font-extrabold">{s.count}</div>
            <div className="text-xs font-bold uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```


- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/app/page.tsx
git commit -m "feat: add dashboard page with stats"
```

---

### Task 6: Create Videos page with CRUD modal

**Files:**

- Create: `apps/admin/src/app/videos/page.tsx`
- Create: `apps/admin/src/components/VideoFormModal.tsx`

**Interfaces:**

- Produces: `/videos` page with status-filtered table + Add/Edit modal

- [ ] **Step 1: Create VideoFormModal component**

`apps/admin/src/components/VideoFormModal.tsx`:

```tsx
"use client";

import { useState, useEffect, type JSX } from "react";

interface VideoFormModalProps {
  video?: any; // video record or null for new
  categories: { id: string; label: string; color: string }[];
  states: { id: number; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export function VideoFormModal({ video, categories, states, onClose, onSaved }: VideoFormModalProps): JSX.Element {
  const [igUrl, setIgUrl] = useState(video?.ig_url ?? "");
  const [category, setCategory] = useState(video?.category ?? "");
  const [state, setState] = useState(video?.state ?? "");
  const [city, setCity] = useState(video?.city ?? "");
  const [tags, setTags] = useState(video?.tags?.join(", ") ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [igPostDate, setIgPostDate] = useState(video?.ig_post_date?.slice(0, 10) ?? "");
  const [status, setStatus] = useState(video?.status ?? "draft");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ig_url: igUrl,
      category: category || null,
      state: state || null,
      city: city || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      description: description || null,
      ig_post_date: igPostDate ? new Date(igPostDate).toISOString() : null,
      status
    };

    const res = await fetch(video ? `/api/videos/${video.id}` : "/api/videos", {
      method: video ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-extrabold uppercase">{video ? "Edit" : "Add"} Video</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Instagram URL</label>
            <input
              value={igUrl}
              onChange={(e) => setIgUrl(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {states.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">IG Post Date</label>
              <input
                type="date"
                value={igPostDate}
                onChange={(e) => setIgPostDate(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Videos page**

`apps/admin/src/app/videos/page.tsx`:

```tsx
"use client";

import { useState, useEffect, type JSX } from "react";

import { VideoFormModal } from "@/components/VideoFormModal";
import { createClient } from "@/lib/supabase";

const STATUSES = ["", "draft", "pending_review", "published", "rejected"];
const STATUS_LABELS: Record<string, string> = {
  "": "All",
  draft: "Draft",
  pending_review: "Pending",
  published: "Published",
  rejected: "Rejected"
};

export default function VideosPage(): JSX.Element {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editVideo, setEditVideo] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const supabase = createClient();

  const loadData = async () => {
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);
    const { data: sts } = await supabase.from("states").select("*").order("name");
    if (sts) setStates(sts);

    const { data } = await supabase.rpc("get_videos_for_api", {
      filters: { status: statusFilter || null, page: 1, per_page: 100 }
    });
    if (data) setVideos(data);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold uppercase">Videos</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
        >
          + Add
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`border-2 border-black px-3 py-1 text-xs font-bold uppercase ${statusFilter === s ? "bg-yellow-400" : "bg-white hover:bg-gray-100"}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">Thumb</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">URL</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">City</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Category</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Status</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Date</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v: any) => (
              <tr key={v.id} className="border-b border-black/10 hover:bg-yellow-50">
                <td className="px-3 py-2">
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt="" className="h-10 w-10 border border-black object-cover" />
                  ) : (
                    <div className="h-10 w-10 border border-black bg-gray-200" />
                  )}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">{v.ig_url}</td>
                <td className="px-3 py-2">{v.city}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase`}
                    style={{ backgroundColor: v.category_color, color: v.category_color === "white" ? "#000" : "#fff" }}
                  >
                    {v.category_label}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase ${v.status === "published" ? "bg-green-500 text-white" : v.status === "draft" ? "bg-gray-400" : v.status === "rejected" ? "bg-red-500 text-white" : "bg-yellow-400"}`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{v.ig_post_date?.slice(0, 10)}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => setEditVideo(v)}
                    className="border border-black px-2 py-1 text-xs font-bold uppercase hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <VideoFormModal
          categories={categories}
          states={states}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadData();
          }}
        />
      )}
      {editVideo && (
        <VideoFormModal
          video={editVideo}
          categories={categories}
          states={states}
          onClose={() => setEditVideo(null)}
          onSaved={() => {
            setEditVideo(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/app/videos/page.tsx apps/admin/src/components/VideoFormModal.tsx
git commit -m "feat: add videos page with CRUD modal"
```

---

### Task 7: Create Categories + States CRUD pages

**Files:**

- Create: `apps/admin/src/app/categories/page.tsx`
- Create: `apps/admin/src/components/CategoryFormModal.tsx`
- Create: `apps/admin/src/app/states/page.tsx`
- Create: `apps/admin/src/components/StateFormModal.tsx`

**Interfaces:**

- Produces: `/categories` and `/states` pages with table + modal CRUD

- [ ] **Step 1: Create CategoryFormModal**

`apps/admin/src/components/CategoryFormModal.tsx`:

```tsx
"use client";

import { useState, type JSX } from "react";

import { createClient } from "@/lib/supabase";

const COLORS = ["yellow", "black", "blue", "red", "green", "white"];

export function CategoryFormModal({
  category,
  onClose,
  onSaved
}: {
  category?: any;
  onClose: () => void;
  onSaved: () => void;
}): JSX.Element {
  const [id, setId] = useState(category?.id ?? "");
  const [label, setLabel] = useState(category?.label ?? "");
  const [color, setColor] = useState(category?.color ?? "yellow");
  const [description, setDescription] = useState(category?.description ?? "");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      await supabase.from("categories").update({ label, color, description }).eq("id", id);
    } else {
      await supabase.from("categories").insert({ id, label, color, description });
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-extrabold uppercase">{category ? "Edit" : "Add"} Category</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">ID (slug)</label>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
              required
              disabled={!!category}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            >
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Categories page**

`apps/admin/src/app/categories/page.tsx`:

```tsx
"use client";

import { useState, useEffect, type JSX } from "react";

import { CategoryFormModal } from "@/components/CategoryFormModal";
import { createClient } from "@/lib/supabase";

export default function CategoriesPage(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("id");
    if (data) setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold uppercase">Categories</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
        >
          + Add
        </button>
      </div>
      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">ID</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Label</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Color</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Description</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id} className="border-b border-black/10 hover:bg-yellow-50">
                <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                <td className="px-3 py-2">{item.label}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase`}
                    style={{ backgroundColor: item.color }}
                  >
                    {item.color}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{item.description}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="border border-black px-2 py-1 text-xs font-bold uppercase hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <CategoryFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {editItem && (
        <CategoryFormModal
          category={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            load();
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create StateFormModal**

`apps/admin/src/components/StateFormModal.tsx`:

```tsx
"use client";

import { useState, type JSX } from "react";

import { createClient } from "@/lib/supabase";

export function StateFormModal({
  state: item,
  onClose,
  onSaved
}: {
  state?: any;
  onClose: () => void;
  onSaved: () => void;
}): JSX.Element {
  const [name, setName] = useState(item?.name ?? "");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      await supabase.from("states").update({ name }).eq("id", item.id);
    } else {
      await supabase.from("states").insert({ name });
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-extrabold uppercase">{item ? "Edit" : "Add"} State</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create States page**

`apps/admin/src/app/states/page.tsx`:

```tsx
"use client";

import { useState, useEffect, type JSX } from "react";

import { StateFormModal } from "@/components/StateFormModal";
import { createClient } from "@/lib/supabase";

export default function StatesPage(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from("states").select("*").order("name");
    if (data) setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold uppercase">States</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
        >
          + Add
        </button>
      </div>
      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">ID</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Name</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id} className="border-b border-black/10 hover:bg-yellow-50">
                <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="border border-black px-2 py-1 text-xs font-bold uppercase hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <StateFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {editItem && (
        <StateFormModal
          state={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            load();
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/categories/page.tsx apps/admin/src/components/CategoryFormModal.tsx apps/admin/src/app/states/page.tsx apps/admin/src/components/StateFormModal.tsx
git commit -m "feat: add categories and states CRUD pages"
```

---

### Task 8: Create API routes

**Files:**

- Create: `apps/admin/src/app/api/submit/route.ts`
- Create: `apps/admin/src/app/api/enrich/route.ts`
- Create: `apps/admin/src/app/api/videos/route.ts`
- Create: `apps/admin/src/app/api/videos/[id]/route.ts`
- Create: `apps/admin/src/app/api/upload/route.ts`

**Interfaces:**

- Produces: REST API for public submission, Chrome extension enrichment, and admin CRUD

- [ ] **Step 1: Public submit endpoint**

`apps/admin/src/app/api/submit/route.ts`:

```ts
import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { ig_url, tags, category, state, city } = await req.json();
  if (!ig_url) return NextResponse.json({ error: "ig_url required" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("submit_video", {
    p_ig_url: ig_url,
    p_tags: tags || null,
    p_category: category || null,
    p_state: state || null,
    p_city: city || null
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 2: Chrome extension enrich endpoint**

`apps/admin/src/app/api/enrich/route.ts`:

```ts
import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== process.env.ENRICH_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ig_url, og_image, ig_post_date } = await req.json();
  if (!ig_url) return NextResponse.json({ error: "ig_url required" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: existing } = await supabase.from("videos").select("id").eq("ig_url", ig_url).maybeSingle();

  if (existing) {
    await supabase
      .from("videos")
      .update({ ig_post_date: ig_post_date || null })
      .eq("id", existing.id);
  } else {
    await supabase.from("videos").insert({ ig_url, ig_post_date: ig_post_date || null, status: "draft" });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Videos list + create (admin)**

`apps/admin/src/app/api/videos/route.ts`:

```ts
import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("videos")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from("videos").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 4: Videos update + delete (admin)**

`apps/admin/src/app/api/videos/[id]/route.ts`:

```ts
import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/supabase";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from("videos").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Upload endpoint**

`apps/admin/src/app/api/upload/route.ts`:

```ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const blob = await put(file.name, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/app/api/
git commit -m "feat: add API routes for submit, enrich, videos CRUD, and upload"
```

---

### Task 9: Create admin layout with auth guard + navigation

**Files:**

- Modify: `apps/admin/src/app/layout.tsx`

**Interfaces:**

- Produces: Root layout with auth check and sidebar navigation

- [ ] **Step 1: Update layout with nav + auth guard**

`apps/admin/src/app/layout.tsx`:

```tsx
import type { JSX, ReactNode } from "react";

import { createServerSupabase } from "@/lib/supabase";

export default async function RootLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-black antialiased">
        {user && (
          <nav className="border-b-2 border-black bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="font-display text-sm font-extrabold uppercase">Reel Vault Admin</span>
                <a href="/" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Dashboard
                </a>
                <a href="/videos" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Videos
                </a>
                <a href="/categories" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Categories
                </a>
                <a href="/states" className="text-xs font-bold uppercase hover:text-yellow-500">
                  States
                </a>
              </div>
              <form action="/api/logout" method="post">
                <button className="text-xs font-bold uppercase hover:text-red-500">Logout</button>
              </form>
            </div>
          </nav>
        )}
        <main className="mx-auto max-w-7xl">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/app/layout.tsx
git commit -m "feat: add admin layout with nav and auth guard"
```

---

### Task 10: Update Chrome extension to POST to enrich endpoint

**Files:**

- Modify: `chrome-extension/content.js`

- [ ] **Step 1: Update collectData to POST to backend**

In `chrome-extension/content.js`, replace `collectData` function:

```js
async function collectData() {
  const ogImage = getMetaContent("og:image");
  const datetime = findShareDateTime();

  const data = { ig_url: window.location.href, og_image: ogImage, ig_post_date: datetime };

  try {
    const res = await fetch("https://your-admin-app.vercel.app/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + "YOUR_API_TOKEN" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    console.log("[Reel Vault] Enriched:", result);
    alert("✅ Submitted to Reel Vault");
  } catch (err) {
    console.error("[Reel Vault] Error:", err);
    alert("❌ Failed to submit");
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add chrome-extension/content.js
git commit -m "feat: update Chrome extension to POST collected data to API"
```

---

### Task 11: Add root package.json for monorepo scripts

**Files:**

- Create: `apps/admin/.env.example`

- [ ] **Step 1: Create .env.example**

`apps/admin/.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENRICH_API_TOKEN=
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/.env.example
git commit -m "chore: add .env.example with required vars"
```

---

### Task 12: Update ReelPlayer to call increment view RPC

**Files:**
- Modify: `apps/admin/src/app/api/views/route.ts` (Create)
- Modify: `src/components/shared/ReelPlayer.tsx` (in frontend app)

**Interfaces:**
- Produces: View count increments when a reel is played

- [ ] **Step 1: Create view count API route**

`apps/admin/src/app/api/views/route.ts`:
```ts
import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { video_id } = await req.json();
  if (!video_id) return NextResponse.json({ error: 'video_id required' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc('increment_video_view', { p_video_id: video_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Update ReelPlayer to call view API on embed load**

In `src/components/shared/ReelPlayer.tsx`, add a fetch call inside the embed load handler. Find the `onLoad` callback on the iframe and add:

```tsx
onLoad={() => {
  setEmbedLoaded(true);
  // Increment view count
  fetch('https://admin-app.vercel.app/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: video.id }),
  }).catch(() => {});
}}
```

Replace the existing `onLoad={() => setEmbedLoaded(true)}` with the above.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/app/api/views/route.ts src/components/shared/ReelPlayer.tsx
git commit -m "feat: add view count tracking via RPC call from ReelPlayer"
```
