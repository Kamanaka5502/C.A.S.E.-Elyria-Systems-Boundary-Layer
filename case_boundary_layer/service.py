from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from .engine import evaluate_admissibility
from .io import sha256_json


def validate_envelope(envelope: dict[str, Any] | None, contract_identity: dict[str, Any]) -> dict[str, Any]:
    allowed = set(contract_identity.get("allowed_channels") or [])
    checks = {
        "method_post": (envelope or {}).get("method") == "POST",
        "boundary_attestation_present": isinstance((envelope or {}).get("boundary_attestation"), str) and len((envelope or {}).get("boundary_attestation", "")) > 8,
        "source_channel_allowed": (envelope or {}).get("source_channel") in allowed,
        "session_nonce_present": isinstance((envelope or {}).get("session_nonce"), str) and len((envelope or {}).get("session_nonce", "")) > 8,
        "submitted_at_present": isinstance((envelope or {}).get("submitted_at_utc"), str) and len((envelope or {}).get("submitted_at_utc", "")) > 8,
    }
    failed = [k for k, v in checks.items() if not v]
    return {
        "pass": len(failed) == 0,
        "checks": checks,
        "failed": failed,
        "failure_mode": f"BOUNDARY_ENVELOPE_INVALID:{'|'.join(failed)}" if failed else None,
    }


def verify_contract_identity(proposal: dict[str, Any], state: dict[str, Any], contract_identity: dict[str, Any], contract: dict[str, Any]) -> dict[str, Any]:
    proposal_contract_match = proposal.get("contract_sha256") == contract_identity.get("contract_sha256")
    state_contract_match = state.get("contract_sha256") == contract_identity.get("contract_sha256")
    contract_version_match = contract.get("contract_version") == contract_identity.get("contract_version")
    runtime_identity_pinned = isinstance(contract_identity.get("runtime_identity"), str) and len(contract_identity.get("runtime_identity", "")) > 0
    checks = {
        "contract_identity_required": {
            "pass": proposal_contract_match,
            "reason_on_fail": "contract_mismatch",
            "observed": proposal.get("contract_sha256"),
            "expected": contract_identity.get("contract_sha256"),
        },
        "state_contract_alignment_required": {
            "pass": state_contract_match,
            "reason_on_fail": "contract_mismatch",
            "observed": state.get("contract_sha256"),
            "expected": contract_identity.get("contract_sha256"),
        },
        "runtime_identity_required": {
            "pass": runtime_identity_pinned,
            "reason_on_fail": "runtime_identity_missing",
            "observed": contract_identity.get("runtime_identity"),
            "expected": "non-empty runtime identity",
        },
    }
    for rule_id, info in checks.items():
        if not info["pass"]:
            return {
                "pass": False,
                "checks": checks,
                "proposal_contract_match": proposal_contract_match,
                "state_contract_match": state_contract_match,
                "contract_version_match": contract_version_match,
                "failure_rule": rule_id,
                "failure_reason": info["reason_on_fail"],
            }
    return {
        "pass": True,
        "checks": checks,
        "proposal_contract_match": proposal_contract_match,
        "state_contract_match": state_contract_match,
        "contract_version_match": contract_version_match,
        "failure_rule": None,
        "failure_reason": None,
    }


def build_commit_attestation(proposal: dict[str, Any], state: dict[str, Any], decision: dict[str, Any], contract_identity: dict[str, Any], lineage: dict[str, Any], envelope_check: dict[str, Any]) -> dict[str, Any]:
    attestation = {
        "attestation_type": "case_commit_attestation",
        "runtime_identity": contract_identity.get("runtime_identity"),
        "contract_sha256": contract_identity.get("contract_sha256"),
        "contract_version": contract_identity.get("contract_version"),
        "decision_id": proposal.get("decision_id"),
        "outcome": decision.get("outcome"),
        "reason": decision.get("reason"),
        "authority_scope": decision.get("standing", {}).get("authority_basis"),
        "evidence_lineage": lineage,
        "current_state_epoch": state.get("state_epoch"),
        "proposal_state_epoch": proposal.get("state_epoch"),
        "boundary_envelope_valid": envelope_check.get("pass"),
        "standing_inherited": False,
        "standing_resolved_at_commit": True,
    }
    attestation["attestation_signature"] = sha256_json(attestation)
    return attestation


