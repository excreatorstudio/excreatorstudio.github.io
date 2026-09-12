import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function exactFile(root, path) {
  if (!/^[\w./-]+$/.test(path) || path.split('/').includes('..')) throw new Error('UNSAFE_ASSET_PATH: ' + path);
  let directory = resolve(root);
  for (const part of path.split('/')) {
    if (!readdirSync(directory).includes(part)) throw new Error('ASSET_CASE_OR_MISSING: ' + path);
    directory = resolve(directory, part);
  }
  const bytes = readFileSync(directory);
  if (!bytes.length || bytes.subarray(0, 100).toString().startsWith('version https://git-lfs.github.com/spec/v1')) throw new Error('ASSET_NOT_RESTORED: ' + path);
  return bytes;
}
export function assertRuntimeMedia(text) {
  if (/\/candidates\//.test(text) || /-web\.mp4/.test(text)) throw new Error('UNAPPROVED_RUNTIME_MEDIA');
}
export function verifyProductionAssets(root, manifest, graph) {
  if (!/^[a-f0-9]{40}$/.test(manifest.sourceCommit) || manifest.files.length < 8) throw new Error('INVALID_PRODUCTION_MANIFEST');
  const approved = new Set(manifest.files.map(f => f.path));
  for (const file of manifest.files) {
    if (sha256(exactFile(root, file.path)) !== file.sha256) throw new Error('ORIGINAL_HASH_MISMATCH: ' + file.path);
  }
  const text = [...graph.values()].join('\n');
  assertRuntimeMedia(text);
  const expanded = text.replaceAll('${galaxy.id}', '__GALAXY__');
  for (const match of expanded.matchAll(/\/(?:images\/universe|video)\/[\w./-]+\.(?:png|mp4)/g)) {
    const paths = match[0].includes('__GALAXY__') ? ['create','knowledge','language','insight'].map(id => match[0].replace('__GALAXY__', id)) : [match[0]];
    for (const path of paths) {
      if (!approved.has('public' + path)) throw new Error('UNAPPROVED_ASSET: ' + path);
      exactFile(root, 'public' + path);
    }
  }
}
export function validateCandidates(root, auditPath = 'public/images/universe/candidates/audit.json') {
  let audit;
  try { audit = JSON.parse(exactFile(root, auditPath).toString()); }
  catch (error) { throw new Error('CANDIDATE_INPUTS_REQUIRED: audit missing or invalid', { cause: error }); }
  if (!Array.isArray(audit.images) || !audit.images.length || !Array.isArray(audit.videos) || !audit.videos.length) throw new Error('CANDIDATE_SCHEMA_INVALID');
  const seen = new Set();
  for (const [kind, entries] of [['images', audit.images], ['videos', audit.videos]]) {
    for (const entry of entries) {
      if (!entry || !/^[\w-]+$/.test(entry.name) || !/^[a-f0-9]{64}$/.test(entry.sha256) || seen.has(kind + entry.name)) throw new Error('CANDIDATE_SCHEMA_INVALID');
      seen.add(kind + entry.name);
      const original = kind === 'images' ? 'public/images/universe/' + entry.name + '.png' : 'public/video/' + entry.name + '.mp4';
      const candidates = kind === 'images' ? ['webp','avif'].map(ext => dirname(auditPath).replaceAll('\\','/') + '/' + entry.name + '.' + ext) : ['public/video/' + entry.name + '-web.mp4'];
      try {
        if (sha256(exactFile(root, original)) !== entry.sha256) throw new Error('HASH_MISMATCH: ' + basename(original));
        candidates.forEach(path => exactFile(root, path));
      } catch (error) { throw new Error('CANDIDATE_INPUTS_REQUIRED: ' + error.message, { cause: error }); }
    }
  }
  return { images: audit.images.length, videos: audit.videos.length };
}
