import { getCases } from "./casesStore";
import { getProjectAIContent } from "./aiContentStore";

const BASE_URL = "https://danyavidmich.com";

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
    description: "Graphic and product designer. Ex Badoo, Yandex Music, Yandex Go and Art. Lebedev Studio.",
    ogTitle: "Danya Vidmich. Graphic and product design",
    ogDescription: "Graphic and product designer. Ex Badoo, Yandex Music, Yandex Go and Art. Lebedev Studio. Making media Lug. Co-founded dating app Apt",
    ogUrl: `${BASE_URL}/${slug}`,
    ogImage: `${BASE_URL}/Union.png?v=2`,
  };

  // Special cases for specific pages
  const specialPages: Record<string, Partial<OGMeta>> = {
    cv: {
      title: "Danya Vidmich — Work Experience",
      description: "Multidisciplinary Design Lead with 8+ years of experience in major tech companies. View full CV and work experience.",
      ogTitle: "Danya Vidmich — Work Experience & CV",
      ogDescription: "Multidisciplinary Design Lead with 8+ years of experience in major tech companies (Yandex Practicum, Yandex Music, Badoo, Yandex Go). Specializes in brand systems, digital product design and large-scale campaigns.",
      ogUrl: `${BASE_URL}/cv`,
    },
    "": {
      title: "Designer Danya Vidmich",
      description: "Graphic and product designer. Ex Badoo, Yandex Music, Yandex Go and Art. Lebedev Studio. Making media Lug. Co-founded dating app Apt",
      ogTitle: "Danya Vidmich. Graphic and product design",
      ogDescription: "Graphic and product designer. Ex Badoo, Yandex Music, Yandex Go and Art. Lebedev Studio. Making media Lug. Co-founded dating app Apt",
      ogUrl: BASE_URL,
    },
  };

  const special = specialPages[slug] || {};
  return { ...defaultMeta, ...special };
}

