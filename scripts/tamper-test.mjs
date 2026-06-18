import { appendFile, copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const target = join(root, 'release', 'case_v22_rerun_clean_release', 'contracts', 'deployment_profile.json');
const backup = `${target}.tamper-test-backup`;

function runVerify() {
  return spawnSync('npm', ['run', 'verify'], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });
}

function output(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

try {
  await copyFile(target, backup);
  await appendFile(target, '\n');

  const tampered = runVerify();
  output(tampered);

  if (tampered.status === 0 || !`${tampered.stdout}\n${tampered.stderr}`.includes('RESULT: C.A.S.E. BOUNDARY FAIL')) {
    console.error('Tamper test failed: verifier did not fail closed after release artifact mutation.');
    process.exitCode = 1;
  } else {
    console.log('Tamper test observed expected verifier failure.');
  }
} finally {
  await copyFile(backup, target).catch(() => {});
  await rm(backup, { force: true }).catch(() => {});
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

const restored = runVerify();
output(restored);

if (restored.status !== 0 || !`${restored.stdout}\n${restored.stderr}`.includes('RESULT: C.A.S.E. BOUNDARY PASS')) {
  console.error('Tamper test failed: verifier did not pass after restore.');
  process.exit(1);
}

console.log('RESULT: C.A.S.E. TAMPER TEST PASS');
