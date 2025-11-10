import { describe, expect, it, beforeEach } from "vitest";
import {
  applyLoadingStyles,
  markLoaded,
  PLACEHOLDER,
  shouldKeepEager,
  EAGER_THRESHOLD
} from "@utils/lazy-media";

describe("lazy-media helpers", () => {
  let image: HTMLImageElement;

  beforeEach(() => {
    image = document.createElement("img");
  });

  it("marks elements as loaded", () => {
    image.classList.add("lazy-media");
    markLoaded(image);

    expect(image.classList.contains("lazy-loaded")).toBe(true);
    expect(image.classList.contains("lazy-media")).toBe(false);
  });

  it("applies loading styles for incomplete assets", () => {
    applyLoadingStyles(image);

    expect(image.classList.contains("lazy-media")).toBe(true);
    expect(image.classList.contains("lazy-loaded")).toBe(false);
  });

  it("applies loading styles but keeps loaded state when element already complete", () => {
    Object.defineProperty(image, "complete", { value: true });
    applyLoadingStyles(image);

    expect(image.classList.contains("lazy-loaded")).toBe(true);
    expect(image.classList.contains("lazy-media")).toBe(false);
  });

  it("decides eager loading for early indices", () => {
    expect(shouldKeepEager(0, image)).toBe(true);
    expect(shouldKeepEager(EAGER_THRESHOLD, image)).toBe(false);
  });

  it("keeps eager images flagged with attributes", () => {
    image.loading = "eager";
    expect(shouldKeepEager(10, image)).toBe(true);

    image.loading = "lazy";
    image.setAttribute("fetchpriority", "high");
    expect(shouldKeepEager(10, image)).toBe(true);

    image.removeAttribute("fetchpriority");
    image.dataset.skipLazy = "true";
    expect(shouldKeepEager(10, image)).toBe(true);
  });

  it("exposes placeholder constant", () => {
    expect(PLACEHOLDER).toContain("data:image/svg+xml");
  });
});

