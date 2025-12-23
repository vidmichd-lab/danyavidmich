import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const casesFile = join(rootDir, 'src', 'data', 'cases.json');
const pagesDir = join(rootDir, 'src', 'pages');

// Read cases
const cases = JSON.parse(readFileSync(casesFile, 'utf-8'));

// Find all .astro files in pages directory (excluding index, cv, sub)
const pageFiles = (await glob('*.astro', { cwd: pagesDir }))
  .filter(f => !['index.astro', 'cv.astro', 'sub.astro'].includes(f));

console.log(`Found ${pageFiles.length} page files\n`);

// Extract original texts from pages
const textsMap = {};

for (const file of pageFiles) {
  const filePath = join(pagesDir, file);
  const content = readFileSync(filePath, 'utf-8');
  
  // Find slug from getOGMeta
  const slugMatch = content.match(/getOGMeta\(["']([^"']+)["']/);
  if (!slugMatch) continue;
  
  const slug = slugMatch[1];
  const caseEntry = cases.find(c => c.slug === slug);
  if (!caseEntry) {
    console.log(`⚠ Skipping ${file} - no case found for slug: ${slug}`);
    continue;
  }
  
  // Skip if already has originalText
  if (caseEntry.originalText) {
    continue;
  }
  
  let foundText = null;
  
  // 1. Extract from fallback pattern: {aiContent?.longDescription ? (...) : (<p>ORIGINAL TEXT</p>)}
  const fallbackMatch = content.match(/aiContent\?\.longDescription\s*\?\s*[^:]+:\s*\(?\s*<p>([^<]+)<\/p>/s);
  if (fallbackMatch) {
    foundText = fallbackMatch[1].trim();
  }
  
  // 2. Extract from direct <p> tags in about9 or about sections (but not in header)
  if (!foundText) {
    // Look for <p> tags that are not in conditional blocks and have substantial content
    const aboutSectionMatch = content.match(/<div class="about[^"]*">[\s\S]*?<p>([^<]{80,})<\/p>/);
    if (aboutSectionMatch) {
      const text = aboutSectionMatch[1].trim();
      // Skip if it's clearly AI-generated generic text
      if (!text.match(/^(Designed|Created|Developed) a (comprehensive|distinctive|vibrant)/i) && 
          text.length > 80) {
        foundText = text;
      }
    }
  }
  
  // 3. Extract multi-line text in <p> tags
  if (!foundText) {
    const multiLineMatch = content.match(/<p>([\s\S]{100,}?)<\/p>/);
    if (multiLineMatch) {
      const text = multiLineMatch[1]
        .replace(/\s+/g, ' ')
        .trim();
      // Skip generic AI text
      if (!text.match(/^(Designed|Created|Developed|Redesigned) (a|the) (comprehensive|distinctive|vibrant|modern)/i) &&
          text.length > 100) {
        foundText = text;
      }
    }
  }
  
  if (foundText && foundText.length > 50) {
    textsMap[caseEntry.id] = foundText;
    console.log(`✓ Found text for ${caseEntry.id} (${slug}) - ${foundText.length} chars`);
  }
}

// Update cases.json with original texts
let updated = 0;
for (const caseEntry of cases) {
  if (textsMap[caseEntry.id] && !caseEntry.originalText) {
    caseEntry.originalText = textsMap[caseEntry.id];
    updated++;
  }
}

if (updated > 0) {
  writeFileSync(casesFile, JSON.stringify(cases, null, 2) + '\n', 'utf-8');
  console.log(`\n✅ Updated ${updated} cases with original texts`);
} else {
  console.log(`\n✓ No new texts to add (${Object.keys(textsMap).length} texts found, but may already exist)`);
}

