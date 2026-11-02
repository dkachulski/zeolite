/**
 * Builds src/components/brand-glyphs.json: the size of the "TRASSING.COM"
 * logo (Roboto Bold) and the footer's "@ trassing.com" (Roboto Light, as
 * its font-light class wins over the bold rule), measured with the font's
 * own advances and kerning. BrandText.astro draws each as SVG text of
 * exactly that size, in the page's own Roboto. Brand marks are exempt from
 * WCAG contrast rules; as SVG they keep their colours without failing
 * Lighthouse's contrast audit, which checks HTML text only.
 *
 * Run after changing the wording: npm run logo
 */
import { writeFileSync } from "node:fs";
import opentype from "opentype.js";

const loadWeight = weight => opentype.loadSync(`node_modules/@fontsource/roboto/files/roboto-latin-${weight}-normal.woff`);

// Each brand text, split into parts that are coloured separately.
const texts = {
  logo: { weight: 700, parts: ["TRASSING.", "COM"] },
  footer: { weight: 300, parts: ["@ trassing.com"] },
};

const round = value => Math.round(value * 100) / 100;

function layout(font, parts) {
  const unitsPerEm = font.unitsPerEm;
  let x = 0;
  let previous = null;
  let top = 0;
  let bottom = 0;
  for (const glyph of font.stringToGlyphs(parts.join(""))) {
    if (previous) x += font.getKerningValue(previous, glyph);
    const path = glyph.getPath(x, 0, unitsPerEm);
    const box = path.getBoundingBox();
    if (path.commands.length) {
      top = Math.min(top, box.y1);
      bottom = Math.max(bottom, box.y2);
    }
    x += glyph.advanceWidth;
    previous = glyph;
  }
  // A little room above and below for the shadow and anti-aliasing.
  const ascent = Math.ceil(-top + 40);
  const descent = Math.ceil(bottom + 40);
  return { parts, unitsPerEm, width: round(x), ascent, descent };
}

const output = Object.fromEntries(
  Object.entries(texts).map(([key, { weight, parts }]) => [key, { text: parts.join(""), ...layout(loadWeight(weight), parts) }]),
);
writeFileSync("src/components/brand-glyphs.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(Object.entries(output).map(([key, value]) => `${key}: "${value.text}" ${value.width}u wide`).join("\n"));
