#!/usr/bin/env node
/**
 * Fix image paths in all project pages to use optimized images
 */

import { readFile, writeFile } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join } from 'path';

const PAGES_DIR = 'src/pages';

async function fixImagePaths(filePath) {
  const content = await readFile(filePath, 'utf-8');
  
  // Skip index.astro and cv.astro - they're already fixed
  if (filePath.includes('index.astro') || filePath.includes('cv.astro')) {
    return false;
  }
  
  let modified = false;
  let newContent = content;
  
  // Check if getOptimizedImagePath is already imported
  const hasImport = content.includes('getOptimizedImagePath');
  
  // Add import if needed
  if (!hasImport && content.includes('src="/img/')) {
    const importMatch = content.match(/^import.*from.*@utils\/ogMeta.*$/m);
    if (importMatch) {
      newContent = newContent.replace(
        importMatch[0],
        `${importMatch[0]}\nimport { getOptimizedImagePath } from "@utils/imageUtils";`
      );
      modified = true;
    }
  }
  
  // Replace all src="/img/... with getOptimizedImagePath
  const imgPattern = /src="(\/img\/[^"]+)"/g;
  const matches = [...newContent.matchAll(imgPattern)];
  
  for (const match of matches) {
    const originalPath = match[1];
    // Skip if already using getOptimizedImagePath
    if (!match[0].includes('getOptimizedImagePath')) {
      const replacement = `src={getOptimizedImagePath("${originalPath}")}`;
      newContent = newContent.replace(match[0], replacement);
      modified = true;
    }
  }
  
  // Add loading and decoding attributes if missing
  const imgTagPattern = /<img\s+src=\{getOptimizedImagePath\([^)]+\)\}([^>]*)>/g;
  newContent = newContent.replace(imgTagPattern, (match, attrs) => {
    if (!attrs.includes('loading=') && !attrs.includes('decoding=')) {
      return match.replace('>', ' loading="lazy" decoding="async" />');
    }
    return match;
  });
  
  if (modified) {
    await writeFile(filePath, newContent, 'utf-8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

async function processAllPages() {
  const files = await readdir(PAGES_DIR);
  const astroFiles = files.filter(f => f.endsWith('.astro'));
  
  let fixed = 0;
  for (const file of astroFiles) {
    const filePath = join(PAGES_DIR, file);
    if (await fixImagePaths(filePath)) {
      fixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} files.`);
}

processAllPages().catch(console.error);

