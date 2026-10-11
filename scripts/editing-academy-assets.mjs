import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

// Local format/size derivatives only. Original source remains untouched.
const source = resolve("public/images/creator-studio/hero-showcase-v1.png");
const destination = resolve("public/images/editing-academy");
await mkdir(destination, { recursive: true });
for (const width of [800, 1600]) {
  const result = await sharp(source).resize(width, Math.round(width * 9 / 16), { fit: "cover" }).webp({ quality: 83 }).toFile(resolve(destination, `studio-${width}.webp`));
  console.log(JSON.stringify({ file: `studio-${width}.webp`, width: result.width, height: result.height, bytes: result.size }));
}
