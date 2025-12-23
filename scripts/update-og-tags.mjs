import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const casesData = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'cases.json'), 'utf-8'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pagesDir = join(__dirname, '..', 'src', 'pages');

// Map of page files to their slugs
const pageSlugMap = {
  'badoo.astro': 'badoo',
  'apt-product.astro': 'apt-product',
  'apt-branding.astro': 'apt-branding',
  'bandlink.astro': 'bandlink',
  'black-friday-practicum.astro': 'black-friday-practicum',
  'chekhov.astro': 'chekhov',
  'cinema.astro': 'cinema',
  'gorenko.astro': 'gorenko',
  'humans.astro': 'humans',
  'korolev.astro': 'korolev',
  'lug.astro': 'lug',
  'may-of-may.astro': 'may-of-may',
  'my.astro': 'my',
  'palio.astro': 'palio',
  'peterburgskie-povesti.astro': 'peterburgskie-povesti',
  'plays.astro': 'plays',
  'prosto-school.astro': 'prosto-school',
  'rublev.astro': 'rublev',
  's7.astro': 's7',
  'stereo.astro': 'stereo',
  'sub.astro': 'sub',
  'temp-school-graphics.astro': 'temp-school-graphics',
  'wouly.astro': 'wouly',
  'yandex-practicum-pro.astro': 'yandex-practicum-pro',
  '360-captures.astro': '360-captures',
  'badoo-hotline.astro': 'badoo-hotline',
};

console.log('Pages that need OG tags update:');
Object.entries(pageSlugMap).forEach(([file, slug]) => {
  const caseEntry = casesData.find(c => c.slug === slug);
  if (caseEntry) {
    console.log(`- ${file}: ${caseEntry.title} (${caseEntry.description})`);
  }
});

console.log('\nRun this script to see which pages need updates.');
console.log('Manual update required for each page.');

