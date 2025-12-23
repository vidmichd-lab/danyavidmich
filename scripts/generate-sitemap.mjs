import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const pagesDir = join(rootDir, 'src', 'pages');
const outputPath = join(rootDir, 'public', 'sitemap.xml');

// Get current date in ISO format (YYYY-MM-DD)
const now = new Date().toISOString().split('T')[0] + 'T00:00:00+00:00';

// Base URL
const baseUrl = 'https://danyavidmich.com';

// Get all page files
const pages = readdirSync(pagesDir)
  .filter(file => file.endsWith('.astro'))
  .map(file => file.replace('.astro', ''))
  .filter(page => page !== 'index') // index is root
  .sort();

// Generate sitemap XML
const urls = [
  {
    loc: `${baseUrl}/`,
    lastmod: now,
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    loc: `${baseUrl}/cv_vidmich_designer.pdf`,
    lastmod: now,
    priority: '0.8',
    changefreq: 'monthly'
  },
  ...pages.map(page => ({
    loc: `${baseUrl}/${page}`,
    lastmod: now,
    priority: page === 'cv' ? '0.9' : '0.7',
    changefreq: 'monthly'
  }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`Sitemap generated successfully with ${urls.length} URLs`);
console.log(`Output: ${outputPath}`);

