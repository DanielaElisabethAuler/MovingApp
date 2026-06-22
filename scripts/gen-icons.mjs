// Rendert die PWA-Icons (public/icon-192.png, icon-512.png) aus icon.svg
// (vollflaechig dunkelgruen + groesseres Logo). Aufruf: `npm run icons`.
const BG = "#142528";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(ROOT, "public", "icon.svg"));

for (const size of [192, 512]) {
  const png = await sharp(svg, { density: 512 })
    .resize(size, size, { fit: "contain", background: BG })
    .flatten({ background: BG }) // cremefarbener Hintergrund (maskable)
    .png()
    .toBuffer();
  writeFileSync(join(ROOT, "public", `icon-${size}.png`), png);
  console.log(`public/icon-${size}.png`);
}
