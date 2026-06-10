# What to Watch

A personalized movie, TV, and anime recommender. Rate a handful of titles you know, and Claude builds a taste profile that finds what you'll actually want to watch next.

## How it works

### The pipeline

```
Your ratings
     │
     ▼
 Claude (Sonnet)
 reads your scores and writes a prose taste profile:
 "This viewer gravitates toward slow-burn psychological
  dramas with morally complex characters..."
     │
     ▼
 OpenAI Embeddings
 converts that paragraph into 1536 numbers (a vector)
 that capture its meaning geometrically
     │
     ▼
 Qdrant (vector DB)
 stores your profile vector, then searches the pre-seeded
 catalog of ~2000 titles for the 20 closest matches
     │
     ▼
 Claude (Sonnet) again
 re-ranks the 20 candidates to the best 8 and writes
 a personalized "why you'd like this" blurb for each
     │
     ▼
 Your recommendations
```

### Why two separate tools?

**Qdrant** is fast but dumb — it does pure math, comparing 1536 numbers against 1536 numbers across thousands of titles in milliseconds. It has no concept of taste or narrative.

**Claude** is slow but smart — it understands nuance, subtext, and why a fan of *Parasite* might love *Oldboy* but hate *Squid Game*. It can't search 2000 titles at once without enormous cost.

The architecture plays to both strengths: Qdrant narrows the field cheaply, Claude explains the match precisely.

### What gets embedded and why

Every catalog title is converted to a text string before embedding:

```
"The Dark Knight. When the menace known as the Joker wreaks havoc
on Gotham, Batman must confront his greatest psychological challenge.
Genres: Action, Crime, Drama, Thriller."
```

This string is embedded into a vector. Your taste profile — a paragraph Claude writes about your viewing preferences — is embedded the same way. Titles whose embed strings land near your profile vector in 1536-dimensional space are your recommendations.

### Taste drift

Hitting ✕ on a recommendation doesn't just hide it — it calls `POST /api/profile/update`, which blends your existing profile vector slightly away from that title's catalog vector. Rate enough ✕'s on slow period dramas and your profile geometrically drifts toward whatever else you've responded positively to.

### Token cost at a glance

| Operation | Model | Approx tokens |
|---|---|---|
| Profile extraction | Sonnet | ~500 in / ~600 out |
| Re-ranking + blurbs | Sonnet | ~2000 in / ~800 out |
| Taste drift update | none (math only) | — |

Recommendations are cached in localStorage for 24 hours — refreshing the page never re-triggers a Claude call unless you explicitly hit **Refresh**.

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
