import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  server: {
    host: true
  },
  build: {
    assets: "assets",
    inlineStylesheets: "auto"
  },
  vite: {
    build: {
      cssCodeSplit: false
    }
  }
});

