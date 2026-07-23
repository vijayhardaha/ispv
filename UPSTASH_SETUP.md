# Setting Up Upstash Redis with Vercel

## Step-by-Step Setup

### 1. Create Upstash Redis Database

- Go to https://console.upstash.com/
- Sign up or log in
- Click **Create Database**
- Choose **Redis**
- Select region close to your Vercel deployment
- Create the database (Free tier available)

### 2. Connect Upstash to Vercel (Recommended)

This is the easiest way — Vercel auto-injects environment variables.

#### Option A: Vercel Dashboard Integration (Easiest)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Integrations**
3. Search for **Upstash** and click it
4. Click **Add Integration**
5. Authorize Upstash to access your account
6. Select your Upstash Redis database
7. Vercel will auto-add these environment variables:
   - `KV_URL` (full Redis connection string)
   - `KV_REST_API_URL` (REST endpoint)
   - `KV_REST_API_TOKEN` (REST API token)
   - `KV_REST_API_READ_ONLY_TOKEN` (read-only token)
   - `REDIS_URL` (alternative format)

#### Option B: Manual Environment Variables

If auto-integration doesn't work:

1. Go to Upstash console → Your database → **REST API**
2. Copy these values:
   - REST Endpoint URL → `KV_REST_API_URL`
   - REST Token → `KV_REST_API_TOKEN`
3. In Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add each variable for Production, Preview, and Development
   - Paste the values from Upstash
4. Redeploy your project

### 3. Local Development Setup

1. Copy values from Upstash console → **REST API**
2. Add to `.env.local` (admin):
   ```
   KV_REST_API_URL=https://<your-id>.upstash.io
   KV_REST_API_TOKEN=<your-token>
   ```
3. Run locally: `bun run dev:admin`

### 4. Verify Setup

- Run in production: check Upstash dashboard → **Monitoring** to see request counts
- Local test: `curl -H "Authorization: Bearer <TOKEN>" <URL>/ping` → should return `"PONG"`

### 5. Common Issues

- **Connection refused**: Check URL format matches `https://<id>.upstash.io`
- **401 Unauthorized**: Verify token is correct (no spaces)
- **Timeout**: May indicate Vercel function timeout; increase per need or check Upstash region

## Environment Variables Reference

| Variable                      | Source                                       | Used For                               |
| ----------------------------- | -------------------------------------------- | -------------------------------------- |
| `KV_REST_API_URL`             | Upstash console → REST API → Endpoint        | Redis endpoint URL                     |
| `KV_REST_API_TOKEN`           | Upstash console → REST API → Token           | Auth for read/write                    |
| `KV_REST_API_READ_ONLY_TOKEN` | Upstash console → REST API → Read-only token | Auth for read-only ops                 |
| `KV_URL`                      | Auto-provided by Vercel integration          | Full Redis URL (if using Redis client) |
| `REDIS_URL`                   | Auto-provided by Vercel integration          | Alternative Redis URL format           |

## Testing Rate Limiter

Once deployed:

```bash
# Submit video test
curl -X POST https://admin-app.vercel.app/api/public/submit \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.instagram.com/p/abc123/",
    "hashtags": "protest,india",
    "city": "Delhi"
  }'

# View increment test
curl -X POST https://admin-app.vercel.app/api/public/views \
  -H "Content-Type: application/json" \
  -d '{"video_id": "video-uuid-here"}'
```

Hit the endpoint 11 times in 1 hour (submit) or 61 times in 1 minute (views) to see rate-limit 429 response.
