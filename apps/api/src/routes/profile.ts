import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { ProfileUpdateRequestSchema } from "../schemas.js";
import { createEmbeddingsClient } from "../services/embeddings.js";
import { createClaudeService } from "../services/claude.js";
import {
  upsertProfilePoint,
  getProfileVector,
  searchCatalog,
  blendVectors,
  PROFILES_COLLECTION,
  CATALOG_COLLECTION,
} from "../services/qdrant.js";
import type { Env } from "../config.js";

export default async function profileRoutes(fastify: FastifyInstance, opts: { config: Env }) {
  const embeddings = createEmbeddingsClient(opts.config.OPENAI_API_KEY);
  const claude = createClaudeService(opts.config.ANTHROPIC_API_KEY);

  fastify.post("/api/profile/generate", async (request, reply) => {
    const { userId } = request.body as { userId: string };
    if (!userId) return reply.status(400).send({ error: "userId required" });

    const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: "User not found" });

    const ratings = await fastify.prisma.rating.findMany({ where: { userId } });
    if (ratings.length < 3) {
      return reply
        .status(400)
        .send({ error: "Rate at least 3 titles before generating a profile" });
    }

    const tasteProfileText = await claude.extractTasteProfile(
      ratings.map((r) => ({ title: r.title, mediaType: r.mediaType, score: r.score })),
    );

    const vector = await embeddings.embedOne(tasteProfileText);
    const pointId = user.qdrantPointId ?? randomUUID();

    await upsertProfilePoint(fastify.qdrant, pointId, vector, userId);

    await fastify.prisma.user.update({
      where: { id: userId },
      data: { tasteProfileText, qdrantPointId: pointId },
    });

    return { tasteProfileText, qdrantPointId: pointId };
  });

  fastify.post("/api/profile/update", async (request, reply) => {
    const body = ProfileUpdateRequestSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const { userId, tmdbId, feedback } = body.data;

    const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.qdrantPointId) {
      return reply.status(400).send({ error: "User has no profile yet" });
    }

    const catalogItem = await fastify.prisma.catalogItem.findUnique({ where: { tmdbId } });
    if (!catalogItem?.qdrantPointId) {
      return reply.status(404).send({ error: "Title not found in catalog" });
    }

    const [profileVec, catalogResults] = await Promise.all([
      getProfileVector(fastify.qdrant, user.qdrantPointId),
      fastify.qdrant.retrieve(CATALOG_COLLECTION, {
        ids: [catalogItem.qdrantPointId],
        with_vector: true,
      }),
    ]);

    if (!profileVec) return reply.status(500).send({ error: "Profile vector not found" });

    const titleVecRaw = catalogResults[0]?.vector;
    if (!titleVecRaw || !Array.isArray(titleVecRaw)) {
      return reply.status(500).send({ error: "Catalog vector not found" });
    }
    const titleVec = titleVecRaw as number[];

    // Move toward liked titles, away from disliked ones
    const direction = feedback === "like" ? 1 : -1;
    const blendWeight = feedback === "like" ? 0.85 : 0.95;
    const adjustedTitleVec = direction === -1 ? titleVec.map((v) => -v) : titleVec;

    const newVector = blendVectors(profileVec, adjustedTitleVec, blendWeight);

    await upsertProfilePoint(fastify.qdrant, user.qdrantPointId, newVector, userId);

    return { updated: true };
  });
}
