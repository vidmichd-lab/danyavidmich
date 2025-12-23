import { getCases, type CaseEntry } from "./casesStore";

export interface AIContentConfig {
  apiKey?: string;
  model?: string;
  cacheDir?: string;
}

export interface ProjectContent {
  shortDescription: string; // For cards, OG tags
  longDescription: string; // For project pages
  subtitle: string; // For headers
  keywords?: string[];
}

const DEFAULT_STYLE_GUIDE = `
You are a professional copywriter for a design portfolio. Write concise, professional descriptions in English.

Style guidelines:
- Use active voice
- Be specific about achievements and impact
- Mention key technologies/tools when relevant
- Keep descriptions concise (50-80 words for short, 100-150 for long)
- Focus on design decisions and outcomes
- Use professional terminology
- Avoid generic phrases
- Be factual and results-oriented
`;

const PROJECT_PROMPT_TEMPLATE = (caseEntry: CaseEntry) => `
${DEFAULT_STYLE_GUIDE}

Project information:
- Title: ${caseEntry.title}
- Category: ${caseEntry.tag}
- Description tag: ${caseEntry.description || 'N/A'}

Generate content for this design project:

1. Short description (50-80 words): For cards, OG tags, and previews. Focus on what was designed and key outcomes.

2. Long description (100-150 words): For project detail pages. Include context, design approach, and results.

3. Subtitle: A concise tagline (5-10 words) for the project header.

Return JSON format:
{
  "shortDescription": "...",
  "longDescription": "...",
  "subtitle": "..."
}
`;

// Cache for generated content
const contentCache = new Map<string, ProjectContent>();

/**
 * Generate content using AI (placeholder - implement with actual API)
 * For now, returns structured content based on case data
 */
export async function generateProjectContent(
  caseEntry: CaseEntry,
  useAI: boolean = false
): Promise<ProjectContent> {
  const cacheKey = `content-${caseEntry.id}`;
  
  // Check cache first
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  if (useAI) {
    // TODO: Implement actual AI API call
    // For now, return structured content
    return generateStructuredContent(caseEntry);
  }

  return generateStructuredContent(caseEntry);
}

/**
 * Generate structured content from case data
 * This provides consistent formatting until AI is fully integrated
 */
function generateStructuredContent(caseEntry: CaseEntry): ProjectContent {
  const tagDescriptions: Record<string, string> = {
    branding: "Brand identity and visual system",
    visual: "Visual communications and campaign design",
    product: "Digital product design",
    web: "Web design and development",
    typography: "Typeface and typography design",
    concept: "Conceptual design and creative direction",
    merch: "Merchandise and product design",
    motion: "Motion graphics and animation",
  };

  const categoryDesc = tagDescriptions[caseEntry.tag] || caseEntry.description || "Design work";
  
  const shortDescription = `${categoryDesc} for ${caseEntry.title}. ${caseEntry.description || 'Professional design work by Danya Vidmich.'}`;
  
  const longDescription = `${categoryDesc} for ${caseEntry.title}. ${caseEntry.description || 'A comprehensive design project showcasing professional expertise in visual communication and brand identity.'} Designed by Danya Vidmich, Multidisciplinary Design Lead with 8+ years of experience in major tech companies.`;
  
  const subtitle = caseEntry.title;

  return {
    shortDescription,
    longDescription,
    subtitle,
  };
}

/**
 * Generate AI content using OpenAI or Yandex GPT API
 */
export async function generateWithAI(
  prompt: string,
  config: {
    provider: "openai" | "yandex";
    apiKey: string;
    folderId?: string;
    model?: string;
  }
): Promise<string> {
  try {
    let response;
    
    if (config.provider === "yandex") {
      if (!config.folderId) {
        throw new Error("Yandex GPT requires folderId");
      }
      
      response = await fetch(`https://llm.api.cloud.yandex.net/foundationModels/v1/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Api-Key ${config.apiKey}`,
          "x-folder-id": config.folderId,
        },
        body: JSON.stringify({
          modelUri: `gpt://${config.folderId}/yandexgpt/latest`,
          completionOptions: {
            stream: false,
            temperature: 0.7,
            maxTokens: "500",
          },
          messages: [
            {
              role: "system",
              text: DEFAULT_STYLE_GUIDE,
            },
            {
              role: "user",
              text: prompt,
            },
          ],
        }),
      });
    } else {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: DEFAULT_STYLE_GUIDE,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (config.provider === "yandex") {
      return data.result?.alternatives?.[0]?.message?.text || "";
    } else {
      return data.choices[0]?.message?.content || "";
    }
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}

/**
 * Parse AI response and extract structured content
 */
export function parseAIContent(aiResponse: string): ProjectContent {
  try {
    // Try to extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        shortDescription: parsed.shortDescription || "",
        longDescription: parsed.longDescription || "",
        subtitle: parsed.subtitle || "",
      };
    }
    
    // Fallback: return as-is
    return {
      shortDescription: aiResponse.substring(0, 150),
      longDescription: aiResponse,
      subtitle: "",
    };
  } catch (error) {
    console.error("Error parsing AI content:", error);
    return {
      shortDescription: aiResponse.substring(0, 150),
      longDescription: aiResponse,
      subtitle: "",
    };
  }
}

