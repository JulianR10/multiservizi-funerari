import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const INPUT = "src/multiservizi-imgs";
const OUTPUT = "public/images/products";
const QUALITY = 80;
const MAX_WIDTH = 800;

await mkdir(OUTPUT, { recursive: true });

const files = (await readdir(INPUT)).filter((f) =>
  /\.(jpe?g|png)$/i.test(extname(f))
);

let ok = 0;
let skip = 0;
let fail = 0;

const start = performance.now();

for (const file of files) {
  const inputPath = join(INPUT, file);
  const outName = file.replace(extname(file), ".webp");
  const outputPath = join(OUTPUT, outName);

  try {
    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    console.log(`OK  ${file} -> ${outName}`);
    ok++;
  } catch (err) {
    console.error(`ERR ${file}: ${err.message}`);
    fail++;
  }
}

const elapsed = ((performance.now() - start) / 1000).toFixed(1);
console.log(`\n--- ${ok} ok  ${fail} fail  ${elapsed}s ---`);
