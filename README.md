# ✨ C.A.S.E. Elyria Systems Boundary Layer

**C.A.S.E.–Elyria Systems Boundary Layer** is a buyer-reviewable local proof package for commit-time admissibility in governed AI execution. It demonstrates how an effect-bearing proposal enters a boundary envelope, loads an authoritative contract, resolves admissibility at runtime commit, emits attestation and receipt, supports replay, and breaks lineage verification on tamper.

This repo is **not production-certified**, **not third-party certified**, and **not a deployed no-bypass system**. It is a bounded proof surface for buyer review and pilot scoping.

<p align="center">
  <img src="docs/assets/case-hero.svg" alt="C.A.S.E. Elyria Systems Boundary Layer" width="100%" />
</p>

<p align="center"><em>Approval is not enough. Standing must be re-bound at commit.</em></p>

<p align="center">
  <img alt="Boundary" src="https://img.shields.io/badge/Boundary-runtime__commit__gate-0F1D33?style=for-the-badge&labelColor=C9A15B" />
  <img alt="Contract" src="https://img.shields.io/badge/Contract-9.0.0-0F1D33?style=for-the-badge&labelColor=7E9487" />
  <img alt="Runtime" src="https://img.shields.io/badge/Runtime-CASE__v22__rerun__clean__runtime-0F1D33?style=for-the-badge&labelColor=C9A15B" />
</p>

<p align="center">
  <img alt="Proof Suite" src="https://img.shields.io/badge/Proof%20Suite-11%2F11%20PASS-0F1D33?style=for-the-badge&labelColor=7E9487" />
  <img alt="Admissibility" src="https://img.shields.io/badge/Admissibility-Commit--time-0F1D33?style=for-the-badge&labelColor=C9A15B" />
  <img alt="Integrity" src="https://img.shields.io/badge/Integrity-Receipt%20%E2%80%A2%20Replay%20%E2%80%A2%20Lineage-0F1D33?style=for-the-badge&labelColor=7E9487" />
</p>

> **🧭 Governing principle:** Not everything that can move is allowed to bind.

---

## Buyer review path

Start here:

- [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md)
- [`BUYER_REVIEW_GUIDE.md`](BUYER_REVIEW_GUIDE.md)
- [`CLAIMS_BOUNDARY.md`](CLAIMS_BOUNDARY.md)
- [`PILOT_LANE.md`](PILOT_LANE.md)
- [`COMMERCIAL_BOUNDARY.md`](COMMERCIAL_BOUNDARY.md)
- [`SECURITY_POSTURE.md`](SECURITY_POSTURE.md)
- [`PROOF_SURFACE.md`](PROOF_SURFACE.md)
- [`PROOF_RESULTS.md`](PROOF_RESULTS.md)
- [`docs/BUYER_DEMO_SCRIPT.md`](docs/BUYER_DEMO_SCRIPT.md)
- [`docs/CASE_ELYRIA_MAPPING.md`](docs/CASE_ELYRIA_MAPPING.md)
- [`docs/BUYER_FAQ.md`](docs/BUYER_FAQ.md)

---

## What this is

**C.A.S.E. v22 Rerun Clean Release** is a local artifact proof surface for governed execution admission.

It packages the C.A.S.E. layer as a reviewable boundary system:

**📄 Proposal → 🛡️ Boundary Envelope → 📋 Contract Check → ✨ Runtime Commit Gate → 🏅 Attestation → 🧾 Receipt → 🔁 Replay → 🌿 Lineage Verification**

---

## What this repository proves

This package proves the local artifact line represented here:

- effect-bearing proposals must enter through a boundary service envelope
- admissibility is resolved at `runtime_commit_gate`
- standing is re-bound at commit and is not inherited
- commit attestation binds governing basis, authority scope, evidence lineage, current state, runtime identity, and contract identity
- runtime receipts emit from execution
- replay compares governing conditions explicitly
- lineage verification breaks loudly on tamper

---

## Scope Boundary

C.A.S.E. v22 is a bounded proof surface for buyer review.

It demonstrates how proposed movement is checked at commit, how standing is re-bound before effect, and how attestation, receipt, replay, and lineage make the result reviewable.

The claim is narrow by design:

**local artifact truth for this C.A.S.E. v22 release package.**

---

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

---

## Run locally

```bash
npm run start
```

Then open:

```text
http://localhost:8080/ui/
```

---

## Verify the release

```bash
npm run verify
```

This runs:

```bash
npm run verify:hashes
npm run proof
```

- `verify:hashes` validates `RELEASE_HASHES.json` against the preserved release files.
- `proof` executes the C.A.S.E. proof suite from the runtime modules.

---

## Commercial boundary

This repository is a review surface, not a commercial deployment license. Commercial pilots require written scope. Customer data cannot be used without agreement. Production deployment requires a separate security and architecture review.

---

## Suggested repository metadata

**Name:** `C.A.S.E.-Elyria-Systems-Boundary-Layer`

**Description:**  
Buyer-reviewable local proof package for C.A.S.E.–Elyria commit-time admissibility, attestation, receipt, replay, and lineage verification.

**Topics:**  
`ai-governance`, `runtime-governance`, `admissibility`, `commit-gate`, `replay`, `receipts`, `lineage`, `deterministic-systems`, `ai-safety`, `compliance`
