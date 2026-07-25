# Indian Students Protest Vault

> An open-source archive indexing peaceful Indian student protest Instagram reels, organised by city, category, and hashtag.

**Purpose:** Preserve publicly shared protest media in an organised, searchable, and non-partisan archive before it disappears — whether through algorithmic drift, platform decay, or collective forgetting.

## Philosophy

The Indian Students Protest Vault exists because mainstream narratives often fail to capture the ground reality of student-led democratic movements in India. When thousands of students across the country take to the streets — from Delhi's Jantar Mantar to the smallest town squares — their stories are told in reels, not headlines.

This project is an archival response to a simple question: _"Who will remember?"_

**This is not activism. It is witnessing** — the technical act of keeping a record so that the record exists.

See [`PHILOSOPHY.md`](./PHILOSOPHY.md) for the full philosophy document.

## Scope

### In Scope

- **Indian student protests only.** Videos documenting peaceful student-led protests, demonstrations, and related civic actions within India.
- **Publicly available Instagram reels.** Every video in the archive was uploaded to a public Instagram account. We do not host, download, or redistribute media files.
- **Non-partisan curation.** Videos are categorised by event type and geographic location — not by political alignment.
- **Metadata preservation.** City, state, category, tags, and hashtags are curated to make each video findable through search and filter.

### Out of Scope

- No editorialising, no media hosting, no political affiliation, no user accounts, no AI generation.

## Architecture

This is a **Bun monorepo** with three packages:

| Package                                 | Path                | Description                                             |
| --------------------------------------- | ------------------- | ------------------------------------------------------- |
| [`@ispv/frontend`](./apps/frontend)     | `apps/frontend/`    | Public-facing Next.js static archive site (port 3000)   |
| [`@ispv/admin`](./apps/admin)           | `apps/admin/`       | Next.js admin panel (port 3001)                         |
| [`@ispv/extension`](./chrome-extension) | `chrome-extension/` | Chrome extension for collecting Instagram reel metadata |

## Stack

| Layer                | Choice                                        |
| -------------------- | --------------------------------------------- |
| **Monorepo**         | Bun workspaces                                |
| **Framework**        | Next.js 16 (App Router, Turbopack)            |
| **Language**         | TypeScript 6, React 19                        |
| **Styling**          | Tailwind CSS 4 with `@tailwindcss/postcss`    |
| **Animations**       | `tw-animate-css`                              |
| **UI Primitives**    | Radix UI (Dialog, DropdownMenu, Select, Slot) |
| **Icons**            | lucide-react                                  |
| **Database**         | Supabase (Postgres with RPC functions)        |
| **Blob Storage**     | Vercel Blob (thumbnails)                      |
| **Image Processing** | sharp                                         |
| **Validation**       | Zod                                           |
| **Testing**          | Vitest (~313 tests)                           |
| **Linting**          | ESLint 10 via `@vijayhardaha/dev-config`      |
| **Formatting**       | Prettier 3 + `prettier-plugin-tailwindcss`    |
| **Package Manager**  | Bun                                           |
| **Hooks**            | Husky + commitlint                            |

## Design

**Brutalist aesthetic** — heavy black borders, hard shadows, bold uppercase fonts, saffron/navy/white/green colour palette (Indian flag inspired).

The design echoes the rawness of protest footage: unpolished, direct, honest. The site should feel like a filing cabinet, not a magazine — prioritising **findability over flourish**.

Typography:

- **Body:** Space Grotesk
- **Display/Headings:** Poppins (extrabold, tracking-tight)
- **Mono:** JetBrains Mono

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.x or later
- Supabase project (for database)
- Vercel Blob storage (optional, for thumbnail uploads)

### Installation

```bash
git clone https://github.com/vijayhardaha/ispv.git
cd ispv
bun install
```

### Environment Variables

Copy the example env file and configure your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables (see `.env.example` for the full list):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Development

Start both the frontend and admin dev servers:

```bash
bun run dev
```

Or start individually:

```bash
bun run dev:frontend   # http://localhost:3000
bun run dev:admin      # http://localhost:3001
```

### Build

```bash
bun run build   # Production build for both apps
```

## Scripts

| Command                 | Action                                        |
| ----------------------- | --------------------------------------------- |
| `bun run dev`           | Start both frontend (:3000) and admin (:3001) |
| `bun run dev:frontend`  | Frontend dev server with Turbopack            |
| `bun run dev:admin`     | Admin dev server on port 3001                 |
| `bun run build`         | Production build for both apps                |
| `bun run lint`          | ESLint check across all workspaces            |
| `bun run lint:fix`      | ESLint auto-fix                               |
| `bun run format`        | Prettier format all                           |
| `bun run format:check`  | Prettier check                                |
| `bun run tsc`           | TypeScript type-check (`tsc --noEmit`)        |
| `bun run test`          | Run all tests (Vitest) across workspaces      |
| `bun run test:watch`    | Watch mode for tests                          |
| `bun run test:coverage` | Run tests with coverage report                |

