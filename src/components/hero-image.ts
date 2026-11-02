/**
 * The hero still's responsive images (AVIF, with WebP for older browsers).
 * Hero.astro renders them and Base.astro preloads the AVIF set from the
 * page head; both use this one function, so the URLs always match and the
 * preload is never a second download.
 */
import { getImage } from "astro:assets";
import quarry from "../assets/quarry.webp";

export const HERO_SIZES = "100vw";
const WIDTHS = [640, 1024, 1440, quarry.width];

async function srcset(format: "avif" | "webp") {
  const images = await Promise.all(WIDTHS.map(width => getImage({ src: quarry, width, format })));
  return images.map((image, index) => `${image.src} ${WIDTHS[index]}w`).join(", ");
}

export async function heroImages() {
  const [avif, webp, fallback] = await Promise.all([
    srcset("avif"),
    srcset("webp"),
    getImage({ src: quarry, width: quarry.width, format: "webp" }),
  ]);
  return { avif, webp, src: fallback.src, width: quarry.width, height: quarry.height };
}
