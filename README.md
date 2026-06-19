# ✨ C.A.S.E. Elyria Systems Boundary Layer

<p align="center">
  <img alt="Classification" src="https://img.shields.io/badge/Classification-A%2B%20local%20artifact%20proof%20surface-0F1D33?style=for-the-badge&labelColor=C9A15B" />
  <img alt="Stable Verify" src="https://img.shields.io/badge/Stable%20Verify-release%20hashes%20%2B%20proof%20suite-0F1D33?style=for-the-badge&labelColor=7E9487" />
  <img alt="Claim Boundary" src="https://img.shields.io/badge/Claim-Bounded%20local%20artifact%20truth-0F1D33?style=for-the-badge&labelColor=C9A15B" />
</p>

## Current Classification

**A+ local artifact proof surface.**

This classification is bounded to the claim this repository actually makes.

It is **not** production-certified, third-party certified, universal governance proof, deployed network no-bypass proof, customer-specific corridor certification, or protected kernel disclosure.

## Stable verification posture

The authoritative green path is intentionally conservative:

```bash
npm install
npm run verify
```

`npm run verify` runs the stable release-hash verification and stable proof-suite runner:

```bash
node scripts/verify-release-hashes.mjs
node scripts/run-proof-suite.mjs
```

Expected result:

```text
RESULT: C.A.S.E. BOUNDARY PASS
```

Python remains in the repo for external digest verification and layer hardening, but the unstable Python proof path is **not** the main verification gate.

Stable Python parity check:

```bash
npm run verify:python-digest
```

Experimental Python layer check:

```bash
npm run verify:python-layer
```

The experimental Python layer is not used as the green CI gate until it is fully hardened.

## Reviewer Summary

C.A.S.E. Elyria Systems Boundary Layer is a public-safe local artifact proof surface for proposed effect-bearing movement.

The repo does not merely show a runtime gate.

It shows a preserved release package where a proposed movement enters a boundary envelope, standing is re-bound, admissibility is checked, commit authority is attested, receipts are emitted, replay compares governing conditions, and lineage verification breaks on tamper.

Core invariant:

**Proposed movement enters.  
Boundary resolves.  
No protected consequence binds without the boundary result.**

<p align="center">
  <img src="docs/assets/case-hero.svg" alt="C.A.S.E. Elyria Systems Boundary Layer" width="100%" />
</p>

<p align="center"><em>Approval is not enough. Standing must be re-bound at commit.</em></p>

---

## Buyer review path

Start here:

- [`CLAIM_BOUNDARY.md`](CLAIM_BOUNDARY.md)
- [`A_PLUS_REVIEW_EVIDENCE.md`](A_PLUS_REVIEW_EVIDENCE.md)
- [`A_PLUS_CLASSIFICATION.md`](A_PLUS_CLASSIFICATION.md)
- [`LAYER_ARCHITECTURE.md`](LAYER_ARCHITECTURE.md)
- [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md)
- [`BUYER_REVIEW_GUIDE.md`](BUYER_REVIEW_GUIDE.md)
- [`PROOF_SURFACE.md`](PROOF_SURFACE.md)
- [`PROOF_RESULTS.md`](PROOF_RESULTS.md)
- [`docs/NO_BIND_PROOF_TRANSCRIPT.md`](docs/NO_BIND_PROOF_TRANSCRIPT.md)
- [`docs/ROUTE_CLOSURE_PROOF.md`](docs/ROUTE_CLOSURE_PROOF.md)
- [`docs/CHANGED_CONDITION_REPLAY_TRANSCRIPT.md`](docs/CHANGED_CONDITION_REPLAY_TRANSCRIPT.md)
- [`docs/TAMPER_TEST.md`](docs/TAMPER_TEST.md)
- [`docs/BENCHMARK_SCORECARD.md`](docs/BENCHMARK_SCORECARD.md)
- [`docs/BUYER_REVIEWER_READOUT.md`](docs/BUYER_REVIEWER_READOUT.md)
- [`docs/FRESH_CLONE_REVIEW_TEST.md`](docs/FRESH_CLONE_REVIEW_TEST.md)

---

## What this is

**C.A.S.E. v22 Rerun Clean Release** is a pre-formation consequence-boundary proof surface for proposed effect-bearing movement.

It packages the C.A.S.E. layer as a reviewable boundary system:

**📄 Proposal → 🛡️ Boundary Envelope → 📋 Contract Check → ✨ Runtime Commit Gate → 🏅 Attestation → 🧾 Receipt → 🔁 Replay → 🌿 Lineage Verification**

---

## What this repository proves

This package proves the local artifact line represented here:

- proposed effect-bearing movement must enter through a boundary service envelope
- admissibility is resolved at `runtime_commit_gate`
- standing is re-bound before protected consequence may bind and is not inherited
- commit attestation binds governing basis, authority scope, evidence lineage, current state, runtime identity, and contract identity
- failed admission produces refusal / no-bind behavior
- receipts preserve the boundary result
- same-condition replay and changed-condition replay compare governing conditions explicitly
- lineage verification breaks loudly on tamper
- release hashes verify preserved artifacts

---

## Repository layout

```text
release/                    preserved release artifacts and proof fixtures
scripts/                    stable Node proof runner and local UI harness
external-verifier/          stable Python digest verifier
case_boundary_layer/        Python layer under hardening, not the green gate
tests/                      verifier tests
docs/                       buyer-review evidence and proof transcripts
.github/workflows/          stable CI verification path
```

---

## Verify the release

```bash
npm run verify
npm run verify:python-digest
```

CI uses the stable verification path only.

Expected final passing line:

```text
RESULT: C.A.S.E. BOUNDARY PASS
```

Expected final failing line after release-artifact mutation:

```text
RESULT: C.A.S.E. BOUNDARY FAIL
```

---

## Commercial boundary

This repository is a review surface, not a commercial deployment license. Commercial pilots require written scope. Customer data cannot be used without agreement. Production deployment requires a separate security and architecture review.

---

## Suggested repository metadata

**Name:** `C.A.S.E.-Elyria-Systems-Boundary-Layer`

**Description:**  
Buyer-reviewable local proof package for C.A.S.E.–Elyria pre-formation consequence-boundary review, commit-time admissibility, attestation, receipt, replay, and lineage verification.

**Topics:**  
`ai-governance`, `admissibility`, `commit-gate`, `replay`, `receipts`, `lineage`, `deterministic-systems`, `ai-safety`, `local-artifact-proof`
