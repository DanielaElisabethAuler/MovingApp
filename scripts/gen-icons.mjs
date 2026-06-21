// Rendert die PWA-Icons (public/icon-192.png, icon-512.png) aus dem Logo
// (public/logo.svg) mit weissem Hintergrund. Aufruf: `npm run icons`.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(ROOT, "public", "logo.svg"));

for (const size of [192, 512]) {
  const png = await sharp(svg, { density: 512 })
    .resize(size, size, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" }) // weisser Hintergrund (maskable)
    .png()
    .toBuffer();
  writeFileSync(join(ROOT, "public", `icon-${size}.png`), png);
  console.log(`public/icon-${size}.png`);
}
