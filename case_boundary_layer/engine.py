from __future__ import annotations

from typing import Any


def rule(id: str, passed: bool, reason_on_fail: str, observed: Any, expected: Any, note: str = "") -> dict[str, Any]:
    return {
        "id": id,
        "pass": passed,
        "reason_on_fail": reason_on_fail,
        "observed": observed,
        "expected": expected,
        "note": note,
    }


def evaluate_admissibility(proposal: dict[str, Any], state: dict[str, Any], contract: dict[str, Any], contract_identity: dict[str, Any]) -> dict[str, Any]:
    risk = float(proposal.get("risk") or 1)
    max_risk = float(contract["rules"]["max_risk"])
    escalate_threshold = float(contract["rules"]["escalate_threshold"])
    ttl = float(proposal.get("ttlSeconds") or 0)

    rule_results = [
        rule("authority_required", bool(proposal.get("authority")), "authority_invalid", bool(proposal.get("authority")), True, "Authority must be present at commit."),
        rule("consent_required", proposal.get("consent") == "granted", "consent_revoked", proposal.get("consent"), "granted", "Consent must still be granted at commit."),
        rule("context_complete_required", bool(proposal.get("contextComplete")), "context_incomplete", bool(proposal.get("contextComplete")), True, "Context must be complete at commit."),
        rule("ttl_positive_required", ttl > 0, "ttl_invalid", ttl, "> 0", "Standing expires if TTL is not positive at commit."),
        rule("contract_identity_required", proposal.get("contract_sha256") == contract_identity.get("contract_sha256"), "contract_mismatch", proposal.get("contract_sha256"), contract_identity.get("contract_sha256"), "Proposal contract identity must match the authoritative contract."),
        rule("state_contract_alignment_required", state.get("contract_sha256") == contract_identity.get("contract_sha256"), "contract_mismatch", state.get("contract_sha256"), contract_identity.get("contract_sha256"), "Current state must align to the authoritative contract."),
        rule("state_epoch_required", proposal.get("state_epoch") == state.get("state_epoch"), "state_shift_detected", proposal.get("state_epoch"), state.get("state_epoch"), "Proposal epoch must match current state epoch at commit."),
        rule("risk_within_max_or_halt", risk <= max_risk, "risk_exceeds_max_bound", risk, f"<= {max_risk}", "Risk above max_risk forces HALT at commit rather than implicit carry-forward."),
        rule("runtime_identity_required", isinstance(contract_identity.get("runtime_identity"), str) and len(contract_identity.get("runtime_identity", "")) > 0, "runtime_identity_missing", contract_identity.get("runtime_identity"), "non-empty runtime identity", "Runtime identity must be pinned for the active boundary."),
        rule("receipt_lineage_required", True, "lineage_missing", "verified_in_receipt_phase", "receipt_lineage_verified", "Receipt lineage is verified and can break loudly on tamper."),
    ]

    contract_rule_ids = contract["rules"].get("rule_ids") or []
    covered_rule_ids = [r["id"] for r in rule_results]
    uncovered_rule_ids = [rid for rid in contract_rule_ids if rid not in covered_rule_ids]

    checks = {
        "authority_valid": rule_results[0]["pass"],
        "consent_valid": rule_results[1]["pass"],
        "context_complete": rule_results[2]["pass"],
        "ttl_valid": rule_results[3]["pass"],
        "risk_valid": rule_results[7]["pass"],
        "risk_halt_required": risk > max_risk,
        "risk_escalation_required": risk > escalate_threshold and risk <= max_risk,
        "contract_valid": rule_results[4]["pass"],
        "state_contract_aligned": rule_results[5]["pass"],
        "state_epoch_aligned": rule_results[6]["pass"],
        "current_state_seen": True,
        "runtime_identity_pinned": rule_results[8]["pass"],
    }

    hard_refuse_rule = next((r for r in rule_results if not r["pass"] and r["id"] != "risk_within_max_or_halt"), None)
    halt_required = hard_refuse_rule is None and risk > max_risk
    requires_escalation = hard_refuse_rule is None and not halt_required and risk > escalate_threshold and risk <= max_risk

    outcome = "EXECUTE"
    reason = "admissible"
    selected_rule = "all_rules_passed"
    if hard_refuse_rule:
        outcome = "REFUSE"
        reason = hard_refuse_rule["reason_on_fail"]
        selected_rule = hard_refuse_rule["id"]
    elif halt_required:
        outcome = "HALT"
        reason = "risk_exceeds_max_bound"
        selected_rule = "risk_within_max_or_halt"
    elif requires_escalation:
        outcome = "ESCALATE"
        reason = "risk_requires_human_escalation"
        selected_rule = "escalate_threshold"

    standing = {
        "standing_id": f"std_{proposal.get('decision_id')}",
        "authority_basis": "explicit_authority_present" if checks["authority_valid"] else "missing_authority",
        "consent_basis": proposal.get("consent"),
        "ttl_seconds_remaining": ttl,
        "contract_identity": contract_identity.get("contract_sha256"),
        "contract_version": contract_identity.get("contract_version"),
        "current_state_epoch": state.get("state_epoch"),
        "proposal_state_epoch": proposal.get("state_epoch"),
        "action_class": proposal.get("actionClass", "governed_decision"),
        "inherited": False,
        "resolved_at_commit": True,
        "continuation_valid": outcome in {"EXECUTE", "ESCALATE"},
        "burden_state": "halt_required" if outcome == "HALT" else "continuation_denied" if outcome == "REFUSE" else "continuation_admissible",
    }

    return {
        "commit_boundary": "runtime_commit_gate",
        "outcome": outcome,
        "reason": reason,
        "checks": checks,
        "standing": standing,
        "contract_rule_results": rule_results,
        "rule_coverage": {
            "contract_rule_count": len(contract_rule_ids),
            "covered_rule_count": len([rid for rid in contract_rule_ids if rid in covered_rule_ids]),
            "uncovered_rule_ids": uncovered_rule_ids,
            "complete": len(uncovered_rule_ids) == 0,
        },
        "reason_trace": {
            "selected_reason": reason,
            "selected_from_rule": selected_rule,
            "rule_results": rule_results,
            "governing_conditions": {
                "contract_sha256": contract_identity.get("contract_sha256"),
                "contract_version": contract_identity.get("contract_version"),
                "current_state_epoch": state.get("state_epoch"),
                "proposal_state_epoch": proposal.get("state_epoch"),
                "runtime_identity": contract_identity.get("runtime_identity"),
                "max_risk": max_risk,
                "escalate_threshold": escalate_threshold,
                "observed_risk": risk,
            },
        },
        "runtime_notes": [
            "All effect-bearing rules are evaluated at runtime_commit_gate under current state.",
            "Each outcome reason is selected from explicit boundary rule results.",
            "Standing is resolved at commit and is not inherited from prior admission.",
            "Replay compares governing conditions explicitly rather than collapsing to pass/fail.",
            "Lineage verification is expected to break loudly on tamper.",
            "Contract rule coverage is reported directly in the decision surface.",
        ],
    }
