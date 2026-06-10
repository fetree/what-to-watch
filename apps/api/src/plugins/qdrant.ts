import fp from "fastify-plugin";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    qdrant: QdrantClient;
  }
}

export default fp(async function qdrantPlugin(
  fastify: FastifyInstance,
  opts: { qdrantUrl: string },
) {
  const client = new QdrantClient({ url: opts.qdrantUrl });
  fastify.decorate("qdrant", client);
});
