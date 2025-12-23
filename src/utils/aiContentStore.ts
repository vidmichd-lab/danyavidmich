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
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(`AI content file not found: ${aiContentFile}`);
    }
    return [];
  }

  try {
    aiContentCache = JSON.parse(readFileSync(aiContentFile, 'utf-8'));
    return aiContentCache;
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Error loading AI content:', error);
    }
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

