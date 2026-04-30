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
      "chekhov",
      "s7-logistics"
    ]);
  });

  it("keeps impact metrics in data without rendering them under cards", () => {
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
    expect(indexSource).not.toContain("portfolio-impact");
    expect(indexSource).not.toContain("entry.impact");
  });

  it("adds recruiter summary, labelled actions and live location time to CV", () => {
    const cvSource = read("src/pages/cv.astro");

    expect(cvSource).toContain("Lead Brand & Product Designer for tech companies");
    expect(cvSource).toContain("Multidisciplinary Design Lead with 8+ years of experience");
    expect(cvSource).toContain("Open to remote or global roles, including relocation opportunities");
    expect(cvSource).toContain("Now based in Saint Petersburg");
    expect(cvSource).toContain('id="saint-petersburg-time"');
    expect(cvSource).not.toContain(" · ");
    expect(cvSource).toContain(">Open PDF<");
    expect(cvSource).toContain(">Email<");
    expect(cvSource).not.toContain(">LinkedIn profile<");
    expect(cvSource).not.toContain(">Telegram chat<");
    expect(cvSource).not.toContain(">Miro/FigJam<");
    expect(cvSource).not.toContain(">Sketch<");
  });

  it("keeps homepage recruiter detail at normal copy size with visible action labels", () => {
    const indexSource = read("src/pages/index.astro");
    const styles = read("src/styles/global.css");

    expect(indexSource).toContain('class="about-note"');
    expect(indexSource).toContain(">Open CV<");
    expect(indexSource).toContain(">Email<");
    expect(styles).toContain(".about-note");
    expect(styles).toContain("font-size: 18px");
  });

  it("keeps recruiter summary and button labels at normal text size", () => {
    const styles = read("src/styles/global.css");

    expect(styles).toContain(".recruiter-summary");
    expect(styles).toContain(".cv-action-button");
    expect(styles).toContain(".home-action-button");
    expect(styles.match(/font-size: 18px/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  it("does not show top-line metrics in the CV sidebar", () => {
    const cvSource = read("src/pages/cv.astro");

    expect(cvSource).not.toContain("+652% brand search lift for Yandex Practicum Pro");
    expect(cvSource).not.toContain("375K+ users reached by Badoo Hotline in two weeks");
    expect(cvSource).not.toContain("6K+ MAU for co-founded dating app Apt");
  });

  it("removes internal or locally-specific CV phrasing", () => {
    const cvSource = read("src/pages/cv.astro");

    expect(cvSource).not.toContain("rub. per month");
    expect(cvSource).not.toContain("lovemark");
    expect(cvSource).not.toContain("BHT");
    expect(cvSource).not.toContain("Business2Artist");
  });
});
