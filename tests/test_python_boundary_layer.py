from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from case_boundary_layer.hash_verifier import verify_release_hashes
from case_boundary_layer.proof import run_proof_suite

ROOT = Path(__file__).resolve().parents[1]


def test_python_release_hash_verifier_passes() -> None:
    ok, failures, _ = verify_release_hashes()
    assert ok, failures


def test_python_proof_suite_passes_all_cases() -> None:
    report = run_proof_suite()
    assert report["summary"] == "11/11 proof cases passed"
    assert all(case["pass"] for case in report["cases"])


def test_python_primary_cli_passes() -> None:
    result = subprocess.run(
        [sys.executable, "-m", "case_boundary_layer.cli", "verify"],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    assert result.returncode == 0, result.stdout
    assert "RESULT: C.A.S.E. BOUNDARY PASS" in result.stdout
