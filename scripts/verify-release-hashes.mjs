import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const releaseRoot = join(process.cwd(), 'release', 'case_v22_rerun_clean_release');
const manifestPath = join(releaseRoot, 'RELEASE_HASHES.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const failures = [];

for (const [relativePath, expected] of Object.entries(manifest.hashes || {})) {
  const filePath = join(releaseRoot, relativePath);
  try {
    const bytes = await readFile(filePath);
    const actual = createHash('sha256').update(bytes).digest('hex');
    if (actual !== expected) {
      failures.push({ path: relativePath, expected, actual });
    }
  } catch (error) {
    failures.push({ path: relativePath, expected, actual: `MISSING_OR_UNREADABLE: ${error.message}` });
  }
}

if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', failures }, null, 2));
  console.error('RESULT: C.A.S.E. BOUNDARY FAIL');
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  checked_files: Object.keys(manifest.hashes || {}).length,
  artifact_line: manifest.artifact_line
}, null, 2));
