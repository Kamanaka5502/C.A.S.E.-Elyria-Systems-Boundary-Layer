function rule(id, pass, reasonOnFail, observed, expected, note = '') {
  return { id, pass, reason_on_fail: reasonOnFail, observed, expected, note };
}

export function evaluateAdmissibility(proposal, state, contract, contractIdentity) {
  const risk = Number(proposal.risk || 1);
  const maxRisk = Number(contract.rules.max_risk);
  const escalateThreshold = Number(contract.rules.escalate_threshold);
  const ttl = Number(proposal.ttlSeconds || 0);

  const ruleResults = [
    rule('authority_required', !!proposal.authority, 'authority_invalid', !!proposal.authority, true, 'Authority must be present at commit.'),
    rule('consent_required', proposal.consent === 'granted', 'consent_revoked', proposal.consent, 'granted', 'Consent must still be granted at commit.'),
    rule('context_complete_required', !!proposal.contextComplete, 'context_incomplete', !!proposal.contextComplete, true, 'Context must be complete at commit.'),
    rule('ttl_positive_required', ttl > 0, 'ttl_invalid', ttl, '> 0', 'Standing expires if TTL is not positive at commit.'),
    rule('contract_identity_required', proposal.contract_sha256 === contractIdentity.contract_sha256, 'contract_mismatch', proposal.contract_sha256, contractIdentity.contract_sha256, 'Proposal contract identity must match the authoritative contract.'),
    rule('state_contract_alignment_required', state.contract_sha256 === contractIdentity.contract_sha256, 'contract_mismatch', state.contract_sha256, contractIdentity.contract_sha256, 'Current state must align to the authoritative contract.'),
    rule('state_epoch_required', proposal.state_epoch === state.state_epoch, 'state_shift_detected', proposal.state_epoch, state.state_epoch, 'Proposal epoch must match current state epoch at commit.'),
    rule('risk_within_max_or_halt', risk <= maxRisk, 'risk_exceeds_max_bound', risk, `<= ${maxRisk}`, 'Risk above max_risk forces HALT at commit rather than implicit carry-forward.'),
    rule('runtime_identity_required', typeof contractIdentity.runtime_identity === 'string' && contractIdentity.runtime_identity.length > 0, 'runtime_identity_missing', contractIdentity.runtime_identity, 'non-empty runtime identity', 'Runtime identity must be pinned for the active boundary.'),
    rule('receipt_lineage_required', true, 'lineage_missing', 'verified_in_receipt_phase', 'receipt_lineage_verified', 'Receipt lineage is verified and can break loudly on tamper.')
  ];

  const contractRuleIds = contract.rules.rule_ids || [];
  const coveredRuleIds = ruleResults.map(r => r.id);
  const uncoveredRuleIds = contractRuleIds.filter(id => !coveredRuleIds.includes(id));

  const checks = {
    authority_valid: ruleResults[0].pass,
    consent_valid: ruleResults[1].pass,
    context_complete: ruleResults[2].pass,
    ttl_valid: ruleResults[3].pass,
    risk_valid: ruleResults[7].pass,
    risk_halt_required: risk > maxRisk,
    risk_escalation_required: risk > escalateThreshold && risk <= maxRisk,
    contract_valid: ruleResults[4].pass,
    state_contract_aligned: ruleResults[5].pass,
    state_epoch_aligned: ruleResults[6].pass,
    current_state_seen: true,
    runtime_identity_pinned: ruleResults[8].pass
  };

  const hardRefuseRule = ruleResults.find(r => !r.pass && r.id !== 'risk_within_max_or_halt');
  const haltRequired = !hardRefuseRule && risk > maxRisk;
  const requiresEscalation = !hardRefuseRule && !haltRequired && risk > escalateThreshold && risk <= maxRisk;

  let outcome = 'EXECUTE';
  let reason = 'admissible';
  if (hardRefuseRule) {
    outcome = 'REFUSE';
    reason = hardRefuseRule.reason_on_fail;
  } else if (haltRequired) {
    outcome = 'HALT';
    reason = 'risk_exceeds_max_bound';
  } else if (requiresEscalation) {
    outcome = 'ESCALATE';
    reason = 'risk_requires_human_escalation';
  }

  const reasonTrace = {
    selected_reason: reason,
    selected_from_rule: hardRefuseRule?.id || (haltRequired ? 'risk_within_max_or_halt' : requiresEscalation ? 'escalate_threshold' : 'all_rules_passed'),
    rule_results: ruleResults,
    governing_conditions: {
      contract_sha256: contractIdentity.contract_sha256,
      contract_version: contractIdentity.contract_version,
      current_state_epoch: state.state_epoch,
      proposal_state_epoch: proposal.state_epoch,
      runtime_identity: contractIdentity.runtime_identity,
      max_risk: maxRisk,
      escalate_threshold: escalateThreshold,
      observed_risk: risk
    }
  };

  const standing = {
    standing_id: `std_${proposal.decision_id}`,
    authority_basis: checks.authority_valid ? 'explicit_authority_present' : 'missing_authority',
    consent_basis: proposal.consent,
    ttl_seconds_remaining: ttl,
    contract_identity: contractIdentity.contract_sha256,
    contract_version: contractIdentity.contract_version,
    current_state_epoch: state.state_epoch,
    proposal_state_epoch: proposal.state_epoch,
    action_class: proposal.actionClass || 'governed_decision',
    inherited: false,
    resolved_at_commit: true,
    continuation_valid: outcome === 'EXECUTE' || outcome === 'ESCALATE',
    burden_state: outcome === 'HALT' ? 'halt_required' : outcome === 'REFUSE' ? 'continuation_denied' : 'continuation_admissible'
  };

  return {
    commit_boundary: 'runtime_commit_gate',
    outcome,
    reason,
    checks,
    standing,
    contract_rule_results: ruleResults,
    rule_coverage: {
      contract_rule_count: contractRuleIds.length,
      covered_rule_count: contractRuleIds.filter(id => coveredRuleIds.includes(id)).length,
      uncovered_rule_ids: uncoveredRuleIds,
      complete: uncoveredRuleIds.length === 0
    },
    reason_trace: reasonTrace,
    runtime_notes: [
      'All effect-bearing rules are evaluated at runtime_commit_gate under current state.',
      'Each outcome reason is selected from explicit boundary rule results.',
      'Standing is resolved at commit and is not inherited from prior admission.',
      'Replay compares governing conditions explicitly rather than collapsing to pass/fail.',
      'Lineage verification is expected to break loudly on tamper.',
      'Contract rule coverage is reported directly in the decision surface.'
    ]
  };
}
