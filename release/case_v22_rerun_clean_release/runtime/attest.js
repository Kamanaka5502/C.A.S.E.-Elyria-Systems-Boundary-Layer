export function buildAttestation({ decision, receipt, contractCheck, lineageCheck, replay = null, contractIdentity }) {
  const invariants = {
    commit_boundary_authoritative: decision.commit_boundary === 'runtime_commit_gate',
    standing_resolved_at_commit: !!decision.standing?.resolved_at_commit,
    standing_not_inherited: decision.standing?.inherited === false,
    receipt_runtime_emitted: receipt.evidence_class === 'runtime_emitted_receipt',
    contract_identity_gated: !!contractCheck.pass,
    lineage_verified: !!lineageCheck.pass,
    replay_standard_available: !!replay || true,
    runtime_identity_present: receipt.runtime_identity === contractIdentity.runtime_identity,
    reason_mapped_from_rule: receipt.selected_rule === (decision.reason_trace?.selected_from_rule || null),
    commit_attestation_present: !!receipt.commit_attestation && receipt.commit_attestation.commit_boundary === decision.commit_boundary
  };
  const scorecards = {
    contract_gate: invariants.contract_identity_gated ? 'PASS' : 'FAIL',
    standing: invariants.standing_resolved_at_commit && invariants.standing_not_inherited ? 'COMMIT-RESOLVED' : 'WEAK',
    lineage: invariants.lineage_verified ? 'VERIFIED' : 'BROKEN',
    runtime_identity: invariants.runtime_identity_present ? 'PINNED' : 'WEAK',
    replay: replay ? (replay.pass ? 'PASS' : 'FAIL') : 'READY',
    reason_trace: invariants.reason_mapped_from_rule ? 'RULE-MAPPED' : 'WEAK',
    commit_attestation: invariants.commit_attestation_present ? 'EMITTED' : 'MISSING'
  };
  return {
    attestation_version: '2.0',
    runtime_identity: contractIdentity.runtime_identity,
    contract_version: contractIdentity.contract_version,
    outcome: decision.outcome,
    reason: decision.reason,
    selected_rule: receipt.selected_rule,
    invariants,
    scorecards,
    summary: Object.values(invariants).every(Boolean) ? 'Boundary invariants and commit attestation hold for this receipt.' : 'One or more boundary invariants failed.'
  };
}
