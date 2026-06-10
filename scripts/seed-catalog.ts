import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

const TMDB_BASE = "https://api.themoviedb.org/3";
const BATCH_SIZE = 100;
const PAGES_PER_CATEGORY = 20; // 20 pages × 20 results = 400 titles per category → ~2000 total
const ANIME_GENRE_ID = 16;

interface TmdbTitle {
  tmdbId: number;
  title: string;
  mediaType: "movie" | "tv" | "anime";
  overview: string;
  genreIds: number[];
  posterPath: string | null;
}

interface TmdbGenre {
  id: number;
  name: string;
}

const config = {
  tmdbApiKey: process.env.TMDB_API_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  databaseUrl: process.env.DATABASE_URL!,
  qdrantUrl: process.env.QDRANT_URL ?? "http://localhost:6333",
};

const prisma = new PrismaClient();
const qdrant = new QdrantClient({ url: config.qdrantUrl });
const openai = new OpenAI({ apiKey: config.openaiApiKey });

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", config.tmdbApiKey);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function fetchGenreMap(mediaType: "movie" | "tv"): Promise<Map<number, string>> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>(`/genre/${mediaType}/list`);
  return new Map(data.genres.map((g) => [g.id, g.name]));
}

async function fetchPopularMovies(pages: number): Promise<TmdbTitle[]> {
  const titles: TmdbTitle[] = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbFetch<{ results: Array<{ id: number; title?: string; overview: string; genre_ids: number[]; poster_path: string | null }> }>(
      "/movie/popular",
      { page: String(page) },
    );
    titles.push(
      ...data.results.map((r) => ({
        tmdbId: r.id,
        title: r.title ?? "",
        mediaType: "movie" as const,
        overview: r.overview,
        genreIds: r.genre_ids,
        posterPath: r.poster_path,
      })),
    );
    await sleep(100);
  }
  return titles;
}

async function fetchTopRatedMovies(pages: number): Promise<TmdbTitle[]> {
  const titles: TmdbTitle[] = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbFetch<{ results: Array<{ id: number; title?: string; overview: string; genre_ids: number[]; poster_path: string | null }> }>(
      "/movie/top_rated",
      { page: String(page) },
    );
    titles.push(
      ...data.results.map((r) => ({
        tmdbId: r.id,
        title: r.title ?? "",
        mediaType: "movie" as const,
        overview: r.overview,
        genreIds: r.genre_ids,
        posterPath: r.poster_path,
      })),
    );
    await sleep(100);
  }
  return titles;
}

async function fetchTopRatedTV(pages: number): Promise<TmdbTitle[]> {
  const titles: TmdbTitle[] = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbFetch<{ results: Array<{ id: number; name?: string; overview: string; genre_ids: number[]; poster_path: string | null }> }>(
      "/tv/top_rated",
      { page: String(page) },
    );
    titles.push(
      ...data.results.map((r) => ({
        tmdbId: r.id,
        title: r.name ?? "",
        mediaType: "tv" as const,
        overview: r.overview,
        genreIds: r.genre_ids,
        posterPath: r.poster_path,
      })),
    );
    await sleep(100);
  }
  return titles;
}

async function fetchAnime(pages: number): Promise<TmdbTitle[]> {
  const titles: TmdbTitle[] = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbFetch<{ results: Array<{ id: number; name?: string; overview: string; genre_ids: number[]; poster_path: string | null }> }>(
      "/discover/tv",
      { page: String(page), with_genres: String(ANIME_GENRE_ID), sort_by: "popularity.desc" },
    );
    titles.push(
      ...data.results.map((r) => ({
        tmdbId: r.id,
        title: r.name ?? "",
        mediaType: "anime" as const,
        overview: r.overview,
        genreIds: r.genre_ids,
        posterPath: r.poster_path,
      })),
    );
    await sleep(100);
  }
  return titles;
}

function buildEmbedString(
  title: string,
  overview: string,
  genres: string[],
): string {
  return `${title}. ${overview} Genres: ${genres.join(", ")}.`;
}

async function ensureCollection() {
  const existing = await qdrant.getCollections();
  const names = existing.collections.map((c) => c.name);
  if (!names.includes("catalog")) {
    await qdrant.createCollection("catalog", {
      vectors: { size: 1536, distance: "Cosine" },
    });
    console.log("Created Qdrant collection: catalog");
  }
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("Fetching genre maps…");
  const [movieGenres, tvGenres] = await Promise.all([
    fetchGenreMap("movie"),
    fetchGenreMap("tv"),
  ]);

  console.log("Fetching titles from TMDB…");
  const [popularMovies, topMovies, topTV, anime] = await Promise.all([
    fetchPopularMovies(PAGES_PER_CATEGORY),
    fetchTopRatedMovies(PAGES_PER_CATEGORY),
    fetchTopRatedTV(PAGES_PER_CATEGORY),
    fetchAnime(PAGES_PER_CATEGORY / 2),
  ]);

  // Deduplicate by tmdbId
  const seen = new Set<number>();
  const all: TmdbTitle[] = [];
  for (const title of [...popularMovies, ...topMovies, ...topTV, ...anime]) {
    if (!seen.has(title.tmdbId) && title.overview && title.title) {
      seen.add(title.tmdbId);
      all.push(title);
    }
  }

  console.log(`Fetched ${all.length} unique titles. Embedding in batches of ${BATCH_SIZE}…`);
  await ensureCollection();

  let processed = 0;
  for (let i = 0; i < all.length; i += BATCH_SIZE) {
    const batch = all.slice(i, i + BATCH_SIZE);
    const genreMap = batch[0].mediaType === "movie" ? movieGenres : tvGenres;

    const embedStrings = batch.map((t) => {
      const genres = t.genreIds.map((id) => genreMap.get(id) ?? "").filter(Boolean);
      return buildEmbedString(t.title, t.overview, genres);
    });

    const vectors = await embedBatch(embedStrings);

    // Upsert into Qdrant
    const qdrantPoints = batch.map((t, idx) => {
      const genres = t.genreIds.map((id) => genreMap.get(id) ?? "").filter(Boolean);
      const pointId = crypto.randomUUID();
      return {
        pointId,
        point: {
          id: pointId,
          vector: vectors[idx],
          payload: {
            tmdb_id: t.tmdbId,
            title: t.title,
            media_type: t.mediaType,
            genres,
          },
        },
      };
    });

    await qdrant.upsert("catalog", { points: qdrantPoints.map((p) => p.point) });

    // Upsert into Postgres
    for (let j = 0; j < batch.length; j++) {
      const t = batch[j];
      const genres = t.genreIds
        .map((id) => genreMap.get(id) ?? "")
        .filter(Boolean);
      await prisma.catalogItem.upsert({
        where: { tmdbId: t.tmdbId },
        create: {
          tmdbId: t.tmdbId,
          title: t.title,
          mediaType: t.mediaType,
          overview: t.overview,
          genres: JSON.stringify(genres),
          posterPath: t.posterPath,
          qdrantPointId: qdrantPoints[j].pointId,
        },
        update: {
          title: t.title,
          overview: t.overview,
          genres: JSON.stringify(genres),
          posterPath: t.posterPath,
          qdrantPointId: qdrantPoints[j].pointId,
        },
      });
    }

    processed += batch.length;
    console.log(`  ${processed}/${all.length} done`);

    // Brief pause between batches to avoid rate limits
    if (i + BATCH_SIZE < all.length) await sleep(200);
  }

  console.log("Seed complete.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
