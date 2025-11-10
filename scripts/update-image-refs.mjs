import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";

const TARGET_GLOBS = ["src/**/*.{astro,ts,tsx,css,js,mjs}"];
const patterns = [
  /(["'])\/?img\/([^"']+?)\.png\1/g,
  /(["'])\/?img\/([^"']+?)\.jpg\1/g,
  /(["'])\/?img\/([^"']+?)\.jpeg\1/g,
];

async function replaceInFile(path) {
  const original = await readFile(path, "utf8");
  let updated = original;

  for (const regex of patterns) {
    updated = updated.replace(regex, (match, quote, filename) => `${quote}img/${filename}.webp${quote}`);
  }

  if (updated !== original) {
    await writeFile(path, updated, "utf8");
    return true;
  }

  return false;
}

async function run() {
  const paths = await glob(TARGET_GLOBS, { nodir: true });
  let touched = 0;

  for (const path of paths) {
    if (await replaceInFile(path)) {
      touched += 1;
      console.log(`Updated ${path}`);
    }
  }

  console.log(`Done. Updated ${touched} files.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

