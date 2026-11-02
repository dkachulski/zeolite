// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://trassing.com",
  trailingSlash: "ignore",
  // Keep the whitespace between inline elements; the design depends on it
  // (e.g. the space between a counter and its label).
  compressHTML: false,
  build: {
    // The whole stylesheet is small; inlining it removes the only
    // render-blocking request.
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
