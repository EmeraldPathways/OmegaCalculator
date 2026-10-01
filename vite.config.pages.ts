import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/OmegaCalculator/",
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(root) },
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
