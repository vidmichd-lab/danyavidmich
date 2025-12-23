import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const pagesDir = join(rootDir, 'src', 'pages');

// Pages that need OG tags (excluding index, cv, fonts which are already done)
const pagesToUpdate = [
  'apt-branding', 'apt-product', 'badoo', 'badoo-hotline', 'bandlink',
  'black-friday-practicum', 'chekhov', 'cinema', 'gorenko', 'humans',
  'korolev', 'lug', 'may-of-may', 'my', 'palio', 'peterburgskie-povesti',
  'plays', 'prosto-school', 'rublev', 's7', 'stereo', 'sub',
  'temp-school-graphics', 'wouly', 'yandex-practicum-pro', '360-captures'
];

function updatePage(filePath, slug) {
  let content = readFileSync(filePath, 'utf-8');
  
  // Check if already has getOGMeta import
  if (content.includes('getOGMeta')) {
    console.log(`✓ ${slug} already has OG tags`);
    return false;
  }

  // Find the title line
  const titleMatch = content.match(/const title = `([^`]+)`;/);
  if (!titleMatch) {
    console.log(`⚠ ${slug}: Could not find title`);
    return false;
  }

  const oldTitle = titleMatch[1];
  const newTitle = oldTitle.replace('Danya Vidmich — ', '').trim();

  // Add import
  const importPattern = /import Header from "@components\/Header\.astro";/;
  if (!importPattern.test(content)) {
    console.log(`⚠ ${slug}: Could not find Header import`);
    return false;
  }

  content = content.replace(
    /import Header from "@components\/Header\.astro";/,
    `import Header from "@components/Header.astro";
import { getOGMeta } from "@utils/ogMeta";`
  );

  // Replace title and add OG meta
  const frontmatterPattern = /const title = `([^`]+)`;\s+const subtitle = "([^"]+)";\s+const tertiary = "([^"]+)";/;
  if (frontmatterPattern.test(content)) {
    content = content.replace(
      frontmatterPattern,
      `const subtitle = "$2";
const tertiary = "$3";
const ogMeta = await getOGMeta("${slug}", \`${oldTitle}\`);`
    );
  } else {
    // Fallback pattern
    content = content.replace(
      /const title = `([^`]+)`;/,
      `const ogMeta = await getOGMeta("${slug}", \`${oldTitle}\`);`
    );
  }

  // Update BaseLayout
  const baseLayoutPattern = /<BaseLayout {title}>/;
  if (baseLayoutPattern.test(content)) {
    content = content.replace(
      /<BaseLayout {title}>/,
      `<BaseLayout
  title={ogMeta.title}
  description={ogMeta.description}
  ogTitle={ogMeta.ogTitle}
  ogDescription={ogMeta.ogDescription}
  ogUrl={ogMeta.ogUrl}
  ogImage={ogMeta.ogImage}
>`
    );
  }

  writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Updated ${slug}`);
  return true;
}

let updated = 0;
pagesToUpdate.forEach(slug => {
  const filePath = join(pagesDir, `${slug}.astro`);
  try {
    if (updatePage(filePath, slug)) {
      updated++;
    }
  } catch (error) {
    console.error(`✗ Error updating ${slug}:`, error.message);
  }
});

console.log(`\nUpdated ${updated} pages.`);

