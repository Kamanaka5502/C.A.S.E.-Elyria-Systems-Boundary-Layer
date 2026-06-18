# Reviewer Protocol

## Purpose

This document defines how to evaluate the C.A.S.E. Elyria Systems Boundary Layer without overstating what the artifact proves.

C.A.S.E. is a boundary-enforcement layer for governed execution. It evaluates proposed motion at commit time and preserves proof artifacts for review.

## Review sequence

Use this sequence:

```text
proposal
  -> boundary envelope
  -> contract check
  -> runtime_commit_gate
  -> attestation
  -> receipt
  -> replay
  -> lineage verification
```

## Required checks

A complete review should check:

1. The release manifest exists and is internally coherent.
2. `RELEASE_HASHES.json` validates the preserved release files.
3. The proof suite executes without mutation of the governing claim scope.
4. Valid standing produces an execution outcome.
5. Invalid standing produces refusal, escalation, or halt without silent success.
6. Contract tamper breaks the admissibility path.
7. Stale TTL breaks the admissibility path.
8. Replay compares governing conditions explicitly.
9. Lineage/tamper checks are post-decision integrity checks, not substitutes for commit-time admission.
10. Public claims remain limited to local artifact truth.

## Admissible claim

The admissible public claim is:

```text
C.A.S.E. v22 demonstrates a local artifact proof surface for commit-time admissibility, refusal enforcement, attestation, receipt, replay, and lineage verification.
```

## Non-admissible claim

Do not claim:

```text
This repository proves production deployment security, universal compliance, third-party certification, or a live no-bypass network boundary.
```

## Review result format

Use this form:

```text
Result: PASS / FAIL / PARTIAL
Scope reviewed: local artifact / proof suite / UI / docs / manifest
Evidence: command output, hash result, proof-suite result, observed scenario behavior
Boundary note: what the artifact proves and what it does not prove
```

## Final rule

No motion binds without admissibility at the boundary. No proof claim stands beyond the evidence preserved in the artifact.
