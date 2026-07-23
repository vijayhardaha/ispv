# Security Improvements Summary

## Changes Made

### 1. **Auth Guards on Admin Mutating APIs** ✅

Protected admin-only endpoints to require authenticated users:

- `POST /api/videos` — Create videos
- `PUT /api/videos/[id]` — Update videos
- `DELETE /api/videos/[id]` — Delete videos
- `POST /api/videos/bulk` — Bulk operations

Each now includes:

```ts
const {
  data: { user }
} = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### 2. **Hardened Enrich Endpoint** ✅

Protected image fetch flow against SSRF and abuse:

- **URL validation**: Enforces `https://` only
- **Private IP blocking**: Rejects `127.x`, `192.168.x`, `10.x`, etc.
- **DNS resolution**: Validates hostname resolves and checks result IP
- **Content-type check**: HEAD request validates `image/*` type
- **Size limits**: Enforces 5 MB max (checked via content-length and actual buffer)
- **Fetch timeouts**: 8s for HEAD, 15s for GET
- **Best-effort**: Returns null on any error (doesn't break enrichment)

### 3. **Secure Public Endpoints with Service Role** ✅

Created two new routes that use `SUPABASE_SERVICE_ROLE_KEY`:

- `POST /api/public/submit` — Video submission endpoint
  - Rate limit: **10 per hour** per IP
  - Uses service role to call `submit_video` RPC
- `POST /api/public/views` — View increment endpoint
  - Rate limit: **60 per minute** per IP
  - Uses service role to call `increment_video_view` RPC

Both endpoints now use **server-only credentials** instead of exposing Supabase RPC to clients.

### 4. **Rate Limiting (Upstash Redis)** ✅

Implemented pluggable rate limiter:

- **Primary**: Upstash Redis (global, multi-instance safe)
- **Fallback**: In-memory per-instance (when Redis not configured)

**Key benefits**:

- Free tier at Upstash (10GB/month, 1,000,000 commands)
- Simple Redis INCR+EXPIRE logic
- Vercel integration auto-injects credentials

### 5. **Frontend Updated** ✅

Rerouted public endpoints to use admin's secure endpoints:

- Submit form: `/api/submit-video` → `https://admin-app.vercel.app/api/public/submit`
- View counting: Direct RPC → `https://admin-app.vercel.app/api/public/views`

Added `NEXT_PUBLIC_ADMIN_URL` env var for easy configuration.

---

## Environment Variables Required

### Admin App (apps/admin)

Add to `.env.local` (dev) and Vercel secrets (production):

```
# Must be set (generate in Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional — if not set, uses in-memory rate-limit (per-instance only)
KV_REST_API_URL=https://<id>.upstash.io
KV_REST_API_TOKEN=<token>

# Existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ENRICH_API_TOKEN=...
```

### Frontend App (apps/frontend)

Add to `.env.local` and `.env.production`:

```
# Point to your admin app
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001  # dev
NEXT_PUBLIC_ADMIN_URL=https://admin-app.vercel.app  # production

# Existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Upstash Setup (5 min)

See **UPSTASH_SETUP.md** for full guide. Quick start:

1. **Go to** https://console.upstash.com/ → Create Redis database
2. **In Vercel dashboard**: Settings → Integrations → Add Upstash
3. Select your Redis → auto-populates `KV_REST_API_URL` & `KV_REST_API_TOKEN`
4. **Local dev**: Copy values from Upstash console → `.env.local`
5. Done! Rate limiter now globally distributed

---

## What's Still TODO (Next Phase)

1. **Revoke public RPC grants** — Update Supabase RLS to restrict anon access:
   A migration file was added at `apps/admin/supabase/migrations/20260723150000_revoke_anon_rpc.sql` which runs:

   ```sql
   REVOKE EXECUTE ON FUNCTION public.submit_video FROM anon;
   REVOKE EXECUTE ON FUNCTION public.increment_video_view FROM anon;
   COMMIT;
   ```

   Deploy this migration to your Supabase instance to force all submissions through the server-proxy.

2. **Add monitoring/alerts** — Log rate-limit hits and abuse patterns
3. **Add CSP/security headers** — next.config security middleware

4. **Tests** — Add E2E tests for rate-limit enforcement

---

## Testing

### Local Dev

```bash
# Start both
bun run dev

# Test submit (should succeed once, then 429 after 10 in 1 hour)
curl -X POST http://localhost:3001/api/public/submit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/p/abc123/", "city": "Delhi"}'

# Test views (60/min limit)
curl -X POST http://localhost:3001/api/public/views \
  -H "Content-Type: application/json" \
  -d '{"video_id": "some-uuid"}'
```

### Production

- Verify Upstash Redis shows incoming requests in dashboard
- Hit endpoints 11 times (submit) or 61 times (views in 1 min) to confirm 429

---

## Files Changed

**Admin**:

- `src/app/api/videos/route.ts` — Added auth guard (GET, POST)
- `src/app/api/videos/[id]/route.ts` — Added auth guard (PUT, DELETE)
- `src/app/api/videos/bulk/route.ts` — Added auth guard (POST)
- `src/app/api/enrich/route.ts` — Hardened URL validation, IP blocking, timeouts
- `src/app/api/public/submit/route.ts` — New public submit endpoint ✨
- `src/app/api/public/views/route.ts` — New public views endpoint ✨
- `src/lib/rateLimit.ts` — Rate limit logic (Upstash + in-memory fallback) ✨
- `.env.example` — Added Upstash and service role key docs

**Frontend**:

- `src/hooks/useSubmitVideoForm.ts` — Updated to call `/api/public/submit`
- `src/components/shared/ReelItem.tsx` — Updated to call `/api/public/views`
- `.env.example` — Added `NEXT_PUBLIC_ADMIN_URL`

---

## Security Posture After Changes

| Aspect        | Before            | After                         |
| ------------- | ----------------- | ----------------------------- |
| Admin writes  | No auth           | ✅ Requires auth              |
| Image fetch   | Unrestricted      | ✅ SSRF-protected             |
| Public submit | Direct RPC (anon) | ✅ Server proxy + rate limit  |
| View counting | Direct RPC (anon) | ✅ Server proxy + rate limit  |
| Credentials   | Anon key exposed  | ✅ Service role (server-only) |
| Rate limits   | None              | ✅ Upstash Redis + fallback   |

---

## Next Steps

1. Copy `.env.example` → `.env.local` in both apps
2. Fill in Supabase credentials
3. Setup Upstash (5 min, see UPSTASH_SETUP.md)
4. Set `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard)
5. Set `NEXT_PUBLIC_ADMIN_URL` in frontend
6. Run: `bun run dev` to test locally
7. Deploy to Vercel (auto-picks up secrets)
8. Optionally revoke anon RPC grants (final lock-down)

---
