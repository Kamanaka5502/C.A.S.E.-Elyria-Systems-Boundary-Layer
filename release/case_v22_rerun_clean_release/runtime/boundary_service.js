import { commitProposal } from './commit_gate.js';

function validateEnvelope(envelope, contractIdentity) {
  const allowed = new Set(contractIdentity.allowed_channels || []);
  const checks = {
    method_post: envelope?.method === 'POST',
    boundary_attestation_present: typeof envelope?.boundary_attestation === 'string' && envelope.boundary_attestation.length > 8,
    source_channel_allowed: allowed.has(envelope?.source_channel),
    session_nonce_present: typeof envelope?.session_nonce === 'string' && envelope.session_nonce.length > 8,
    submitted_at_present: typeof envelope?.submitted_at_utc === 'string' && envelope.submitted_at_utc.length > 8
  };
  const failed = Object.entries(checks).filter(([,v]) => !v).map(([k]) => k);
  return {
    pass: failed.length === 0,
    checks,
    failed,
    failure_mode: failed.length ? `BOUNDARY_ENVELOPE_INVALID:${failed.join('|')}` : null
  };
}

export async function invokeBoundaryService({ envelope, proposal, state, contract, contractIdentity, lineage, previousReceipt=null }) {
  const envelopeCheck = validateEnvelope(envelope, contractIdentity);
  if (!envelopeCheck.pass) {
    return {
      decision: {
        commit_boundary: 'runtime_commit_gate',
        outcome: 'REFUSE',
        reason: envelopeCheck.failure_mode,
        checks: {
          authority_valid: !!proposal.authority,
          consent_valid: proposal.consent === 'granted',
          context_complete: !!proposal.contextComplete,
          ttl_valid: Number(proposal.ttlSeconds || 0) > 0,
          risk_valid: true,
          risk_halt_required: false,
          risk_escalation_required: false,
          contract_valid: false,
          state_contract_aligned: false,
          state_epoch_aligned: proposal.state_epoch === state.state_epoch,
          current_state_seen: true,
          boundary_envelope_valid: false
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
        contract_rule_results: [],
        rule_coverage: { complete: false, failed_boundary_envelope: true },
        reason_trace: { selected_from_rule: 'boundary_service_envelope_required', selected_reason: envelopeCheck.failure_mode, failed_checks: envelopeCheck.failed },
        boundary_enforcement_summary: 'Boundary service refused before contract evaluation because envelope was invalid.',
        boundary_envelope_check: envelopeCheck
      },
      receipt: null,
      envelopeCheck
    };
  }

  return commitProposal({ proposal, state, contract, contractIdentity, lineage, previousReceipt, boundaryEnvelope: envelope, envelopeCheck });
}
