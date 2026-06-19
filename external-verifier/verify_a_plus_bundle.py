#!/usr/bin/env python3
"""External verifier for the Python-first C.A.S.E. boundary proof surface."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "README.md",
    "CLAIM_BOUNDARY.md",
    "LAYER_ARCHITECTURE.md",
    "package.json",
    "case_boundary_layer/cli.py",
    "case_boundary_layer/engine.py",
    "case_boundary_layer/service.py",
    "case_boundary_layer/proof.py",
    "case_boundary_layer/hash_verifier.py",
    "release/case_v22_rerun_clean_release/RELEASE_HASHES.json",
    "release/case_v22_rerun_clean_release/contracts/case_contract_authoritative_v5.json",
    "release/case_v22_rerun_clean_release/contracts/contract_identity.json",
    "release/case_v22_rerun_clean_release/proof/execute_case.json",
    "release/case_v22_rerun_clean_release/proof/refuse_case.json",
    "release/case_v22_rerun_clean_release/proof/replay_case.json",
    "release/case_v22_rerun_clean_release/proof/tamper_case.json",
    "release/case_v22_rerun_clean_release/proof/forged_receipt_case.json",
    "release/case_v22_rerun_clean_release/proof/precheck_valid_commit_invalid_case.json",
    "docs/NO_BIND_PROOF_TRANSCRIPT.md",
    "docs/ROUTE_CLOSURE_PROOF.md",
    "docs/CHANGED_CONDITION_REPLAY_TRANSCRIPT.md",
    "docs/TAMPER_TEST.md",
    "docs/BENCHMARK_SCORECARD.md",
    "docs/BUYER_REVIEWER_READOUT.md",
    "docs/FRESH_CLONE_REVIEW_TEST.md",
]


def run_command(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)


def main() -> int:
    print("C.A.S.E. PYTHON-FIRST EXTERNAL VERIFICATION")
    failures: list[str] = []

    missing = [path for path in REQUIRED_FILES if not (ROOT / path).exists()]
    if missing:
        failures.extend(f"missing required file: {path}" for path in missing)
    else:
        print("[PASS] required Python boundary-layer and buyer-review files present")

    claim_boundary = (ROOT / "CLAIM_BOUNDARY.md").read_text(encoding="utf-8") if (ROOT / "CLAIM_BOUNDARY.md").exists() else ""
    invariant_ok = all(part in claim_boundary for part in [
        "Proposed movement enters",
        "Boundary resolves",
        "No protected consequence binds without the boundary result",
    ])
    if invariant_ok:
        print("[PASS] claim boundary invariant present")
    else:
        failures.append("claim boundary invariant missing")

    readme = (ROOT / "README.md").read_text(encoding="utf-8") if (ROOT / "README.md").exists() else ""
    readme_ok = (
        "proposed effect-bearing movement" in readme
        and "The repo does not merely show a runtime gate" in readme
        and "RESULT: C.A.S.E. BOUNDARY PASS" in readme
    )
    if readme_ok:
        print("[PASS] README category framing present")
    else:
        failures.append("README category framing incomplete")

    primary = run_command([sys.executable, "-m", "case_boundary_layer.cli", "verify"])
    print(primary.stdout.rstrip())
    if primary.returncode == 0 and "RESULT: C.A.S.E. BOUNDARY PASS" in primary.stdout:
        print("[PASS] Python primary boundary verifier emitted boundary pass")
    else:
        failures.append("Python primary boundary verifier failed")

    try:
        report = json.loads((ROOT / "artifacts" / "proof_suite_report_current.json").read_text(encoding="utf-8"))
        cases = {case.get("case"): case for case in report.get("cases", [])}
        required_cases = {"refuse", "replay", "tamper", "forged_receipt", "precheck"}
        missing_cases = sorted(required_cases - set(cases))
        failed_cases = [name for name, case in cases.items() if not case.get("pass")]
        if not missing_cases and not failed_cases:
            print("[PASS] no-bind, replay, tamper, forged-receipt, and precheck cases present and passing")
        else:
            failures.append(f"proof cases incomplete: missing={missing_cases}, failed={failed_cases}")
    except Exception as exc:
        failures.append(f"proof report unreadable: {exc}")

    if failures:
        print(json.dumps({"status": "FAIL", "failures": failures}, indent=2))
        print("RESULT: C.A.S.E. BOUNDARY FAIL")
        return 1

    print(json.dumps({
        "status": "PASS",
        "runtime": "python-primary",
        "invariant": "Proposed movement enters. Boundary resolves. No protected consequence binds without the boundary result.",
        "reviewer_command": "python -m case_boundary_layer.cli verify && pytest",
    }, indent=2))
    print("RESULT: C.A.S.E. BOUNDARY PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
