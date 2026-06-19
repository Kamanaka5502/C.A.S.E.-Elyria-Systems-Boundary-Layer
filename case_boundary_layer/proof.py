from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from typing import Any

from .io import RELEASE_ROOT, load_json, sha256_json
from .service import submit_proposal

PROOF_FILES = {
    "execute": "proof/execute_case.json",
    "refuse": "proof/refuse_case.json",
    "escalate": "proof/escalate_case.json",
    "replay": "proof/replay_case.json",
    "tamper": "proof/tamper_case.json",
    "constitutional_shift": "proof/constitutional_shift_case.json",
    "ttl": "proof/ttl_case.json",
    "context": "proof/context_case.json",
    "halt": "proof/halt_case.json",
    "forged_receipt": "proof/forged_receipt_case.json",
    "precheck": "proof/precheck_valid_commit_invalid_case.json",
}


def replay_equivalent(first: dict[str, Any], second: dict[str, Any]) -> dict[str, Any]:
    governing_same = first.get("governing_conditions") == second.get("governing_conditions")
    outcome_same = first.get("outcome") == second.get("outcome")
    reason_same = first.get("reason") == second.get("reason")
    return {
        "pass": governing_same and outcome_same and reason_same,
        "classification": "same_condition_replay" if governing_same else "changed_condition_replay",
        "governing_conditions": {
            "first": first.get("governing_conditions"),
            "second": second.get("governing_conditions"),
        },
    }


def verify_lineage(receipt: dict[str, Any], previous_receipt: dict[str, Any] | None) -> dict[str, Any]:
    expected_prev = "GENESIS" if previous_receipt is None else previous_receipt.get("receipt_hash")
    prev_ok = receipt.get("prev_receipt_hash") == expected_prev
    recomputed = sha256_json({k: v for k, v in receipt.items() if k != "receipt_hash"})
    hash_ok = receipt.get("receipt_hash") == recomputed
    return {
        "pass": prev_ok and hash_ok,
        "failure_mode": None if prev_ok and hash_ok else "LINEAGE_OR_RECEIPT_HASH_MISMATCH",
        "loud_break": not (prev_ok and hash_ok),
    }


def forge_receipt(receipt: dict[str, Any]) -> dict[str, Any]:
    forged = deepcopy(receipt)
    forged["outcome"] = "EXECUTE" if receipt.get("outcome") != "EXECUTE" else "REFUSE"
    return forged


def run_proof_suite(release_root: Path = RELEASE_ROOT) -> dict[str, Any]:
    contract = load_json(release_root / "contracts" / "case_contract_authoritative_v5.json")
    contract_identity = load_json(release_root / "contracts" / "contract_identity.json")

    report_cases: list[dict[str, Any]] = []
    pass_count = 0
    lineage = {"prev_receipt_hash": "GENESIS", "lineage_index": 0}
    previous_receipt: dict[str, Any] | None = None

    for name, relative_path in PROOF_FILES.items():
        seed = load_json(release_root / relative_path)
        proposal = deepcopy(seed.get("proposal") or {
            "decision_id": seed.get("decision_id"),
            "authority": seed.get("authority"),
            "consent": seed.get("consent"),
            "contextComplete": seed.get("contextComplete"),
            "ttlSeconds": seed.get("ttlSeconds"),
            "risk": seed.get("risk"),
            "state_epoch": seed.get("state_epoch"),
            "contract_sha256": seed.get("proposal_contract_sha"),
            "actionClass": seed.get("actionClass", "governed_decision"),
        })
        state = deepcopy(seed.get("state") or {
            "state_epoch": "epoch_real" if name == "precheck" else "epoch_1",
            "contract_sha256": contract_identity["contract_sha256"],
        })
        expected = seed.get("expected_outcome")
        envelope = {
            "method": "POST",
            "boundary_attestation": f"env_{name}_attested",
            "source_channel": "proof_suite_submit",
            "session_nonce": f"nonce_{name}_proofsuite",
            "submitted_at_utc": "2026-01-01T00:00:00Z",
        }

        first = submit_proposal(proposal, state, contract, contract_identity, lineage, previous_receipt, envelope)
        receipt = first.get("receipt")
        lineage_check = verify_lineage(receipt, previous_receipt) if receipt else {"pass": False, "failure_mode": "NO_RECEIPT", "loud_break": True}
        previous_receipt = receipt
        lineage = {"prev_receipt_hash": receipt["receipt_hash"], "lineage_index": receipt["lineage_index"]} if receipt else lineage
        second = submit_proposal(proposal, state, contract, contract_identity, lineage, previous_receipt, envelope)
        replay = replay_equivalent(receipt, second["receipt"]) if receipt and second.get("receipt") else {"pass": False, "classification": "missing_receipt", "governing_conditions": {}}
        forged = forge_receipt(receipt) if receipt else {}
        forged_lineage = verify_lineage(forged, previous_receipt) if receipt else {"pass": False, "loud_break": True}
        forged_recomputed = sha256_json({k: v for k, v in forged.items() if k != "receipt_hash"}) if receipt else ""
        forged_hash_broken = receipt is not None and forged.get("receipt_hash") != forged_recomputed

        passed = (
            first["decision"]["outcome"] == expected
            and replay["pass"]
            and lineage_check["pass"]
            and forged_hash_broken
            and forged_lineage["loud_break"]
            and bool(receipt and receipt.get("commit_attestation"))
            and receipt.get("rule_coverage", {}).get("complete") is True
        )
        if passed:
            pass_count += 1

        report_cases.append({
            "case": name,
            "expected": expected,
            "actual": first["decision"]["outcome"],
            "reason": first["decision"].get("reason"),
            "selected_rule": receipt.get("selected_rule") if receipt else None,
            "boundary": first["decision"].get("commit_boundary"),
            "replay_pass": replay["pass"],
            "replay_classification": replay["classification"],
            "replay_governing_conditions": replay["governing_conditions"],
            "lineage_pass": lineage_check["pass"],
            "lineage_failure_mode": lineage_check["failure_mode"],
            "forged_receipt_detectable": forged_hash_broken,
            "forged_lineage_loud_break": forged_lineage["loud_break"],
            "commit_attestation_present": bool(receipt and receipt.get("commit_attestation")),
            "attestation_signature_present": bool(receipt and receipt.get("commit_attestation", {}).get("attestation_signature")),
            "rule_coverage_complete": bool(receipt and receipt.get("rule_coverage", {}).get("complete") is True),
            "pass": passed,
        })

    return {
        "package": "C.A.S.E. v22 Rerun Clean Release",
        "runtime_identity": contract_identity["runtime_identity"],
        "contract_version": contract["contract_version"],
        "replay_standard": contract["proof_commitments"]["replay_standard"],
        "summary": f"{pass_count}/{len(report_cases)} proof cases passed",
        "cases": report_cases,
    }
