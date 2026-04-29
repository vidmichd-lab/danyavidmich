import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import cases from "../src/data/cases.json";

const root = process.cwd();

describe("homepage content configuration", () => {
  it("includes the Made with AI project linked to the Practicum Award page", () => {
    expect(cases).toContainEqual(
      expect.objectContaining({
        id: "made-with-ai",
        title: "Made with AI",
        tag: "branding",
        description: "Branding",
        coverImage: "/img/gr/made-with-ai/frame-16.webp",
        linkUrl: "https://practicum.yandex.ru/practicum-award"
      })
    );
  });

  it("includes the added poster frames on the homepage", () => {
    const indexSource = readFileSync(join(root, "src/pages/index.astro"), "utf-8");

    expect(indexSource).toContain("/img/gr/posters/frame-6.webp");
    expect(indexSource).toContain("/img/gr/posters/frame-44.webp");
    expect(indexSource).toContain("/img/gr/posters/frame-61.webp");
  });

  it("rounds site media to 10px", () => {
    const globalCss = readFileSync(join(root, "src/styles/global.css"), "utf-8");

    expect(globalCss).toMatch(/img\s*\{[\s\S]*border-radius:\s*10px;/);
    expect(globalCss).toMatch(/iframe\s*\{[\s\S]*border-radius:\s*10px;/);
  });
});
