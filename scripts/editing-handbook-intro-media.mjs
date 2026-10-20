import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const input = resolve(process.env.HANDBOOK_INTRO_SOURCE ?? "../../public/videos/editing-handbook/handbook-intro-24s.mp4");
const output = resolve("public/media/editing-handbook");
const ffmpeg = process.env.FFMPEG_PATH ?? "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH ?? "ffprobe";
const expectedHash = "506e07cfbe629ebaa1fb21fd7ae2cd3bfb9494a1fcd5b9b9cedcc352aaa75253";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const original = await readFile(input);
assert.equal(hash(original), expectedHash, "Owner source changed: review rather than silently regenerate");

function run(executable, args) {
  const result = spawnSync(executable, args, { encoding: "utf8", windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
const probe = file => JSON.parse(run(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
const metadata = probe(input);
assert.equal(metadata.streams.find(stream => stream.codec_type === "video")?.width, 1080);
assert.equal(metadata.streams.find(stream => stream.codec_type === "video")?.height, 1920);
assert.ok(Number(metadata.format.duration) > 23 && Number(metadata.format.duration) < 25);
await mkdir(output, { recursive: true });
const video = resolve(output, "intro-24s.web.mp4");
const poster = resolve(output, "intro-poster.webp");
assert.notEqual(input, video);
run(ffmpeg, ["-y", "-v", "error", "-i", input, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", "-map_metadata", "-1", video]);
run(ffmpeg, ["-y", "-v", "error", "-ss", "2", "-i", input, "-frames:v", "1", "-vf", "scale=540:960", "-c:v", "libwebp", "-quality", "85", poster]);
run(ffmpeg, ["-v", "error", "-xerror", "-i", video, "-f", "null", "-"]);
const audioHash = file => run(ffmpeg, ["-v", "error", "-i", file, "-map", "0:a:0", "-c:a", "copy", "-f", "hash", "-hash", "sha256", "-"]).replace("SHA256=", "");
assert.equal(audioHash(input), audioHash(video), "Narration bitstream must remain unchanged");
assert.equal(hash(await readFile(input)), expectedHash);
const runtime = probe(video);
const v = runtime.streams.find(stream => stream.codec_type === "video");
const bytes = await readFile(video);
await writeFile(resolve(output, "media-manifest.json"), JSON.stringify({
  ownerSource: { filename: "handbook-intro-24s.mp4", sha256: expectedHash, bytes: original.length, preserved: true, includedInRuntime: false },
  video: { src: "/media/editing-handbook/intro-24s.web.mp4", status: "APPROVED_LOCAL", bytes: bytes.length, sha256: hash(bytes), durationSeconds: Number(runtime.format.duration), width: v.width, height: v.height, fps: v.r_frame_rate, videoCodec: v.codec_name, profile: v.profile, pixelFormat: v.pix_fmt, audioCodec: "aac", audioBitstreamSha256: audioHash(video), audioCopiedWithoutReencoding: true, faststart: true, fit: "contain", poster: "/media/editing-handbook/intro-poster.webp" },
  poster: { src: "/media/editing-handbook/intro-poster.webp", status: "APPROVED_LOCAL", extractedAtSeconds: 2, width: 540, height: 960, bytes: (await readFile(poster)).length },
  sourceContentObservation: "Source already contains burned-in Chinese/English captions and terminology graphics; retained unchanged. No subtitle overlay or caption track added.",
}, null, 2) + "\n");
console.log("Approved local derivatives verified; source and narration preserved. No deployment.");
