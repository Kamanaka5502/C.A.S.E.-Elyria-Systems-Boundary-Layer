from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .io import RELEASE_ROOT, load_json, sha256_file


@dataclass(frozen=True)
class HashFailure:
    path: str
    expected: str
    actual: str


def verify_release_hashes(release_root: Path = RELEASE_ROOT) -> tuple[bool, list[HashFailure], dict]:
    manifest_path = release_root / "RELEASE_HASHES.json"
    manifest = load_json(manifest_path)
    failures: list[HashFailure] = []

    for relative_path, expected in sorted((manifest.get("hashes") or {}).items()):
        artifact_path = release_root / relative_path
        if not artifact_path.exists():
            failures.append(HashFailure(relative_path, str(expected), "MISSING"))
            continue
        actual = sha256_file(artifact_path)
        if actual != expected:
            failures.append(HashFailure(relative_path, str(expected), actual))

    return len(failures) == 0, failures, manifest
