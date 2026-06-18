import { sha256Hex, nowUtc } from './utils.js';

export async function emitReceipt(proposal, state, decision, contractIdentity, lineage = {}, commitAttestation = null) {
  const proposal_hash = await sha256Hex(proposal);
  const state_hash = await sha256Hex(state);
  const effect = { outcome: decision.outcome, reason: decision.reason, commit_boundary: decision.commit_boundary };
  const effect_hash = await sha256Hex(effect);
  const lineage_index = Number(lineage.lineage_index || 0) + 1;
  const prev_receipt_hash = lineage.prev_receipt_hash || 'GENESIS';
  const lineage_seed = {
    prev_receipt_hash,
    proposal_hash,
    state_hash,
    contract_sha256: contractIdentity.contract_sha256,
    runtime_identity: contractIdentity.runtime_identity,
    lineage_index
  };
  const lineage_hash = await sha256Hex(lineage_seed);
  const attestation_seed = {
    boundary: decision.commit_boundary,
    standing_resolved_at_commit: decision.standing?.resolved_at_commit,
    inherited: decision.standing?.inherited,
    outcome: decision.outcome,
    contract_sha256: contractIdentity.contract_sha256,
    runtime_identity: contractIdentity.runtime_identity,
    selected_reason: decision.reason,
    selected_rule: decision.reason_trace?.selected_from_rule || null,
    commit_attestation_hash: commitAttestation?.attestation_hash || null,
    commit_attestation_signature: commitAttestation?.attestation_signature || null
  };

  const receipt = {
    receipt_id: `rct_${proposal.decision_id}_${Date.now()}`,
    timestamp_utc: nowUtc(),
    proposal_id: proposal.decision_id,
    proposal_hash,
    state_hash,
    prev_receipt_hash,
    lineage_index,
    lineage_hash,
    runtime_identity: contractIdentity.runtime_identity,
    build_identity: contractIdentity.build_identity,
    contract_sha256: contractIdentity.contract_sha256,
    contract_version: contractIdentity.contract_version,
    state_epoch: state.state_epoch,
    boundary_channel: commitAttestation?.governing_conditions?.boundary_channel || null,
    commit_boundary: decision.commit_boundary,
    outcome: decision.outcome,
    reason: decision.reason,
    selected_rule: decision.reason_trace?.selected_from_rule || null,
    standing: decision.standing,
    admissibility_checks: decision.checks,
    enforced_contract_rules: decision.contract_rule_results || [],
    rule_coverage: decision.rule_coverage || null,
    reason_trace: decision.reason_trace || null,
    commit_attestation: commitAttestation,
    boundary_enforcement_summary: {
      re_evaluated_at_commit: true,
      standing_resolved_at_commit: decision.standing?.resolved_at_commit === true,
      standing_inherited: decision.standing?.inherited === true,
      selected_reason: decision.reason,
      selected_rule: decision.reason_trace?.selected_from_rule || null,
      uncovered_rule_count: decision.rule_coverage?.uncovered_rule_ids?.length || 0
    },
    effect_hash,
    attestation_hash: await sha256Hex(attestation_seed),
    evidence_class: 'runtime_emitted_receipt'
  };
  receipt.receipt_hash = await sha256Hex(receipt);
  return receipt;
}
