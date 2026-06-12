import { defineRailway, project, service, postgres, github, image, volume } from "railway/iac";

export default defineRailway(() => {
  // --- Databases & infrastructure ---

  const db = postgres("postgres");

  // Persistent volume for Qdrant embeddings
  const qdrantVolume = volume("qdrant-storage");

  const qdrant = service("qdrant", {
    source: image("qdrant/qdrant"),
    deploy: {
      numReplicas: 1,
      sleepApplication: false,
    },
    variables: {
      QDRANT__STORAGE__PATH: "/qdrant/storage",
      QDRANT__LOG_LEVEL: "INFO",
    },
    volumeMounts: {
      [qdrantVolume.address]: {
        mountPath: "/qdrant/storage",
      },
    },
  });

  // --- API service ---

  const api = service("api", {
    source: github("fetree/what-to-watch"),
    configFile: "railway.toml",
    deploy: {
      numReplicas: 1,
      sleepApplication: true,
    },
    variables: {
      DATABASE_URL: db.env.DATABASE_URL,
      QDRANT_URL: "http://qdrant.railway.internal:6333",
      ANTHROPIC_API_KEY: { isSealed: true },
      OPENAI_API_KEY: { isSealed: true },
      TMDB_API_KEY: { isSealed: true },
      PORT: "3000",
      // Prevent Nixpacks from auto-adding --frozen-lockfile
      NIXPACKS_INSTALL_CMD: "pnpm install",
    },
  });

  // --- Web service ---

  const web = service("web", {
    source: github("fetree/what-to-watch"),
    configFile: "apps/web/railway.toml",
    deploy: {
      numReplicas: 1,
      sleepApplication: true,
    },
    variables: {
      VITE_API_URL: { isSealed: false, isOptional: true },
      NIXPACKS_INSTALL_CMD: "pnpm install",
    },
  });

  return project("what-to-watch", {
    resources: [db, qdrantVolume, qdrant, api, web],
  });
});
