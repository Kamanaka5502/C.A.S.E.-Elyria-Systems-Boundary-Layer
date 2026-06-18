# C.A.S.E. v22 — Rerun Clean Release

C.A.S.E. v22 is the canonical rerun-clean release of the local trust-grade artifact.

It keeps the governing shape:

`proposal -> boundary service envelope check -> authoritative contract load check -> runtime_commit_gate -> signed commit attestation -> runtime receipt -> replay -> lineage verification`

## What this release tightens

- canonical release identity across manifest, docs, proof report, and runtime identity
- reviewer flow locked to `run -> commit -> attestation -> receipt -> replay -> lineage`
- decision-boundary enforcement and receipt/lineage verification kept as distinct phases
- finish-grade release discipline: start-here, final checklist, release notes, and consistent claim scope
- proof report and release manifest aligned to this version
- local artifact truth preserved without overstating production claims

## Open

Serve the package root locally and open `ui/`.

```bash
python3 -m http.server 8080
```

Then browse to:

```text
http://localhost:8080/ui/
```

From the repository root, the preferred command is:

```bash
npm run start
```

## Claim scope

This is a finish-grade local artifact release. It proves the boundary shape, attestation path, receipt emission, replay logic, and lineage verification in the artifact represented here. It does **not** claim production deployment truth.

## Boundary/verification separation

Decision-boundary enforcement is where admissibility is resolved at `runtime_commit_gate` and the bounded outcome is lawfully selected.

Receipt/lineage verification is a separate post-decision integrity phase that proves continuity, traceability, and tamper visibility without altering decision authority.
