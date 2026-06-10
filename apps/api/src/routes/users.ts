import type { FastifyInstance } from "fastify";
import { CreateUserRequestSchema } from "@what-to-watch/shared";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/api/users", async (request, reply) => {
    const body = CreateUserRequestSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const existing = await fastify.prisma.user.findUnique({
      where: { email: body.data.email },
    });
    if (existing) {
      return reply.status(200).send({ userId: existing.id, email: existing.email });
    }

    const user = await fastify.prisma.user.create({
      data: { email: body.data.email },
    });

    return reply.status(201).send({ userId: user.id, email: user.email });
  });
}
