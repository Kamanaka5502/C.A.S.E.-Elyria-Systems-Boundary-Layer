import { webcrypto } from 'node:crypto';
import { access, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runProofSuite } from '../release/case_v22_rerun_clean_release/runtime/proof_suite.js';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const root = process.cwd();
const releaseRoot = join(root, 'release', 'case_v22_rerun_clean_release');

async function loadJson(relativePath) {
  return JSON.parse(await readFile(join(releaseRoot, relativePath), 'utf8'));
}

async function fileExists(relativePath) {
  try {
    await access(join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readRootFile(relativePath) {
  return readFile(join(root, relativePath), 'utf8');
}

const requiredBoundaryFiles = [
  'CLAIM_BOUNDARY.md',
  'docs/NO_BIND_PROOF_TRANSCRIPT.md',
  'docs/ROUTE_CLOSURE_PROOF.md',
  'docs/CHANGED_CONDITION_REPLAY_TRANSCRIPT.md',
  'docs/TAMPER_TEST.md',
  'docs/BENCHMARK_SCORECARD.md',
  'docs/BUYER_REVIEWER_READOUT.md',
  'docs/FRESH_CLONE_REVIEW_TEST.md'
];

const proofFiles = {
  execute: 'proof/execute_case.json',
  refuse: 'proof/refuse_case.json',
  escalate: 'proof/escalate_case.json',
  replay: 'proof/replay_case.json',
  tamper: 'proof/tamper_case.json',
  constitutional_shift: 'proof/constitutional_shift_case.json',
  ttl: 'proof/ttl_case.json',
  context: 'proof/context_case.json',
  halt: 'proof/halt_case.json',
  forged_receipt: 'proof/forged_receipt_case.json',
  precheck: 'proof/precheck_valid_commit_invalid_case.json'
};

const failures = [];

for (const file of requiredBoundaryFiles) {
  if (!(await fileExists(file))) {
    failures.push({ check: 'required_boundary_file', path: file });
  }
}

try {
  const claimBoundary = await readRootFile('CLAIM_BOUNDARY.md');
  const invariantPresent =
    claimBoundary.includes('Proposed movement enters') &&
    claimBoundary.includes('Boundary resolves') &&
    claimBoundary.includes('No protected consequence binds without the boundary result');
  if (!invariantPresent) {
    failures.push({ check: 'core_invariant', path: 'CLAIM_BOUNDARY.md' });
  }
} catch (error) {
  failures.push({ check: 'claim_boundary_read', error: error.message });
}

let report = null;

try {
  const contract = await loadJson('contracts/case_contract_authoritative_v5.json');
  const contractIdentity = await loadJson('contracts/contract_identity.json');

  const scenarios = {};
  const expected = {};

  for (const [name, relativePath] of Object.entries(proofFiles)) {
    const proofCase = await loadJson(relativePath);
    scenarios[name] = proofCase;
    expected[name] = proofCase.expected_outcome;
  }

  report = await runProofSuite({ scenarios, expected, contract, contractIdentity });

  await mkdir(join(root, 'artifacts'), { recursive: true });
  await writeFile(
    join(root, 'artifacts', 'proof_suite_report_current.json'),
    JSON.stringify(report, null, 2)
  );

  const proofFailures = report.cases.filter(c => !c.pass || c.expected !== c.actual);
  for (const failure of proofFailures) {
    failures.push({ check: 'proof_case', ...failure });
  }

  const caseNames = new Set(report.cases.map(c => c.case ?? c.name));
  for (const requiredCase of ['refuse', 'replay', 'tamper', 'forged_receipt', 'precheck']) {
    if (!caseNames.has(requiredCase)) {
      failures.push({ check: 'required_proof_case', case: requiredCase });
    }
  }
} catch (error) {
  failures.push({ check: 'proof_suite_exception', error: error.message });
}

if (failures.length) {
  console.error(JSON.stringify({
    status: 'FAIL',
    summary: report?.summary,
    failures
  }, null, 2));
  console.error('RESULT: C.A.S.E. BOUNDARY FAIL');
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  summary: report.summary,
  runtime_identity: report.runtime_identity,
  contract_version: report.contract_version,
  report_path: 'artifacts/proof_suite_report_current.json',
  boundary_files_checked: requiredBoundaryFiles.length,
  invariant: 'Proposed movement enters. Boundary resolves. No protected consequence binds without the boundary result.'
}, null, 2));
console.log('RESULT: C.A.S.E. BOUNDARY PASS');
