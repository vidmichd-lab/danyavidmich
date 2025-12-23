import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@components": resolve(__dirname, "./src/components"),
      "@layouts": resolve(__dirname, "./src/layouts"),
      "@styles": resolve(__dirname, "./src/styles"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@scripts": resolve(__dirname, "./src/scripts")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"]
    }
  }
});

