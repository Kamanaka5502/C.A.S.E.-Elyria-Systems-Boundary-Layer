# C.A.S.E. Elyria Systems Boundary Layer

**C.A.S.E. v22 Rerun Clean Release** is a local artifact proof surface for governed execution admission.

This repository packages the C.A.S.E. layer as a reviewable boundary system:

`proposal -> boundary service envelope check -> authoritative contract load check -> runtime_commit_gate -> commit attestation -> runtime receipt -> replay -> lineage verification`

## What this repo proves

This package proves the local artifact line represented here:

- effect-bearing proposals must enter through a boundary service envelope
- admissibility is resolved at `runtime_commit_gate`
- standing is re-bound at commit and is not inherited
- commit attestation binds governing basis, authority scope, evidence lineage, current state, runtime identity, and contract identity
- runtime receipts emit from execution
- replay compares governing conditions explicitly
- lineage verification breaks loudly on tamper

## What this repo does not prove

This repository does **not** claim:

- production deployment hardening
- third-party certification
- universal governance proof
- deployed network no-bypass enforcement
- proof of any original artifact outside this release package

The claim is narrower and stronger: **local artifact truth for this C.A.S.E. v22 release package.**

## Repository layout

```text
release/case_v22_rerun_clean_release/
  contracts/       authoritative contract identity and deployment profile
  runtime/         boundary service, commit gate, receipt, replay, lineage, proof suite
  ui/              local reviewer interface
  proof/           proof cases and generated proof-suite reports
  gates/           gate output snapshots
  docs/            release documentation and claim-scope material
scripts/
  run-proof-suite.mjs
  verify-release-hashes.mjs
  serve.mjs
.github/workflows/
  verify.yml
```

The release package is preserved under `release/case_v22_rerun_clean_release/` so the included release manifest and release-hash file remain directly verifiable.

## Run locally

```bash
npm run start
```

Then open:

```text
http://localhost:8080/ui/
```

## Verify the release

```bash
npm run verify
```

This runs:

```bash
npm run verify:hashes
npm run proof
```

`verify:hashes` validates `RELEASE_HASHES.json` against the preserved release files.  
`proof` executes the C.A.S.E. proof suite from the runtime modules.

## Recommended GitHub posture

Start this repository as **private**.

Public exposure should be limited to the proof surface only. Do not publish deeper proprietary runtime lineage, customer materials, private engagement material, or implementation claims that exceed the local artifact boundary.

## Suggested repository metadata

**Name:** `C.A.S.E.-Elyria-Systems-Boundary-Layer`

**Description:**  
Local artifact proof surface for C.A.S.E. boundary enforcement, commit-time admissibility, attestation, receipt, replay, and lineage verification.

**Topics:**  
`ai-governance`, `runtime-governance`, `admissibility`, `commit-gate`, `replay`, `receipts`, `lineage`, `deterministic-systems`, `ai-safety`, `compliance`
