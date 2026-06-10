import type { FastifyInstance } from "fastify";
import { createClaudeService } from "../services/claude.js";
import { searchCatalog, getProfileVector } from "../services/qdrant.js";
import type { Env } from "../config.js";

export default async function recommendationRoutes(
  fastify: FastifyInstance,
  opts: { config: Env },
) {
  const claude = createClaudeService(opts.config.ANTHROPIC_API_KEY);

  fastify.get("/api/recommendations/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: "User not found" });
    if (!user.qdrantPointId || !user.tasteProfileText) {
      return reply.status(400).send({ error: "Profile not generated yet" });
    }

    const profileVec = await getProfileVector(fastify.qdrant, user.qdrantPointId);
    if (!profileVec) return reply.status(500).send({ error: "Profile vector not found" });

    // Exclude titles the user has already rated
    const ratedTmdbIds = await fastify.prisma.rating
      .findMany({ where: { userId }, select: { tmdbId: true } })
      .then((rs: Array<{ tmdbId: number }>) => rs.map((r) => r.tmdbId));

    const searchResults = await searchCatalog(fastify.qdrant, profileVec, 30);

    const candidateTmdbIds = searchResults
      .map((r) => Number(r.payload.tmdb_id))
      .filter((id) => !ratedTmdbIds.includes(id))
      .slice(0, 20);

    const catalogItems = await fastify.prisma.catalogItem.findMany({
      where: { tmdbId: { in: candidateTmdbIds } },
    });

    const candidates = candidateTmdbIds
      .map((id) => catalogItems.find((c) => c.tmdbId === id))
      .filter(Boolean)
      .map((c) => ({
        tmdbId: c!.tmdbId,
        title: c!.title,
        mediaType: c!.mediaType,
        overview: c!.overview,
        genres: JSON.parse(c!.genres) as string[],
        posterPath: c!.posterPath,
      }));

    if (candidates.length < 8) {
      return reply.status(503).send({ error: "Not enough catalog data — run the seed script first" });
    }

    const recommendations = await claude.rerankAndBlurb(user.tasteProfileText, candidates);

    return { recommendations };
  });
}
