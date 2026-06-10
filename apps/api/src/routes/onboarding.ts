import type { FastifyInstance } from "fastify";
import { SEED_TITLES } from "../lib/seed-titles.js";

export default async function onboardingRoutes(fastify: FastifyInstance) {
  fastify.get("/api/onboarding/seed-titles", async () => {
    // Enrich with poster paths from catalog if available
    const tmdbIds = SEED_TITLES.map((t) => t.tmdbId);
    const catalogItems = await fastify.prisma.catalogItem.findMany({
      where: { tmdbId: { in: tmdbIds } },
      select: { tmdbId: true, posterPath: true },
    });

    const posterMap = new Map(catalogItems.map((c) => [c.tmdbId, c.posterPath]));

    return {
      titles: SEED_TITLES.map((t) => ({
        ...t,
        posterPath: posterMap.get(t.tmdbId) ?? null,
      })),
    };
  });
}
