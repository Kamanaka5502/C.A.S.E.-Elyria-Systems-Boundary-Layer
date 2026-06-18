import { sha256Hex, nowUtc } from './utils.js';

export async function buildCommitAttestation({ proposal, state, decision, contractIdentity, contractCheck, lineage, previousReceipt = null, boundaryEnvelope = null, envelopeCheck = null }) {
  const rebind = {
    governing_basis: {
      contract_sha256: contractIdentity.contract_sha256,
      contract_version: contractIdentity.contract_version,
      runtime_identity: contractIdentity.runtime_identity,
      build_identity: contractIdentity.build_identity
    },
    authority_scope: {
      authority_present: !!proposal.authority,
      consent: proposal.consent,
      ttl_seconds_remaining: Number(proposal.ttlSeconds || 0),
      action_class: proposal.actionClass || 'governed_decision',
      allowed_outcome_set: ['EXECUTE','REFUSE','ESCALATE','HALT']
    },
    evidence_lineage: {
      previous_receipt_hash: lineage?.prev_receipt_hash || 'GENESIS',
      previous_receipt_available: !!previousReceipt,
      proposal_state_epoch: proposal.state_epoch,
      current_state_epoch: state.state_epoch,
      lineage_index_next: Number(lineage?.lineage_index || 0) + 1
    },
    current_state: {
      state_epoch: state.state_epoch,
      contract_sha256: state.contract_sha256,
      current_state_seen: true
    }
  };

  const invariants = {
    contract_identity_match: !!contractCheck.proposal_contract_match,
    state_contract_alignment: !!contractCheck.state_contract_match,
    state_epoch_present: !!contractCheck.state_epoch_present,
    runtime_identity_present: !!contractCheck.runtime_identity_present,
    standing_resolved_at_commit: decision?.standing?.resolved_at_commit === true,
    standing_not_inherited: decision?.standing?.inherited === false,
    lineage_continuity_available: !!lineage,
    current_state_seen: decision?.checks?.current_state_seen === true,
    boundary_envelope_valid: envelopeCheck ? envelopeCheck.pass : false
  };

  const governing_conditions = {
    boundary_channel: boundaryEnvelope?.source_channel || null,
    contract_sha256: contractIdentity.contract_sha256,
    contract_version: contractIdentity.contract_version,
    runtime_identity: contractIdentity.runtime_identity,
    proposal_state_epoch: proposal.state_epoch,
    current_state_epoch: state.state_epoch,
    authority_present: !!proposal.authority,
    consent: proposal.consent,
    ttl_seconds_remaining: Number(proposal.ttlSeconds || 0),
    risk: Number(proposal.risk || 0)
  };

  const attestation = {
    attestation_id: `cat_${proposal.decision_id}_${Date.now()}`,
    attestation_version: '3.0',
    emitted_at_utc: nowUtc(),
    commit_boundary: decision.commit_boundary,
    proposal_id: proposal.decision_id,
    outcome: decision.outcome,
    reason: decision.reason,
    selected_rule: decision?.reason_trace?.selected_from_rule || null,
    rebinding: rebind,
    invariants,
    governing_conditions,
    signer: {
      scheme: 'sha256_attestation_seal',
      signing_subject: contractIdentity.runtime_identity,
      build_identity: contractIdentity.build_identity
    },
    summary: 'Signed commit-time re-binding of governing basis, authority scope, evidence lineage, and current state.'
  };
  const signing_payload = {
    attestation_id: attestation.attestation_id,
    commit_boundary: attestation.commit_boundary,
    proposal_id: attestation.proposal_id,
    outcome: attestation.outcome,
    reason: attestation.reason,
    selected_rule: attestation.selected_rule,
    rebinding: attestation.rebinding,
    invariants: attestation.invariants,
    governing_conditions: attestation.governing_conditions,
    signer: attestation.signer
  };
  attestation.attestation_hash = await sha256Hex(signing_payload);
  attestation.attestation_signature = await sha256Hex({
    scheme: attestation.signer.scheme,
    signing_subject: attestation.signer.signing_subject,
    build_identity: attestation.signer.build_identity,
    attestation_hash: attestation.attestation_hash
  });
  return attestation;
}
