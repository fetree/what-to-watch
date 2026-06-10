# What to Watch

A personalized movie, TV, and anime recommender. Rate a handful of titles you know, and Claude builds a taste profile that finds what you'll actually want to watch next.

## How it works

1. **Onboarding** — Rate 5–20 titles from a curated seed list (1–5 stars)
2. **Profile extraction** — Claude reads your ratings and writes a structured taste profile (themes, tone, pacing, dark-content tolerance, etc.)
3. **Embedding** — The taste profile is turned into a vector and stored in Qdrant
4. **Similarity search** — Qdrant finds the 20 catalog titles whose vectors are closest to your profile
5. **Re-ranking** — Claude picks the best 8 and writes a personalized "why you'd like this" blurb for each
6. **Feedback loop** — Hitting ✕ on a recommendation nudges your profile vector away from that title in real time

## Tech stack

| Layer | Choice |
|---|---|
| Backend | TypeScript + Fastify |
| Frontend | React + Vite + Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Vector DB | Qdrant |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | Anthropic Claude (`claude-sonnet-4-6`) |
| Deploy | Railway |

## Project structure

```
what-to-watch/
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # React + Vite frontend
├── packages/
│   └── shared/       # Shared Zod schemas and TypeScript types
├── scripts/
│   └── seed-catalog.ts  # One-time TMDB fetch + embed + Qdrant upsert
└── railway.toml
```

## Local setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local Postgres and Qdrant)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/what_to_watch
QDRANT_URL=http://localhost:6333
TMDB_API_KEY=your_key
PORT=3000
```

- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- **OpenAI API key** — [platform.openai.com](https://platform.openai.com) (used only for embeddings)
- **TMDB API key** — free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 3. Start local services

```bash
docker compose up -d
```

### 4. Symlink `.env` for Prisma

Prisma runs from inside `apps/api/` and needs to find `.env` there:

```bash
ln -s ../../.env apps/api/.env
```

### 5. Run database migration

```bash
pnpm --filter api exec prisma migrate dev --name init
```

### 6. Seed the catalog

Fetches ~2000 titles from TMDB, embeds them, and loads them into Qdrant and Postgres. Takes a few minutes.

```bash
pnpm seed
```

### 7. Start the dev servers

```bash
# In one terminal
pnpm dev:api

# In another terminal
pnpm dev:web
```

Open [http://localhost:5173](http://localhost:5173).

## API routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/users` | Create or retrieve a user by email |
| `GET` | `/api/onboarding/seed-titles` | The 20-title rating list |
| `POST` | `/api/ratings` | Save a rating (upserts on userId + tmdbId) |
| `POST` | `/api/profile/generate` | Claude extracts taste profile, embeds it, stores in Qdrant |
| `GET` | `/api/recommendations/:userId` | Qdrant search → Claude re-rank → 8 blurbed results |
| `POST` | `/api/profile/update` | Nudge profile vector toward/away from a title |

## Deploy to Railway

The repo is set up for three Railway services:

**API service**
- Root: `/` (repo root)
- Build/start: configured in `railway.toml`
- Environment variables: all five from `.env.example`

**Web service**
- Root: `/apps/web`
- Build command: `pnpm install && pnpm build`
- Publish directory: `dist`
- Set `VITE_API_URL` to your API service's Railway URL if serving web and API on separate domains

**Qdrant** — add via Railway's Qdrant native template, then wire `QDRANT_URL` into the API service.

**PostgreSQL** — add via Railway's Postgres native template, then wire `DATABASE_URL` into the API service.

After first deploy, run the seed script once against your production database:

```bash
TMDB_API_KEY=... OPENAI_API_KEY=... DATABASE_URL=... QDRANT_URL=... pnpm seed
```
