import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');
const aiContentFile = join(rootDir, 'src', 'data', 'ai-content.json');

export interface ProjectContent {
  id: string;
  shortDescription: string;
  longDescription: string;
  subtitle: string;
}

let aiContentCache: ProjectContent[] | null = null;

/**
 * Load AI-generated content from cache file
 */
export function getAIContent(): ProjectContent[] {
  if (aiContentCache) {
    return aiContentCache;
  }

  if (!existsSync(aiContentFile)) {
    // Only log in development, terser will remove this in production
    if (import.meta.env.DEV) {
      console.warn(`AI content file not found: ${aiContentFile}`);
    }
    return [];
  }

  try {
    const content = JSON.parse(readFileSync(aiContentFile, 'utf-8'));
    aiContentCache = Array.isArray(content) ? content : [];
    return aiContentCache;
  } catch (error) {
    // Only log in development, terser will remove this in production
    if (import.meta.env.DEV) {
      console.error('Error loading AI content:', error);
    }
    aiContentCache = [];
    return [];
  }
}

/**
 * Get AI content for a specific project
 */
export function getProjectAIContent(projectId: string): ProjectContent | null {
  const content = getAIContent();
  return content.find(c => c.id === projectId) || null;
}

