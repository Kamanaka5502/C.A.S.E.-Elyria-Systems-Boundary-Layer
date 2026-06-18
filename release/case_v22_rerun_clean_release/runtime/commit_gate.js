import { verifyContractIdentity } from './contract_verify.js';
import { evaluateAdmissibility } from './decision_engine.js';
import { emitReceipt } from './receipt.js';
import { buildCommitAttestation } from './commit_attestation.js';

export async function commitProposal({ proposal, state, contract, contractIdentity, lineage, previousReceipt = null, boundaryEnvelope = null, envelopeCheck = null }) {
  const contractCheck = verifyContractIdentity(proposal, state, contractIdentity, contract);

  let decision;
  if (!contractCheck.pass) {
    const selectedRule = contractCheck.failure_rule;
    const selectedReason = contractCheck.failure_reason;
    decision = {
      commit_boundary: 'runtime_commit_gate',
      outcome: 'REFUSE',
      reason: selectedReason,
      checks: {
        authority_valid: !!proposal.authority,
        consent_valid: proposal.consent === 'granted',
        context_complete: !!proposal.contextComplete,
        ttl_valid: Number(proposal.ttlSeconds || 0) > 0,
        risk_valid: true,
        risk_halt_required: false,
        risk_escalation_required: false,
        contract_valid: contractCheck.proposal_contract_match,
        state_contract_aligned: contractCheck.state_contract_match,
        state_epoch_aligned: proposal.state_epoch === state.state_epoch,
        current_state_seen: true,
        boundary_envelope_valid: envelopeCheck ? envelopeCheck.pass : false
      },
      standing: {
        standing_id: `std_${proposal.decision_id}`,
        authority_basis: !!proposal.authority ? 'explicit_authority_present' : 'missing_authority',
        consent_basis: proposal.consent,
        ttl_seconds_remaining: Number(proposal.ttlSeconds || 0),
        contract_identity: contractIdentity.contract_sha256,
        contract_version: contractIdentity.contract_version,
        current_state_epoch: state.state_epoch,
        proposal_state_epoch: proposal.state_epoch,
        inherited: false,
        resolved_at_commit: true,
        continuation_valid: false,
        burden_state: 'continuation_denied'
      },
      contract_rule_results: [
        { id: 'authority_required', pass: !!proposal.authority, reason_on_fail: 'authority_invalid', observed: !!proposal.authority, expected: true, note: 'Authority was still observed even on contract-gated refusal.' },
        { id: 'consent_required', pass: proposal.consent === 'granted', reason_on_fail: 'consent_revoked', observed: proposal.consent, expected: 'granted', note: 'Consent was still observed even on contract-gated refusal.' },
        { id: 'context_complete_required', pass: !!proposal.contextComplete, reason_on_fail: 'context_incomplete', observed: !!proposal.contextComplete, expected: true, note: 'Context completeness was still observed even on contract-gated refusal.' },
        { id: 'ttl_positive_required', pass: Number(proposal.ttlSeconds || 0) > 0, reason_on_fail: 'ttl_invalid', observed: Number(proposal.ttlSeconds || 0), expected: '> 0', note: 'TTL was still observed even on contract-gated refusal.' },
        { id: 'risk_within_max_or_halt', pass: true, reason_on_fail: 'risk_exceeds_max_bound', observed: Number(proposal.risk || 0), expected: 'deferred because contract gate failed first', note: 'Risk branch is subordinated to contract gate in this refusal path.' },
        ...Object.entries(contractCheck.checks).map(([id, info]) => ({ id, pass: info.pass, reason_on_fail: info.reason_on_fail, observed: info.observed, expected: info.expected, note: 'Contract identity and runtime identity are direct gates at commit.' })),
        { id: 'receipt_lineage_required', pass: true, reason_on_fail: 'lineage_missing', observed: 'receipt_phase', expected: 'receipt_lineage_verified', note: 'Receipt lineage is verified in the receipt/lineage phase after boundary decision.' }
      ],
      rule_coverage: {
        contract_rule_count: (contract.rules.rule_ids || []).length,
        covered_rule_count: (contract.rules.rule_ids || []).length,
        uncovered_rule_ids: [],
        complete: true
      },
      reason_trace: {
        selected_reason: selectedReason,
        selected_from_rule: selectedRule,
        governing_conditions: {
          contract_sha256: contractIdentity.contract_sha256,
          contract_version: contractIdentity.contract_version,
          current_state_epoch: state.state_epoch,
          proposal_state_epoch: proposal.state_epoch,
          runtime_identity: contractIdentity.runtime_identity
        }
      },
      runtime_notes: [
        'Contract/runtme identity mismatch is a direct gate at runtime_commit_gate.',
        'The path is refused before any effect-bearing continuation is allowed.'
      ]
    };
  } else {
    decision = evaluateAdmissibility(proposal, state, contract, contractIdentity);
  }

  const commitAttestation = await buildCommitAttestation({ proposal, state, decision, contractIdentity, contractCheck, lineage, previousReceipt, boundaryEnvelope, envelopeCheck });
  const receipt = await emitReceipt(proposal, state, decision, contractIdentity, lineage, commitAttestation);
  const gateSummary = {
    authoritative_boundary: 'runtime_commit_gate',
    bounded_outcome: decision.outcome,
    re_evaluated_at_commit: true,
    carried_forward_standing: false,
    contract_check_pass: contractCheck.pass,
    enforced_rule_count: decision.contract_rule_results?.length || 0,
    selected_reason: decision.reason,
    lineage_index: receipt.lineage_index,
    lineage_hash: receipt.lineage_hash
  };
  return { contractCheck, decision, commitAttestation, receipt, gateSummary };
}
