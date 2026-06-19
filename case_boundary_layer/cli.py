from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

from .hash_verifier import verify_release_hashes
from .io import RELEASE_ROOT, ROOT
from .proof import run_proof_suite

REQUIRED_BOUNDARY_FILES = [
    "CLAIM_BOUNDARY.md",
    "A_PLUS_REVIEW_EVIDENCE.md",
    "docs/NO_BIND_PROOF_TRANSCRIPT.md",
    "docs/ROUTE_CLOSURE_PROOF.md",
    "docs/CHANGED_CONDITION_REPLAY_TRANSCRIPT.md",
    "docs/TAMPER_TEST.md",
    "docs/BENCHMARK_SCORECARD.md",
    "docs/BUYER_REVIEWER_READOUT.md",
    "docs/FRESH_CLONE_REVIEW_TEST.md",
]


def verify_command() -> int:
    failures: list[dict] = []

    hashes_ok, hash_failures, manifest = verify_release_hashes(RELEASE_ROOT)
    if not hashes_ok:
        failures.append({"check": "release_hashes", "failures": [f.__dict__ for f in hash_failures]})

    missing = [path for path in REQUIRED_BOUNDARY_FILES if not (ROOT / path).exists()]
    if missing:
        failures.append({"check": "required_boundary_files", "missing": missing})

    claim_boundary = (ROOT / "CLAIM_BOUNDARY.md").read_text(encoding="utf-8") if (ROOT / "CLAIM_BOUNDARY.md").exists() else ""
    invariant_present = all(part in claim_boundary for part in [
        "Proposed movement enters",
        "Boundary resolves",
        "No protected consequence binds without the boundary result",
    ])
    if not invariant_present:
        failures.append({"check": "core_invariant", "path": "CLAIM_BOUNDARY.md"})

    report = run_proof_suite(RELEASE_ROOT)
    artifacts = ROOT / "artifacts"
    artifacts.mkdir(exist_ok=True)
    (artifacts / "proof_suite_report_current.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    proof_failures = [case for case in report["cases"] if not case.get("pass") or case.get("expected") != case.get("actual")]
    if proof_failures:
        failures.append({"check": "python_proof_suite", "failures": proof_failures})

    required_cases = {"refuse", "replay", "tamper", "forged_receipt", "precheck"}
    present_cases = {case.get("case") for case in report["cases"]}
    missing_cases = sorted(required_cases - present_cases)
    if missing_cases:
        failures.append({"check": "required_proof_cases", "missing": missing_cases})

    if failures:
        print(json.dumps({
            "status": "FAIL",
            "runtime": "python-primary",
            "hash_manifest": manifest.get("artifact_line"),
            "proof_summary": report.get("summary"),
            "failures": failures,
        }, indent=2))
        print("RESULT: C.A.S.E. BOUNDARY FAIL")
        return 1

    print(json.dumps({
        "status": "PASS",
        "runtime": "python-primary",
        "hashes_checked": len(manifest.get("hashes") or {}),
        "proof_summary": report["summary"],
        "runtime_identity": report["runtime_identity"],
        "contract_version": report["contract_version"],
        "report_path": "artifacts/proof_suite_report_current.json",
        "invariant": "Proposed movement enters. Boundary resolves. No protected consequence binds without the boundary result.",
    }, indent=2))
    print("RESULT: C.A.S.E. BOUNDARY PASS")
    return 0


def tamper_test_command() -> int:
    target = RELEASE_ROOT / "contracts" / "deployment_profile.json"
    backup = target.with_suffix(target.suffix + ".tamper-test-backup")
    shutil.copyfile(target, backup)
    try:
        with target.open("a", encoding="utf-8") as f:
            f.write("\n")
        tampered = subprocess.run([sys.executable, "-m", "case_boundary_layer.cli", "verify"], cwd=ROOT, text=True, capture_output=True)
        print(tampered.stdout, end="")
        print(tampered.stderr, end="", file=sys.stderr)
        if tampered.returncode == 0 or "RESULT: C.A.S.E. BOUNDARY FAIL" not in (tampered.stdout + tampered.stderr):
            print("Tamper test failed: verifier did not fail closed after release artifact mutation.", file=sys.stderr)
            return 1
    finally:
        shutil.copyfile(backup, target)
        backup.unlink(missing_ok=True)

    restored = subprocess.run([sys.executable, "-m", "case_boundary_layer.cli", "verify"], cwd=ROOT, text=True, capture_output=True)
    print(restored.stdout, end="")
    print(restored.stderr, end="", file=sys.stderr)
    if restored.returncode != 0 or "RESULT: C.A.S.E. BOUNDARY PASS" not in (restored.stdout + restored.stderr):
        print("Tamper test failed: verifier did not pass after restore.", file=sys.stderr)
        return 1

    print("RESULT: C.A.S.E. TAMPER TEST PASS")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="C.A.S.E. Python boundary-layer verifier")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("verify", help="run Python-first boundary verification")
    sub.add_parser("tamper-test", help="mutate a preserved release artifact and require fail-closed verification")
    args = parser.parse_args(argv)
    if args.command == "verify":
        return verify_command()
    if args.command == "tamper-test":
        return tamper_test_command()
    raise AssertionError(args.command)


if __name__ == "__main__":
    raise SystemExit(main())
