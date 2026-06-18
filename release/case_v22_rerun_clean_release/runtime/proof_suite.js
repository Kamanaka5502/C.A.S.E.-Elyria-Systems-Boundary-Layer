import { submitProposal } from './boundary_api.js';
import { replayEquivalent } from './replay.js';
import { forgeReceipt } from './tamper.js';
import { verifyLineage } from './lineage.js';
import { sha256Hex } from './utils.js';

export async function runProofSuite({ scenarios, expected, contract, contractIdentity }) {
  const report = [];
  let passCount = 0;
  let lineage = { prev_receipt_hash: 'GENESIS', lineage_index: 0 };
  let previousReceipt = null;

  for (const [name, seed] of Object.entries(scenarios)) {
    const proposal = seed.proposal ? structuredClone(seed.proposal) : {
      decision_id: seed.decision_id,
      authority: seed.authority,
      consent: seed.consent,
      contextComplete: seed.contextComplete,
      ttlSeconds: seed.ttlSeconds,
      risk: seed.risk,
      state_epoch: seed.state_epoch,
      contract_sha256: seed.proposal_contract_sha,
      actionClass: seed.actionClass || 'governed_decision'
    };
    const state = seed.state ? structuredClone(seed.state) : {
      state_epoch: name === 'precheck' ? 'epoch_real' : 'epoch_1',
      contract_sha256: contractIdentity.contract_sha256
    };

    const envelope = { method:'POST', boundary_attestation:`env_${name}_attested`, source_channel:'proof_suite_submit', session_nonce:`nonce_${name}_proofsuite`, submitted_at_utc:new Date().toISOString() };
    const first = await submitProposal({ proposal, state, contract, contractIdentity, lineage, previousReceipt, envelope });
    const lineageCheck = await verifyLineage(first.receipt, previousReceipt);
    previousReceipt = first.receipt;
    lineage = { prev_receipt_hash: first.receipt.receipt_hash, lineage_index: first.receipt.lineage_index };
    const second = await submitProposal({ proposal, state, contract, contractIdentity, lineage, previousReceipt: first.receipt, envelope });
    const replay = replayEquivalent(first.receipt, second.receipt);
    const forged = forgeReceipt(first.receipt);
    const forgedComparable = { ...forged };
    delete forgedComparable.receipt_hash;
    const forgedRecomputedHash = await sha256Hex(forgedComparable);
    const forgedHashBroken = forged.receipt_hash !== forgedRecomputedHash;
    const forgedLineage = await verifyLineage(forged, previousReceipt);
    const pass = first.decision.outcome === expected[name] && replay.pass && lineageCheck.pass && forgedHashBroken && forgedLineage.loud_break && !!first.receipt.commit_attestation && first.receipt.rule_coverage?.complete === true;
    if (pass) passCount += 1;

    report.push({
      case: name,
      expected: expected[name],
      actual: first.decision.outcome,
      reason: first.decision.reason,
      selected_rule: first.receipt.selected_rule,
      boundary: first.decision.commit_boundary,
      replay_pass: replay.pass,
      replay_classification: replay.classification,
      replay_governing_conditions: replay.governing_conditions,
      lineage_pass: lineageCheck.pass,
      lineage_failure_mode: lineageCheck.failure_mode,
      forged_receipt_detectable: forgedHashBroken,
      forged_lineage_loud_break: forgedLineage.loud_break,
      commit_attestation_present: !!first.receipt.commit_attestation,
      attestation_signature_present: !!first.receipt.commit_attestation?.attestation_signature,
      rule_coverage_complete: first.receipt.rule_coverage?.complete === true,
      pass
    });
  }

  return {
    package: 'C.A.S.E. v22 Rerun Clean Release',
    runtime_identity: contractIdentity.runtime_identity,
    contract_version: contract.contract_version,
    replay_standard: contract.proof_commitments.replay_standard,
    summary: `${passCount}/${report.length} proof cases passed`,
    cases: report
  };
}
