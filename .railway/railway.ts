import { defineRailway, project, service, postgres, github, template, ref } from "railway/iac";

export default defineRailway(() => {
  // --- Databases & infrastructure ---

  const db = postgres("postgres");

  // Qdrant runs as its own service from the Railway template
  const qdrant = service("qdrant", {
    source: template("qdrant"),
  });

  // --- API service ---

  const api = service("api", {
    source: github("fetree/what-to-watch"),
    // Delegates build/deploy config to railway.toml at the repo root
    configFile: "railway.toml",
    variables: {
      // Injected automatically from the postgres service
      DATABASE_URL: db.env.DATABASE_URL,
      // Qdrant is reachable internally on its service name
      QDRANT_URL: `http://qdrant.railway.internal:6333`,
      // Secrets — set these in the Railway dashboard or via `railway variables set`
      ANTHROPIC_API_KEY: { isSealed: true },
      OPENAI_API_KEY: { isSealed: true },
      TMDB_API_KEY: { isSealed: true },
      PORT: "3000",
    },
  });

  // --- Web service ---

  const web = service("web", {
    source: github("fetree/what-to-watch"),
    // Delegates build/deploy config to apps/web/railway.toml
    configFile: "apps/web/railway.toml",
    variables: {
      // Set to the API service's public Railway domain after first deploy
      // e.g. https://api-production-xxxx.up.railway.app
      VITE_API_URL: { isSealed: false, isOptional: true },
    },
  });

  return project("what-to-watch", {
    resources: [db, qdrant, api, web],
  });
});
