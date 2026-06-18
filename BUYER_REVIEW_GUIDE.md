# Buyer Review Guide

## What this repository is

**C.A.S.E.–Elyria Systems Boundary Layer** is a buyer-reviewable local proof package for commit-time admissibility in governed AI execution.

It demonstrates how an effect-bearing proposal enters a boundary envelope, loads an authoritative contract, resolves admissibility at runtime commit, emits attestation and receipt, supports replay, and breaks lineage verification on tamper.

This is a proof surface for evaluating a bounded pilot or commercial corridor. It is not a production deployment, not third-party certified, and not a deployed no-bypass network.

## What it proves

This repository proves the local artifact behavior represented in the release package:

- proposed movement must enter through a boundary envelope
- standing is checked and re-bound at commit
- admissibility resolves at `runtime_commit_gate`
- commit attestation is emitted for admitted movement
- runtime receipt is emitted after execution
- replay compares governing conditions explicitly
- lineage verification detects tamper or continuity break
- release hashes bind the reviewable artifact package

## What it does not prove

This repository does not prove:

- production readiness
- third-party certification
- universal governance correctness
- live no-bypass network enforcement
- legal, compliance, clinical, or psychological safety certification
- authority to reuse, sell, modify, or deploy this work
- proof outside the release package
- disclosure of the full Elyria protected kernel

## Who it is for

This repository is for buyers, technical reviewers, governance teams, AI safety reviewers, compliance stakeholders, and product leaders evaluating whether a bounded pilot should be scoped.

Best-fit buyers are teams dealing with consequence-bearing AI movement where approval alone is not enough.

## Why C.A.S.E. + Elyria matters

C.A.S.E. defines human-attuned governance conditions: authority, human challenge, escalation, context, and safety boundaries.

Elyria tests whether those conditions still hold at commit before effect-bearing movement may bind.

Together, they create a buyer-reviewable seam between human governance requirements and deterministic runtime admissibility.

## Fifteen-minute buyer review

1. Read `EXECUTIVE_SUMMARY.md`.
2. Read `CLAIMS_BOUNDARY.md`.
3. Run local verification.
4. Start the local UI.
5. Execute one valid scenario.
6. Execute one refusal scenario.
7. Inspect attestation, receipt, replay, and lineage behavior.
8. Decide whether a bounded pilot lane is worth scoping.

## Commands

```bash
npm run verify
```

Expected result:

```text
RELEASE_HASHES: PASS
Proof suite: PASS
```

Start local review UI:

```bash
npm run start
```

Open:

```text
http://localhost:8080/ui/
```

## How to interpret results

### Commit attestation

The attestation shows that admissibility was resolved at commit and that governing basis, authority scope, current state, evidence lineage, runtime identity, and contract identity were bound before effect-bearing movement.

### Runtime receipt

The receipt shows the execution result after admission. It is evidence of a runtime outcome, not proof that every production deployment condition has been satisfied.

### Replay

Replay checks whether the governing conditions still compare cleanly against the preserved receipt and scenario state. Replay failure means the proof corridor no longer reproduces cleanly under the reviewed conditions.

### Lineage verification

Lineage verification checks whether the artifact chain remains intact. A lineage failure is an integrity signal, not a substitute for commit-time admissibility.

## What remains gated before production

Before any production deployment, the following remain gated:

- written commercial scope
- customer-data agreement
- authentication and RBAC
- tenant isolation
- persistent audit store
- persistent receipt store
- signing keys or KMS
- deployment hardening
- monitoring and alerting
- external security review
- production incident procedures

## Buyer conclusion

The correct buyer conclusion is:

```text
This repository is sufficient for proof-surface review and pilot scoping. It is not sufficient, by itself, for production deployment or certification claims.
```
