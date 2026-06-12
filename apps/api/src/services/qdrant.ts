import type { QdrantClient } from "@qdrant/js-client-rest";

export const CATALOG_COLLECTION = "catalog";
export const PROFILES_COLLECTION = "profiles";
export const VECTOR_SIZE = 1536;

export async function ensureCollections(client: QdrantClient, retries = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const existing = await client.getCollections();
      const names = existing.collections.map((c) => c.name);

      if (!names.includes(CATALOG_COLLECTION)) {
        await client.createCollection(CATALOG_COLLECTION, {
          vectors: { size: VECTOR_SIZE, distance: "Cosine" },
        });
      }

      if (!names.includes(PROFILES_COLLECTION)) {
        await client.createCollection(PROFILES_COLLECTION, {
          vectors: { size: VECTOR_SIZE, distance: "Cosine" },
        });
      }
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}

export async function upsertCatalogPoint(
  client: QdrantClient,
  pointId: string,
  vector: number[],
  payload: { tmdb_id: number; title: string; media_type: string; genres: string[] },
) {
  await client.upsert(CATALOG_COLLECTION, {
    points: [{ id: pointId, vector, payload }],
  });
}

export async function upsertProfilePoint(
  client: QdrantClient,
  pointId: string,
  vector: number[],
  userId: string,
) {
  await client.upsert(PROFILES_COLLECTION, {
    points: [{ id: pointId, vector, payload: { user_id: userId } }],
  });
}

export async function searchCatalog(
  client: QdrantClient,
  vector: number[],
  limit = 20,
): Promise<Array<{ id: string; score: number; payload: Record<string, unknown> }>> {
  const results = await client.search(CATALOG_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });
  return results.map((r) => ({
    id: String(r.id),
    score: r.score,
    payload: (r.payload ?? {}) as Record<string, unknown>,
  }));
}

export async function getProfileVector(
  client: QdrantClient,
  pointId: string,
): Promise<number[] | null> {
  const results = await client.retrieve(PROFILES_COLLECTION, {
    ids: [pointId],
    with_vector: true,
  });
  if (!results.length) return null;
  const vec = results[0].vector;
  if (!vec || !Array.isArray(vec)) return null;
  return vec as number[];
}

export function blendVectors(a: number[], b: number[], weightA = 0.8): number[] {
  return a.map((v, i) => v * weightA + b[i] * (1 - weightA));
}
