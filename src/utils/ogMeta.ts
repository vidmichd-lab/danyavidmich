import { getCases } from "./casesStore";
import { getProjectAIContent } from "./aiContentStore";

// Use environment variable or fallback to production URL
const BASE_URL = import.meta.env.PUBLIC_SITE_URL || "https://danyavidmich.com";

export interface OGMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
}

export async function getOGMeta(slug: string, pageTitle?: string): Promise<OGMeta> {
  const cases = await getCases();
  const caseEntry = cases.find((c) => c.slug === slug);

  if (caseEntry) {
    const title = pageTitle || `${caseEntry.title} — Danya Vidmich`;
    
    // Try to get AI-generated content first
    const aiContent = getProjectAIContent(caseEntry.id);
    const description = aiContent?.shortDescription 
      || (caseEntry.description 
        ? `${caseEntry.description} — Design work by Danya Vidmich`
        : `Design work: ${caseEntry.title} by Danya Vidmich`);
    
    return {
      title,
      description,
      ogTitle: `${caseEntry.title} — Danya Vidmich`,
      ogDescription: description,
      ogUrl: `${BASE_URL}/${caseEntry.slug}`,
      ogImage: caseEntry.coverImage
        ? `${BASE_URL}${caseEntry.coverImage}`
        : `${BASE_URL}/Union.png`,
    };
  }

  // Default meta for pages without case data
  const defaultMeta: OGMeta = {
    title: "Danya Vidmich — Designer",
    description: "Lead Brand & Product Designer for tech companies. 8+ years across Badoo, Yandex and Art. Lebedev.",
    ogTitle: "Danya Vidmich. Lead Brand & Product Designer",
    ogDescription: "Lead Brand & Product Designer for tech companies. Brand systems, campaigns, AI-assisted production and product launches.",
    ogUrl: `${BASE_URL}/${slug}`,
    ogImage: `${BASE_URL}/Union.png?v=2`,
  };

  // Special cases for specific pages
  const specialPages: Record<string, Partial<OGMeta>> = {
    cv: {
      title: "Danya Vidmich — Lead Brand & Product Designer",
      description: "Lead Brand & Product Designer for tech companies. 8+ years across Badoo, Yandex and Art. Lebedev. Open to remote or global roles.",
      ogTitle: "Danya Vidmich — Lead Brand & Product Designer",
      ogDescription: "Lead Brand & Product Designer for tech companies. 8+ years across Badoo, Yandex and Art. Lebedev. Brand systems, campaigns and AI-assisted production.",
      ogUrl: `${BASE_URL}/cv/`,
    },
    consultation: {
      title: "Danya Vidmich — Consultation",
      description: "60‑minute consultation: skills assessment, portfolio review, competency development, design systems, corporate career, visual language and branding.",
      ogTitle: "Danya Vidmich — Consultation 60 min",
      ogDescription: "60 min consultation: skills assessment, portfolio review, design team management, design systems, corporate career, visual language and branding.",
      ogUrl: `${BASE_URL}/consultation/`,
    },
    "": {
      title: "Danya Vidmich — Lead Brand & Product Designer",
      description: "Lead Brand & Product Designer for tech companies. 8+ years across Badoo, Yandex and Art. Lebedev. Open to remote or global roles.",
      ogTitle: "Danya Vidmich. Lead Brand & Product Designer",
      ogDescription: "Lead Brand & Product Designer for tech companies. Brand systems, campaigns, AI-assisted production and product launches.",
      ogUrl: BASE_URL,
    },
  };

  const special = specialPages[slug] || {};
  return { ...defaultMeta, ...special };
}
