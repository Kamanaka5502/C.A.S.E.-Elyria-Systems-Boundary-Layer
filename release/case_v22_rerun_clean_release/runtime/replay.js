export function replayEquivalent(a, b) {
  const governingConditions = {
    contract: { same: a.contract_sha256 === b.contract_sha256, a: a.contract_sha256, b: b.contract_sha256 },
    relevant_inputs: { same: a.proposal_hash === b.proposal_hash, a: a.proposal_hash, b: b.proposal_hash },
    state_epoch: { same: a.state_epoch === b.state_epoch, a: a.state_epoch, b: b.state_epoch },
    runtime_identity: { same: a.runtime_identity === b.runtime_identity, a: a.runtime_identity, b: b.runtime_identity },
    commit_boundary: { same: a.commit_boundary === b.commit_boundary, a: a.commit_boundary, b: b.commit_boundary },
    decision_class: { same: a.outcome === b.outcome, a: a.outcome, b: b.outcome }
  };
  const diff = Object.entries(governingConditions).filter(([,v]) => !v.same).map(([k]) => k);
  let classification = 'stable';
  if (diff.includes('contract')) classification = 'contract_shift';
  else if (diff.includes('state_epoch')) classification = 'state_shift';
  else if (diff.includes('relevant_inputs')) classification = 'input_shift';
  else if (diff.includes('runtime_identity')) classification = 'runtime_shift';
  else if (diff.includes('decision_class')) classification = 'decision_shift';
  return {
    standard: 'same contract + same relevant inputs + same state epoch + same runtime identity -> same decision class',
    governing_conditions: governingConditions,
    checks: {
      same_contract: governingConditions.contract.same,
      same_relevant_inputs: governingConditions.relevant_inputs.same,
      same_state_epoch: governingConditions.state_epoch.same,
      same_decision_class: governingConditions.decision_class.same,
      same_commit_boundary: governingConditions.commit_boundary.same,
      same_runtime_identity: governingConditions.runtime_identity.same
    },
    pass: diff.length === 0,
    diff,
    classification,
    explanation: diff.length === 0 ? 'Replay held because governing conditions remained the same.' : `Replay broke because governing conditions changed: ${diff.join(', ')}`
  };
}

export function compareReceipts(a, b) {
  return {
    outcome_a: a.outcome,
    outcome_b: b.outcome,
    reason_a: a.reason,
    reason_b: b.reason,
    selected_rule_a: a.selected_rule,
    selected_rule_b: b.selected_rule,
    state_epoch_a: a.state_epoch,
    state_epoch_b: b.state_epoch,
    lineage_index_a: a.lineage_index,
    lineage_index_b: b.lineage_index,
    same_receipt_hash: a.receipt_hash === b.receipt_hash,
    same_lineage_hash: a.lineage_hash === b.lineage_hash,
    changed_fields: Object.keys({outcome:a.outcome,reason:a.reason,state_epoch:a.state_epoch,contract_sha256:a.contract_sha256,runtime_identity:a.runtime_identity,selected_rule:a.selected_rule}).filter(k => a[k] !== b[k])
  };
}
