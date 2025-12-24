#!/usr/bin/env node
/**
 * Optimize images: resize, compress, and generate responsive sizes
 * Usage: node scripts/optimize-images.mjs [--resize] [--compress] [--responsive]
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { existsSync } from 'fs';

const IMG_DIRS = ['public/img'];
const OUTPUT_DIR = 'public/img/optimized';
const MAX_WIDTH = 1920; // Max width for desktop
const MOBILE_WIDTH = 800; // Max width for mobile
const QUALITY = 85; // WebP quality (0-100)

// Responsive breakpoints
const BREAKPOINTS = [
  { width: 400, suffix: '-400w' },
  { width: 800, suffix: '-800w' },
  { width: 1200, suffix: '-1200w' },
  { width: 1920, suffix: '-1920w' }
];

async function getAllImageFiles(dir, fileList = []) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory() && !filePath.includes('optimized') && !filePath.includes('node_modules')) {
      await getAllImageFiles(filePath, fileList);
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function optimizeImage(inputPath, options = {}) {
  const { resize = false, compress = false, responsive = false } = options;
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const ext = extname(inputPath).toLowerCase();
    const isAnimated = metadata.pages > 1;
    
    // Skip if already optimized
    if (inputPath.includes('optimized')) {
      return;
    }
    
    // For GIFs, we'll handle them separately (convert to video)
    if (ext === '.gif' && isAnimated) {
      console.log(`⚠️  Skipping animated GIF: ${inputPath} (should be converted to video)`);
      return;
    }
    
    const outputDir = join(OUTPUT_DIR, dirname(inputPath.replace('public/', '')));
    await mkdir(outputDir, { recursive: true });
    
    const baseName = basename(inputPath, ext);
    const outputBase = join(outputDir, baseName);
    
    // Resize and compress main image
    if (resize || compress) {
      let pipeline = image;
      
      // Resize if larger than max width
      if (resize && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }
      
      // Convert to WebP if not already
      if (ext !== '.webp') {
        pipeline = pipeline.webp({ quality: QUALITY });
        await pipeline.toFile(`${outputBase}.webp`);
        console.log(`✓ Optimized: ${inputPath} → ${outputBase}.webp`);
      } else if (compress) {
        // Re-compress existing WebP
        pipeline = pipeline.webp({ quality: QUALITY });
        await pipeline.toFile(`${outputBase}-optimized.webp`);
        console.log(`✓ Re-compressed: ${inputPath} → ${outputBase}-optimized.webp`);
      } else {
        // Just copy if no optimization needed
        await pipeline.toFile(outputBase + ext);
        console.log(`✓ Copied: ${inputPath} → ${outputBase}${ext}`);
      }
    }
    
    // Generate responsive sizes
    if (responsive && metadata.width) {
      const originalWidth = metadata.width;
      
      for (const breakpoint of BREAKPOINTS) {
        if (breakpoint.width <= originalWidth) {
          const responsivePath = `${outputBase}${breakpoint.suffix}.webp`;
          
          await image
            .resize(breakpoint.width, null, {
              withoutEnlargement: true,
              fit: 'inside'
            })
            .webp({ quality: QUALITY })
            .toFile(responsivePath);
          
          console.log(`  → Generated: ${breakpoint.width}w version`);
        }
      }
    }
    
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const resize = args.includes('--resize');
  const compress = args.includes('--compress');
  const responsive = args.includes('--responsive');
  
  if (!resize && !compress && !responsive) {
    console.log('Usage: node scripts/optimize-images.mjs [--resize] [--compress] [--responsive]');
    console.log('  --resize      Resize images larger than 1920px');
    console.log('  --compress    Compress images to WebP with quality 85');
    console.log('  --responsive  Generate responsive image sizes');
    process.exit(1);
  }
  
  console.log('🖼️  Starting image optimization...\n');
  
  const allImages = [];
  for (const dir of IMG_DIRS) {
    if (existsSync(dir)) {
      const images = await getAllImageFiles(dir);
      allImages.push(...images);
    }
  }
  
  console.log(`Found ${allImages.length} images to process\n`);
  
  let processed = 0;
  for (const imagePath of allImages) {
    await optimizeImage(imagePath, { resize, compress, responsive });
    processed++;
    if (processed % 10 === 0) {
      console.log(`Progress: ${processed}/${allImages.length}\n`);
    }
  }
  
  console.log(`\n✅ Optimization complete! Processed ${processed} images.`);
}

main().catch(console.error);

