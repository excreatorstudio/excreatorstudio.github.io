// Explicit REAL media gate. Missing inputs are failure, never a skipped acceptance.
import { fileURLToPath } from 'node:url';
import { runtimeGraph, universeEntries } from './helpers/universe-boundary.mjs';
import { validateCandidates, assertRuntimeMedia } from './helpers/universe-assets.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const result = validateCandidates(root);
  assertRuntimeMedia([...runtimeGraph(root, universeEntries(root)).values()].join('\n'));
  console.log('CANDIDATE_FILE_CONTRACT_PASS', result, '(visual quality requires separate review)');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
