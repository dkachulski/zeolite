/**
 * Builds the site icons and the social sharing image in public/:
 * favicon.ico (16, 32 and 48 px), icon-192.png and icon-512.png from
 * public/images/logo.webp, apple-touch-icon.png (180 px on white, as iOS
 * fills transparency with black), and og-image.jpg, a 1200x630 JPEG of the
 * quarry photo for link previews (JPEG is read by every social network).
 *
 * Run after changing the logo or the photo: npm run icons
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const logo = "public/images/logo.webp";
const png = size => sharp(logo).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toBuffer();

// An .ico file holding PNG images: a 6-byte header, a 16-byte entry per
// image, then the PNG data.
async function ico(sizes) {
  const images = await Promise.all(sizes.map(png));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[index].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += images[index].length;
  });
  return Buffer.concat([header, ...images]);
}

writeFileSync("public/favicon.ico", await ico([16, 32, 48]));
writeFileSync("public/icon-192.png", await png(192));
writeFileSync("public/icon-512.png", await png(512));
await sharp({ create: { width: 180, height: 180, channels: 4, background: "#ffffff" } })
  .composite([{ input: await png(144), left: 18, top: 18 }])
  .png({ compressionLevel: 9 })
  .toFile("public/apple-touch-icon.png");
await sharp("src/assets/kurdzhali.webp")
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile("public/og-image.jpg");
console.log("icons and og-image.jpg written to public/");
