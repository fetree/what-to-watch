import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  // Bundle workspace packages into the output so Railway doesn't
  // need to resolve them at runtime via the workspace symlink
  noExternal: [/^@what-to-watch\//],
});
