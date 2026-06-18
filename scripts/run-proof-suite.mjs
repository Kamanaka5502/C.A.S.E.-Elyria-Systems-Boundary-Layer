import { webcrypto } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runProofSuite } from '../release/case_v22_rerun_clean_release/runtime/proof_suite.js';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const releaseRoot = join(process.cwd(), 'release', 'case_v22_rerun_clean_release');

async function loadJson(relativePath) {
  return JSON.parse(await readFile(join(releaseRoot, relativePath), 'utf8'));
}

const contract = await loadJson('contracts/case_contract_authoritative_v5.json');
const contractIdentity = await loadJson('contracts/contract_identity.json');

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

const scenarios = {};
const expected = {};

for (const [name, relativePath] of Object.entries(proofFiles)) {
  const proofCase = await loadJson(relativePath);
  scenarios[name] = proofCase;
  expected[name] = proofCase.expected_outcome;
}

const report = await runProofSuite({ scenarios, expected, contract, contractIdentity });

await mkdir(join(process.cwd(), 'artifacts'), { recursive: true });
await writeFile(
  join(process.cwd(), 'artifacts', 'proof_suite_report_current.json'),
  JSON.stringify(report, null, 2)
);

const failures = report.cases.filter(c => !c.pass || c.expected !== c.actual);

if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', summary: report.summary, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  summary: report.summary,
  runtime_identity: report.runtime_identity,
  contract_version: report.contract_version,
  report_path: 'artifacts/proof_suite_report_current.json'
}, null, 2));
