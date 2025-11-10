import { readFile, writeFile, mkdir, stat } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const CASES_FILE_URL = new URL("../data/cases.json", import.meta.url);

export type CaseLayout = "single" | "double";

export interface CaseButton {
  label: string;
  url: string;
}

export interface CaseGalleryItem {
  id: string;
  title?: string;
  tag?: CaseTag;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export const CASE_TAG_VALUES = [
  "branding",
  "visual",
  "product",
  "web",
  "typography",
  "merch",
  "concept",
  "motion"
] as const;

export type CaseTag = (typeof CASE_TAG_VALUES)[number];

export interface CaseEntry {
  id: string;
  title: string;
  slug: string;
  tag: CaseTag;
  isHero: boolean;
  description?: string;
  button?: CaseButton;
  layout: CaseLayout;
  coverImage: string;
  coverImageAlt?: string;
  secondaryImage?: string;
  linkUrl?: string;
  gallery: CaseGalleryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseInput {
  title: string;
  slug: string;
  tag: CaseTag;
  isHero?: boolean;
  description?: string;
  button?: CaseButton;
  layout: CaseLayout;
  coverImage: string;
  coverImageAlt?: string;
  secondaryImage?: string;
  linkUrl?: string;
  gallery?: CaseGalleryItem[];
}

const CASES_FILE_PATH = fileURLToPath(CASES_FILE_URL);
const DEFAULT_TAG: CaseTag = CASE_TAG_VALUES[0];

export const isValidCaseTag = (value: string): value is CaseTag =>
  (CASE_TAG_VALUES as readonly string[]).includes(value);

const getDefaultLinkForSlug = (slug: string) =>
  slug ? `/${slug}.html` : "";

const toBoolean = (value: unknown) => value === true || value === "true";

const ensureCasesFileExists = async () => {
  try {
    await stat(CASES_FILE_PATH);
  } catch {
    const directory = dirname(CASES_FILE_PATH);
    await mkdir(directory, { recursive: true });
    await writeFile(CASES_FILE_PATH, "[]", "utf-8");
  }
};

export const readCases = async (): Promise<CaseEntry[]> => {
  await ensureCasesFileExists();
  const raw = await readFile(CASES_FILE_PATH, "utf-8");
  try {
    const data = JSON.parse(raw) as Partial<CaseEntry>[];
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => {
      const slug = item?.slug ?? "";
      const tag =
        item?.tag && isValidCaseTag(item.tag) ? item.tag : DEFAULT_TAG;
      const linkUrl =
        item?.linkUrl !== undefined && item.linkUrl !== null
          ? item.linkUrl
          : getDefaultLinkForSlug(slug);
      const isHero = toBoolean(item?.isHero);
      const gallery = Array.isArray(item?.gallery)
        ? item.gallery.map((galleryItem): CaseGalleryItem => ({
            id: galleryItem.id ?? randomUUID(),
            title: galleryItem.title,
            tag:
              galleryItem.tag && isValidCaseTag(galleryItem.tag)
                ? galleryItem.tag
                : undefined,
            image: galleryItem.image,
            createdAt: galleryItem.createdAt ?? new Date().toISOString(),
            updatedAt: galleryItem.updatedAt ?? new Date().toISOString()
          }))
        : [];

      return {
        ...item,
        slug,
        tag,
        isHero,
        gallery,
        linkUrl
      } as CaseEntry;
    });
  } catch {
    return [];
  }
};

const writeCases = async (cases: CaseEntry[]) => {
  await writeFile(CASES_FILE_PATH, JSON.stringify(cases, null, 2), "utf-8");
};

export const getCases = async (): Promise<CaseEntry[]> => {
  const cases = await readCases();
  return [...cases].sort((a, b) => {
    const heroDiff = Number(b.isHero) - Number(a.isHero);
    if (heroDiff !== 0) return heroDiff;
    const aDate = a.createdAt ?? "";
    const bDate = b.createdAt ?? "";
    if (aDate === bDate) return 0;
    return aDate > bDate ? -1 : 1;
  });
};

export const addCase = async (input: CaseInput): Promise<CaseEntry> => {
  const cases = await readCases();
  const now = new Date().toISOString();
  const linkUrl =
    input.linkUrl !== undefined && input.linkUrl !== null
      ? input.linkUrl
      : getDefaultLinkForSlug(input.slug);
  const isHero = toBoolean(input.isHero);
  const gallery = Array.isArray(input.gallery) ? input.gallery : [];
  const entry: CaseEntry = {
    id: randomUUID(),
    ...input,
    isHero,
    linkUrl,
    gallery,
    createdAt: now,
    updatedAt: now
  };
  const nextCases = cases.map((caseItem) =>
    isHero
      ? {
          ...caseItem,
          isHero: false
        }
      : caseItem
  );
  nextCases.push(entry);
  await writeCases(nextCases);
  return entry;
};

export const updateCase = async (
  id: string,
  update: Partial<CaseInput>
): Promise<CaseEntry | undefined> => {
  const cases = await readCases();
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updated: CaseEntry = {
    ...cases[index],
    ...update,
    isHero:
      update.isHero !== undefined
        ? toBoolean(update.isHero)
        : cases[index].isHero,
    button: update.button ?? cases[index].button,
    layout: update.layout ?? cases[index].layout,
    tag: update.tag ?? cases[index].tag,
    linkUrl:
      update.linkUrl !== undefined
        ? update.linkUrl
        : (() => {
            const current =
              cases[index].linkUrl ??
              getDefaultLinkForSlug(cases[index].slug);
            const previousDefault = getDefaultLinkForSlug(cases[index].slug);
            if (
              update.slug &&
              update.slug !== cases[index].slug &&
              current === previousDefault
            ) {
              return getDefaultLinkForSlug(update.slug);
            }
            return current;
          })(),
    coverImage: update.coverImage ?? cases[index].coverImage,
    coverImageAlt: update.coverImageAlt ?? cases[index].coverImageAlt,
    secondaryImage: update.secondaryImage ?? cases[index].secondaryImage,
    gallery: Array.isArray(update.gallery)
      ? update.gallery
      : cases[index].gallery,
    updatedAt: new Date().toISOString()
  };

  const nextCases = cases.map((caseItem, caseIndex) => {
    if (caseIndex === index) {
      return updated;
    }
    if (updated.isHero) {
      return {
        ...caseItem,
        isHero: false
      };
    }
    return caseItem;
  });

  await writeCases(nextCases);
  return updated;
};

export const deleteCase = async (id: string): Promise<boolean> => {
  const cases = await readCases();
  const next = cases.filter((c) => c.id !== id);
  if (next.length === cases.length) return false;
  await writeCases(next);
  return true;
};

