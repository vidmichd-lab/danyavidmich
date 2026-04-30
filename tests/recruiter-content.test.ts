import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import cases from "../src/data/cases.json";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf-8");

describe("recruiter-facing portfolio content", () => {
  it("puts the strongest international tech cases first", () => {
    expect(cases.slice(0, 6).map((entry) => entry.id)).toEqual([
      "badoo-ooh",
      "yandex-practicum-pro",
      "yam-2024",
      "apt-product",
      "bandlink",
      "s7-logistics"
    ]);
  });

  it("surfaces impact metrics on key portfolio cards", () => {
    const expectedImpacts = [
      "375K+ users in two weeks",
      "+652% brand search lift",
      "70M+ MAU music platform",
      "6K+ MAU in six months",
      "Artist analytics identity relaunch",
      "24-hour air delivery sub-brand"
    ];

    for (const impact of expectedImpacts) {
      expect(cases).toContainEqual(expect.objectContaining({ impact }));
    }

    const indexSource = read("src/pages/index.astro");
    expect(indexSource).toContain("entry.impact");
  });

  it("adds recruiter summary, labelled actions and live location time to CV", () => {
    const cvSource = read("src/pages/cv.astro");

    expect(cvSource).toContain("Lead Brand & Product Designer for tech companies");
    expect(cvSource).toContain("Open to remote or global roles");
    expect(cvSource).toContain("Available for contract/full-time");
    expect(cvSource).toContain("Working English");
    expect(cvSource).toContain("Now based in Saint Petersburg");
    expect(cvSource).toContain('id="saint-petersburg-time"');
    expect(cvSource).toContain(">Download CV<");
    expect(cvSource).toContain(">Email<");
    expect(cvSource).toContain(">LinkedIn<");
  });

  it("removes internal or locally-specific CV phrasing", () => {
    const cvSource = read("src/pages/cv.astro");

    expect(cvSource).not.toContain("rub. per month");
    expect(cvSource).not.toContain("lovemark");
    expect(cvSource).not.toContain("BHT");
    expect(cvSource).not.toContain("Business2Artist");
  });
});
