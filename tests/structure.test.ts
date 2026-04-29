import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = process.cwd();

const read = (path: string) => readFileSync(join(root, path), "utf-8");

describe("source structure", () => {
  it("renders homepage filters through the shared component", () => {
    const indexSource = read("src/pages/index.astro");

    expect(indexSource).toContain('import PortfolioFilters from "@components/PortfolioFilters.astro";');
    expect(indexSource.match(/<PortfolioFilters/g) ?? []).toHaveLength(2);
    expect(indexSource).not.toContain('<button class="filter-button');
  });

  it("uses reusable project classes instead of repeated layout ids", () => {
    const pageSources = readdirSync(join(root, "src/pages"))
      .filter((file) => file.endsWith(".astro"))
      .map((file) => read(`src/pages/${file}`))
      .join("\n");
    const globalCss = read("src/styles/global.css");

    expect(pageSources).not.toContain('id="bigcard2"');
    expect(pageSources).not.toContain('id="page3"');
    expect(globalCss).not.toContain("#bigcard2");
    expect(globalCss).not.toContain("#page3");
    expect(globalCss).toContain(".project-card");
    expect(globalCss).toContain(".project-content");
  });
});
