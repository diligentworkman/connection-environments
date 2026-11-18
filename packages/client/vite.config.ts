import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { reloadPlugin } from "./reload-plugin.js";

export default defineConfig(({ command, mode, isPreview }) => ({
  build: {
    outDir: mode === "development" ? "dist-dev" : "dist",
  },
  plugins: [
    svelte(),
    ...(command === "build" && mode === "development" && !isPreview
      ? [reloadPlugin()]
      : []),
  ],
}));