def emit_receipt(proposal: dict[str, Any], state: dict[str, Any], decision: dict[str, Any], contract_identity: dict[str, Any], lineage: dict[str, Any], commit_attestation: dict[str, Any]) -> dict[str, Any]:
    receipt = {
        "receipt_type": "case_runtime_receipt",
        "runtime_identity": contract_identity.get("runtime_identity"),
        "contract_sha256": contract_identity.get("contract_sha256"),
        "contract_version": contract_identity.get("contract_version"),
        "decision_id": proposal.get("decision_id"),
        "outcome": decision.get("outcome"),
        "reason": decision.get("reason"),
        "selected_rule": decision.get("reason_trace", {}).get("selected_from_rule"),
        "commit_boundary": decision.get("commit_boundary"),
        "standing": decision.get("standing"),
        "rule_coverage": decision.get("rule_coverage"),
        "governing_conditions": decision.get("reason_trace", {}).get("governing_conditions", {}),
        "commit_attestation": commit_attestation,
        "state_epoch": state.get("state_epoch"),
        "lineage_index": int(lineage.get("lineage_index", 0)) + 1,
        "prev_receipt_hash": lineage.get("prev_receipt_hash", "GENESIS"),
        "emitted_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    receipt["lineage_hash"] = sha256_json({
        "prev_receipt_hash": receipt["prev_receipt_hash"],
        "decision_id": receipt["decision_id"],
        "outcome": receipt["outcome"],
        "lineage_index": receipt["lineage_index"],
    })
    receipt["receipt_hash"] = sha256_json({k: v for k, v in receipt.items() if k != "receipt_hash"})
    return receipt


def commit_proposal(proposal: dict[str, Any], state: dict[str, Any], contract: dict[str, Any], contract_identity: dict[str, Any], lineage: dict[str, Any], previous_receipt: dict[str, Any] | None, envelope: dict[str, Any], envelope_check: dict[str, Any]) -> dict[str, Any]:
    contract_check = verify_contract_identity(proposal, state, contract_identity, contract)
    if contract_check["pass"]:
        decision = evaluate_admissibility(proposal, state, contract, contract_identity)
    else:
        selected_rule = contract_check["failure_rule"]
        selected_reason = contract_check["failure_reason"]
        decision = evaluate_admissibility(proposal, state, contract, contract_identity)
        decision["outcome"] = "REFUSE"
        decision["reason"] = selected_reason
        decision["reason_trace"]["selected_reason"] = selected_reason
        decision["reason_trace"]["selected_from_rule"] = selected_rule
        decision["standing"]["continuation_valid"] = False
        decision["standing"]["burden_state"] = "continuation_denied"

    commit_attestation = build_commit_attestation(proposal, state, decision, contract_identity, lineage, envelope_check)
    receipt = emit_receipt(proposal, state, decision, contract_identity, lineage, commit_attestation)
    return {
        "contractCheck": contract_check,
        "decision": decision,
        "commitAttestation": commit_attestation,
        "receipt": receipt,
        "gateSummary": {
            "authoritative_boundary": "runtime_commit_gate",
            "bounded_outcome": decision["outcome"],
            "re_evaluated_at_commit": True,
            "carried_forward_standing": False,
            "contract_check_pass": contract_check["pass"],
            "enforced_rule_count": len(decision.get("contract_rule_results") or []),
            "selected_reason": decision["reason"],
            "lineage_index": receipt["lineage_index"],
            "lineage_hash": receipt["lineage_hash"],
        },
    }


def submit_proposal(proposal: dict[str, Any], state: dict[str, Any], contract: dict[str, Any], contract_identity: dict[str, Any], lineage: dict[str, Any], previous_receipt: dict[str, Any] | None = None, envelope: dict[str, Any] | None = None) -> dict[str, Any]:
    proposal = deepcopy(proposal)
    state = deepcopy(state)
    envelope_check = validate_envelope(envelope, contract_identity)
    if not envelope_check["pass"]:
        return {
            "decision": {
                "commit_boundary": "runtime_commit_gate",
                "outcome": "REFUSE",
                "reason": envelope_check["failure_mode"],
                "checks": {"boundary_envelope_valid": False},
                "standing": {
                    "standing_id": f"std_{proposal.get('decision_id')}",
                    "inherited": False,
                    "resolved_at_commit": True,
                    "continuation_valid": False,
                    "burden_state": "continuation_denied",
                },
                "contract_rule_results": [],
                "rule_coverage": {"complete": False, "failed_boundary_envelope": True},
                "reason_trace": {"selected_from_rule": "boundary_service_envelope_required", "selected_reason": envelope_check["failure_mode"], "failed_checks": envelope_check["failed"]},
            },
            "receipt": None,
            "envelopeCheck": envelope_check,
        }
    return commit_proposal(proposal, state, contract, contract_identity, lineage, previous_receipt, envelope or {}, envelope_check)
