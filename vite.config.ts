import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

// Build a single MCP App HTML file as a self-contained bundle.
// Set the INPUT env var to choose which app to build.
// Usage: INPUT=record-browser vite build
const input = process.env.INPUT || "record-browser";

export default defineConfig({
  root: resolve(__dirname, "src/apps"),
  plugins: [viteSingleFile()],
  build: {
    outDir: resolve(__dirname, "dist/apps"),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, `src/apps/${input}.html`),
    },
  },
});
