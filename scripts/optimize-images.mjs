// Generates the AVIF copies of the background images referenced in
// src/styles/site.css. Run `npm run images` after adding or replacing one.
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const css = await readFile(path.join(root, "src/styles/site.css"), "utf8");
const names = new Set([...css.matchAll(/\.\.\/assets\/([\w-]+)\.avif/g)].map(match => match[1]));

for (const name of names) {
  const input = path.join(root, "src/assets", `${name}.webp`);
  const output = path.join(root, "src/assets", `${name}.avif`);
  const info = await sharp(input).avif({ quality: 55, effort: 6 }).toFile(output);
  console.log(`${name}.avif`, `${Math.round(info.size / 1024)}KB`);
}
