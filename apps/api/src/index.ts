import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import Fastify from "fastify";

// Railway's internal hostnames resolve to IPv6 but services only listen on IPv4
setDefaultResultOrder("ipv4first");
import cors from "@fastify/cors";
import { loadConfig } from "./config.js";
import prismaPlugin from "./plugins/prisma.js";
import qdrantPlugin from "./plugins/qdrant.js";
import { ensureCollections } from "./services/qdrant.js";
import healthRoutes from "./routes/health.js";
import userRoutes from "./routes/users.js";
import onboardingRoutes from "./routes/onboarding.js";
import ratingRoutes from "./routes/ratings.js";
import profileRoutes from "./routes/profile.js";
import recommendationRoutes from "./routes/recommendations.js";

const config = loadConfig();

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(prismaPlugin);
await fastify.register(qdrantPlugin, { qdrantUrl: config.QDRANT_URL });

// Ensure Qdrant collections exist on startup
fastify.addHook("onReady", async () => {
  ensureCollections(fastify.qdrant).catch((err) => {
    fastify.log.warn({ err }, "Qdrant collections setup failed — will retry on first request");
  });
});

await fastify.register(healthRoutes);
await fastify.register(userRoutes);
await fastify.register(onboardingRoutes);
await fastify.register(ratingRoutes);
await fastify.register(profileRoutes, { config });
await fastify.register(recommendationRoutes, { config });

try {
  await fastify.listen({ port: config.PORT, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
