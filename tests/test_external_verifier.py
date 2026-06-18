from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def test_python_a_plus_verifier_passes() -> None:
    result = run([sys.executable, "external-verifier/verify_a_plus_bundle.py"])
    assert result.returncode == 0, result.stdout
    assert "RESULT: C.A.S.E. BOUNDARY PASS" in result.stdout


def test_python_digest_verifier_passes() -> None:
    result = run([sys.executable, "external-verifier/verify_digest_manifest.py"])
    assert result.returncode == 0, result.stdout
    assert '"status": "PASS"' in result.stdout


def test_boundary_claim_file_contains_core_invariant() -> None:
    claim = (ROOT / "CLAIM_BOUNDARY.md").read_text(encoding="utf-8")
    assert "Proposed movement enters" in claim
    assert "Boundary resolves" in claim
    assert "No protected consequence binds without the boundary result" in claim
