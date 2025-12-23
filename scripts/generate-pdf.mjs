import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const pdfPath = join(rootDir, 'public', 'cv_vidmich_designer.pdf');

async function generatePDF() {
  // Check if dist directory exists
  if (!existsSync(distDir)) {
    console.error('Error: dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load the CV page from dist
  const cvPath = `file://${join(distDir, 'cv', 'index.html')}`;
  console.log(`Loading CV page from: ${cvPath}`);
  
  await page.goto(cvPath, { waitUntil: 'networkidle' });

  // Wait for fonts and images to load
  await page.waitForTimeout(1000);

  // Generate PDF
  console.log(`Generating PDF to: ${pdfPath}`);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  });

  await browser.close();
  console.log('PDF generated successfully!');
}

generatePDF().catch((error) => {
  console.error('Error generating PDF:', error);
  process.exit(1);
});