## Project Structure

```
├── apps/
│   ├── frontend/              # @ispv/frontend — public archive site
│   │   └── src/
│   │       ├── app/           # Next.js App Router pages + layouts
│   │       ├── components/    # React components (features/, layout/, shared/, ui/)
│   │       ├── constants/     # SEO, colors, nav, categories, locations, slogans
│   │       ├── hooks/         # useFilterState, useReelPlayer, useSubmitVideoForm
│   │       └── lib/           # db/, videos/, seo/, utils/, helpers/ (barrel-exported)
│   └── admin/                 # @ispv/admin — admin panel
│       └── src/
│           ├── app/           # Pages (login, dashboard, videos) + API routes (auth/, public/)
│           ├── components/    # layout/, ui/, features/
│           ├── constants/     # categories, colors, locations, status, etc.
│           ├── hooks/         # usePagination
│           └── lib/           # db/, utils/, api/ (barrel-exported)
├── chrome-extension/          # @ispv/extension — ISPV Helper Chrome extension
│   ├── manifest.json          # Manifest V3
│   ├── content.js             # Injects floating collect button on Instagram reel pages
│   ├── background.js          # Service worker: proxies API requests with Bearer token
│   ├── options.js             # Options page: manages API token + admin URL
│   └── options.html           # Options page UI
├── PHILOSOPHY.md              # Project philosophy and ethos
├── AGENTS.md                  # Detailed developer knowledge base
├── package.json               # Root monorepo configuration
├── bun.lock
├── commitlint.config.mjs
├── eslint.config.mjs
├── prettier.config.mjs
└── .editorconfig
```

## Data Architecture

All video data is stored in **Supabase** (`videos`, `categories`, `locations` tables). The frontend fetches from Supabase via server components or client-side `useEffect`. A DB adapter (`dbRowToVideoEntry`) normalises raw database rows into `VideoEntry` objects for the frontend.

Key types:

- **`VideoEntry`** — full video record (id, description, url, thumbnail, city, location, category, tags, hashtags, trending flag, etc.)
- **`VideoRecord`** (admin) — full DB row type (includes status, trashed_at, view_count, etc.)
- **`VideoFilters`** — paginated filter shape for published video queries
- **`HomepageStats`** — aggregate stats from the homepage RPC

See [`apps/frontend/knowledge.md`](./apps/frontend/knowledge.md) and [`apps/admin/knowledge.md`](./apps/admin/knowledge.md) for detailed documentation.

## API Routes (Admin)

| Endpoint                      | Auth                  | Purpose                              |
| ----------------------------- | --------------------- | ------------------------------------ |
| `GET /api/public/check-video` | Public (rate-limited) | Check if a video already exists      |
| `POST /api/public/submit`     | Public (rate-limited) | Video submission from the frontend   |
| `POST /api/public/views`      | Public (rate-limited) | View count increment                 |
| `GET /api/auth/videos`        | Auth required         | List videos (paginated, filterable)  |
| `POST /api/auth/videos`       | Auth required         | Create video                         |
| `PUT /api/auth/videos/[id]`   | Auth required         | Update video                         |
| `POST /api/auth/videos/[id]`  | Auth required         | Single action (trash/restore/delete) |
| `POST /api/auth/videos/bulk`  | Auth required         | Bulk actions                         |
| `POST /api/auth/views`        | Auth required         | View count increment                 |
| `POST /api/auth/enrich`       | Bearer token          | Enrich video metadata (thumbnail)    |
| `POST /api/auth/submit`       | Auth required         | Create from admin form               |

## Data Ethos

- **Attribution is preserved.** Every video links back to the original Instagram post.
- **Removal is respected.** Video owners can request removal via Instagram DM.
- **No personal data is collected.** The submission form asks for nothing beyond the Instagram URL and optional metadata tags.
- **The archive is auditable.** The code is open source (MIT). Data flows are transparent.
- **Rate-limited public endpoints.** Public submissions and views are throttled via Upstash Redis (with in-memory fallback).

## Contributing

Contributions are welcome! Please read the project philosophy first, then:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `bun run lint:fix && bun run format && bun run tsc && bun run test` to verify
5. Submit a pull request

### Commit Convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) with `commitlint`. Commit messages are automatically linted via Husky on commit and validated on push.

## License

MIT © [Vijay Hardaha](https://github.com/vijayhardaha/)

---

> _"Who will remember?"_
