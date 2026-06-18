export function verifyContractIdentity(proposal, state, identity, contract) {
  const checks = {
    contract_identity_required: {
      pass: proposal.contract_sha256 === identity.contract_sha256,
      observed: proposal.contract_sha256,
      expected: identity.contract_sha256,
      reason_on_fail: 'contract_mismatch'
    },
    state_contract_alignment_required: {
      pass: state.contract_sha256 === identity.contract_sha256,
      observed: state.contract_sha256,
      expected: identity.contract_sha256,
      reason_on_fail: 'contract_mismatch'
    },
    state_epoch_required: {
      pass: typeof state.state_epoch === 'string' && state.state_epoch.length > 0,
      observed: state.state_epoch,
      expected: 'non-empty state epoch',
      reason_on_fail: 'state_epoch_missing'
    },
    runtime_identity_required: {
      pass: typeof identity.runtime_identity === 'string' && identity.runtime_identity.length > 0,
      observed: identity.runtime_identity,
      expected: 'non-empty runtime identity',
      reason_on_fail: 'runtime_identity_missing'
    }
  };

  const failingRule = Object.entries(checks).find(([,v]) => !v.pass);
  return {
    checks,
    proposal_contract_match: checks.contract_identity_required.pass,
    state_contract_match: checks.state_contract_alignment_required.pass,
    state_epoch_present: checks.state_epoch_required.pass,
    runtime_identity_present: checks.runtime_identity_required.pass,
    pass: !failingRule,
    failure_rule: failingRule ? failingRule[0] : null,
    failure_reason: failingRule ? failingRule[1].reason_on_fail : null,
    visible_contract_rules_at_commit: (contract?.rules?.rule_ids || []).filter(id => checks[id])
  };
}
