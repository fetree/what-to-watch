import type { FastifyInstance } from "fastify";
import { RatingRequestSchema } from "../schemas.js";

export default async function ratingRoutes(fastify: FastifyInstance) {
  fastify.post("/api/ratings", async (request, reply) => {
    const body = RatingRequestSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const { userId, tmdbId, title, mediaType, score } = body.data;

    const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: "User not found" });

    const rating = await fastify.prisma.rating.upsert({
      where: { userId_tmdbId: { userId, tmdbId } },
      create: { userId, tmdbId, title, mediaType, score },
      update: { score },
    });

    return reply.status(201).send({
      id: rating.id,
      userId: rating.userId,
      tmdbId: rating.tmdbId,
      title: rating.title,
      mediaType: rating.mediaType,
      score: rating.score,
      ratedAt: rating.ratedAt.toISOString(),
    });
  });
}
