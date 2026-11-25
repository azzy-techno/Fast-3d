import { defineConfig } from "vite";

// Static site; BASE_PATH is "/Fast-3d/" on GitHub Pages.
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
  build: { target: "es2022", chunkSizeWarningLimit: 900, assetsInlineLimit: 2048 },
});
