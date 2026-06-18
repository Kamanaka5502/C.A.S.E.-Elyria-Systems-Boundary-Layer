#!/usr/bin/env python3
"""External SHA-256 verifier for the preserved C.A.S.E. release package."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE_ROOT = ROOT / "release" / "case_v22_rerun_clean_release"
MANIFEST_PATH = RELEASE_ROOT / "RELEASE_HASHES.json"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    failures: list[dict[str, str]] = []

    if not MANIFEST_PATH.exists():
        print(f"[FAIL] missing manifest: {MANIFEST_PATH.relative_to(ROOT)}")
        print("RESULT: C.A.S.E. BOUNDARY FAIL")
        return 1

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    hashes = manifest.get("hashes") or {}

    if not isinstance(hashes, dict) or not hashes:
        print("[FAIL] RELEASE_HASHES.json does not contain a non-empty hashes object")
        print("RESULT: C.A.S.E. BOUNDARY FAIL")
        return 1

    for relative_path, expected in sorted(hashes.items()):
        artifact_path = RELEASE_ROOT / relative_path
        if not artifact_path.exists():
            failures.append({
                "path": relative_path,
                "expected": str(expected),
                "actual": "MISSING",
            })
            continue

        actual = sha256_file(artifact_path)
        if actual != expected:
            failures.append({
                "path": relative_path,
                "expected": str(expected),
                "actual": actual,
            })

    if failures:
        print(json.dumps({"status": "FAIL", "failures": failures}, indent=2))
        print("RESULT: C.A.S.E. BOUNDARY FAIL")
        return 1

    print(json.dumps({
        "status": "PASS",
        "checked_files": len(hashes),
        "artifact_line": manifest.get("artifact_line"),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
