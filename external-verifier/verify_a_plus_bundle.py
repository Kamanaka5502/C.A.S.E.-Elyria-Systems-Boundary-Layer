#!/usr/bin/env python3
"""External verifier for the C.A.S.E. boundary proof surface."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "README.md",
    "CLAIM_BOUNDARY.md",
    "package.json",
    "scripts/verify-release-hashes.mjs",
    "scripts/run-proof-suite.mjs",
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


def pass_line(message: str) -> None:
    print(f"[PASS] {message}")


def fail_line(message: str) -> None:
    print(f"[FAIL] {message}")


def read_text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def load_json(path: str) -> dict:
    return json.loads(read_text(path))


def run_command(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def main() -> int:
    print("C.A.S.E. BOUNDARY EXTERNAL VERIFICATION")
    print()
    failures: list[str] = []

    missing = [path for path in REQUIRED_FILES if not (ROOT / path).exists()]
    if missing:
        failures.extend(f"missing required file: {path}" for path in missing)
        fail_line("required buyer-review files present")
        for path in missing:
            fail_line(f"missing required file: {path}")
    else:
        pass_line("required buyer-review files present")

    try:
        claim_boundary = read_text("CLAIM_BOUNDARY.md")
        invariant_ok = (
            "Proposed movement enters" in claim_boundary
            and "Boundary resolves" in claim_boundary
            and "No protected consequence binds without the boundary result" in claim_boundary
        )
        if invariant_ok:
            pass_line("claim boundary invariant present")
        else:
            failures.append("claim boundary invariant missing")
            fail_line("claim boundary invariant present")
    except Exception as exc:
        failures.append(f"claim boundary unreadable: {exc}")
        fail_line("claim boundary readable")

    try:
        readme = read_text("README.md")
        readme_ok = (
            "proposed effect-bearing movement" in readme
            and "The repo does not merely show a runtime gate" in readme
            and "RESULT: C.A.S.E. BOUNDARY PASS" in readme
        )
        if readme_ok:
            pass_line("README category framing present")
        else:
            failures.append("README category framing incomplete")
            fail_line("README category framing present")
    except Exception as exc:
        failures.append(f"README unreadable: {exc}")
        fail_line("README readable")

    digest = run_command([sys.executable, "external-verifier/verify_digest_manifest.py"])
    print(digest.stdout.rstrip())
    if digest.returncode == 0:
        pass_line("Python digest manifest verification passed")
    else:
        failures.append("Python digest manifest verification failed")
        fail_line("Python digest manifest verification passed")

    proof = run_command(["node", "scripts/run-proof-suite.mjs"])
    print(proof.stdout.rstrip())
    if proof.returncode == 0 and "RESULT: C.A.S.E. BOUNDARY PASS" in proof.stdout:
        pass_line("Node proof suite emitted boundary pass")
    else:
        failures.append("Node proof suite did not emit boundary pass")
        fail_line("Node proof suite emitted boundary pass")

    try:
        report = load_json("artifacts/proof_suite_report_current.json")
        cases = {case.get("name"): case for case in report.get("cases", [])}
        required_cases = ["refuse", "replay", "tamper", "forged_receipt", "precheck"]
        missing_cases = [case for case in required_cases if case not in cases]
        failed_cases = [name for name, case in cases.items() if not case.get("pass")]
        if not missing_cases and not failed_cases:
            pass_line("no-bind, replay, tamper, forged-receipt, and precheck cases present and passing")
        else:
            failures.append(f"proof cases incomplete: missing={missing_cases}, failed={failed_cases}")
            fail_line("no-bind, replay, tamper, forged-receipt, and precheck cases present and passing")
    except Exception as exc:
        failures.append(f"proof report unreadable: {exc}")
        fail_line("proof report readable")

    print()
    if failures:
        print(json.dumps({"status": "FAIL", "failures": failures}, indent=2))
        print("RESULT: C.A.S.E. BOUNDARY FAIL")
        return 1

    print(json.dumps({
        "status": "PASS",
        "invariant": "Proposed movement enters. Boundary resolves. No protected consequence binds without the boundary result.",
        "reviewer_command": "python external-verifier/verify_a_plus_bundle.py && pytest",
    }, indent=2))
    print("RESULT: C.A.S.E. BOUNDARY PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
