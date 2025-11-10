import { readdir, stat, mkdir, rm } from "fs/promises";
import { dirname, extname, resolve } from "path";
import sharp from "sharp";

const SOURCE_DIR = resolve("public/img");
const TARGET_DIR = resolve("public/img-optimized");

const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (SUPPORTED_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function convertImage(inputPath) {
  const relativePath = inputPath.replace(SOURCE_DIR, "").replace(/^[\\/]/, "");
  const outputPath = resolve(TARGET_DIR, `${relativePath.replace(extname(relativePath), "")}.webp`);

  await ensureDir(dirname(outputPath));

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  await image
    .webp({
      quality: metadata.hasAlpha ? 90 : 80,
      effort: 4,
      lossless: metadata.format === "png" && metadata.hasAlpha,
    })
    .toFile(outputPath);

  const originalSize = (await stat(inputPath)).size;
  const optimizedSize = (await stat(outputPath)).size;

  return { inputPath, outputPath, originalSize, optimizedSize };
}

async function run() {
  console.log("Cleaning target directory...");
  await rm(TARGET_DIR, { recursive: true, force: true });
  await ensureDir(TARGET_DIR);

  console.log("Scanning for images...");
  const files = await walk(SOURCE_DIR);

  console.log(`Found ${files.length} images to convert.`);
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const { originalSize, optimizedSize } = await convertImage(file);
    totalOriginal += originalSize;
    totalOptimized += optimizedSize;
    console.log(
      `${file.replace(SOURCE_DIR, "")}: ${(originalSize / 1024).toFixed(1)} KB -> ${(optimizedSize / 1024).toFixed(
        1
      )} KB`
    );
  }

  console.log("Conversion finished.");
  console.log(
    `Total: ${(totalOriginal / 1024).toFixed(1)} KB -> ${(totalOptimized / 1024).toFixed(1)} KB (${(
      100 -
      (totalOptimized / totalOriginal) * 100
    ).toFixed(1)}% reduction)`
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

