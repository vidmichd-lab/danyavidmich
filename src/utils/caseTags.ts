import type { CaseTag } from "./casesStore";
import { isValidCaseTag } from "./casesStore";

export interface CaseTagOption {
  id: CaseTag;
  label: string;
  className: string;
}

export const CASE_TAGS: CaseTagOption[] = [
  {
    id: "branding",
    label: "Branding",
    className: "text-c1"
  },
  {
    id: "visual",
    label: "Visual Communications",
    className: "text-c2"
  },
  {
    id: "product",
    label: "Product Design",
    className: "text-c5"
  },
  {
    id: "web",
    label: "Web",
    className: "text-c4"
  },
  {
    id: "typography",
    label: "Typography",
    className: "text-c6"
  },
  {
    id: "merch",
    label: "Merch",
    className: "text-c7"
  },
  {
    id: "concept",
    label: "Concept",
    className: "text-c3"
  },
  {
    id: "motion",
    label: "Motion",
    className: "text-c8"
  }
];

export const getCaseTag = (id: CaseTag) =>
  CASE_TAGS.find((tag) => tag.id === id) ?? CASE_TAGS[0];

export const CASE_TAG_IDS: CaseTag[] = CASE_TAGS.map((tag) => tag.id);

export const isCaseTag = (value: string): value is CaseTag =>
  isValidCaseTag(value);

