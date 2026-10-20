import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const source = resolve(process.env.HANDBOOK_BOOK_SOURCE ?? "../../public/images/editing-handbook/book-entry.png");
const output = resolve("public/images/editing-handbook");
const expected = "f60a41fd56189a58bce6793089dbc7ad09d5c6c48dff0860d9bae069112ee3fa";
const bytes = await readFile(source);
if (createHash("sha256").update(bytes).digest("hex") !== expected) throw new Error("Approved book source fingerprint differs; review the new asset before regenerating.");
const metadata = await sharp(bytes).metadata();
if (!metadata.hasAlpha || metadata.width !== 1254 || metadata.height !== 1254) throw new Error("Unexpected approved book geometry/transparency.");
await mkdir(output, { recursive: true });
const assets = [];
for (const width of [256, 512, 960]) {
  const filename = `book-${width}.webp`;
  // Preserve the full canvas and its glow; no trim, background or flatten operation.
  const derivative = await sharp(bytes).resize(width, width).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer();
  await writeFile(join(output, filename), derivative);
  assets.push({ src: `/images/editing-handbook/${filename}`, width, height: width, bytes: derivative.length, format: "webp", hasAlpha: true, status: "APPROVED_LOCAL", alt: "剪片說明書的藍色發光數位書" });
}
await writeFile(join(output, "asset-manifest.json"), JSON.stringify({ sourceFilename: "book-entry.png", sourceSha256: expected, sourceDimensions: [1254, 1254], sourceUnchanged: true, referenceOnlyLayoutImageIncluded: false, assets }, null, 2) + "\n");
console.log(JSON.stringify({ sourceUnchanged: true, assets }, null, 2));
