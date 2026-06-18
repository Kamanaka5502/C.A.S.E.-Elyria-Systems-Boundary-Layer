# Proof Surface

This document explains the reviewable proof artifacts in the C.A.S.E.–Elyria Systems Boundary Layer.

## 1. Boundary service envelope

**Purpose:** Ensure effect-bearing proposals enter through a governed boundary instead of bypassing review.

**Input:** Proposal fields, authority signal, consent/context state, TTL, risk, proposal state epoch, and contract hash.

**Output:** Boundary-wrapped proposal or refusal path.

**Failure mode:** Missing, malformed, revoked, stale, or out-of-bounds inputs fail before binding.

**Buyer interpretation:** The system is not treating arbitrary movement as admissible. It requires a boundary envelope first.

## 2. Authoritative contract load check

**Purpose:** Load and verify the governing contract identity before commit-time decisioning.

**Input:** Contract identity, live contract hash, expected contract hash, deployment profile.

**Output:** Contract-verified state or contract failure.

**Failure mode:** Contract mismatch or tamper prevents clean admission.

**Buyer interpretation:** Approval does not float free from governing basis. The contract must still match.

## 3. Runtime commit gate

**Purpose:** Resolve whether proposed movement may bind at commit.

**Input:** Boundary envelope, contract state, standing conditions, authority, context, TTL, risk, and state epoch.

**Output:** `EXECUTE`, `REFUSE`, `ESCALATE`, or `HALT`.

**Failure mode:** Invalid standing, missing context, revoked consent, stale TTL, contract tamper, or excessive risk blocks execution.

**Buyer interpretation:** The key proof point is commit-time admissibility, not prior approval.

## 4. Commit attestation

**Purpose:** Emit a first-class proof artifact showing that the commit decision re-bound governing basis and standing.

**Input:** Commit decision, contract identity, runtime identity, authority scope, evidence lineage, current state.

**Output:** Commit attestation object.

**Failure mode:** Missing or incoherent attestation weakens the proof corridor and should fail review.

**Buyer interpretation:** The buyer can see why a movement was admitted or blocked at the moment of commit.

## 5. Runtime receipt

**Purpose:** Preserve an execution-result artifact after an admitted movement.

**Input:** Commit decision and execution result.

**Output:** Runtime receipt.

**Failure mode:** Receipt mismatch, forged receipt, or missing receipt should break replay or verification.

**Buyer interpretation:** Receipts create an audit surface after movement occurs.

## 6. Replay

**Purpose:** Recompare governing conditions against the preserved proof path.

**Input:** Scenario state, receipt, contract identity, and governing conditions.

**Output:** Replay pass or failure.

**Failure mode:** Changed condition, mismatched receipt, or unsupported replay path fails.

**Buyer interpretation:** Replay is the buyer's check that the corridor can be re-examined rather than merely asserted.

## 7. Lineage verification

**Purpose:** Detect tamper or continuity break across the proof path.

**Input:** Receipt, lineage fields, hashes, and verification state.

**Output:** Lineage pass or tamper-visible failure.

**Failure mode:** Altered artifact, broken chain, or forged material fails verification.

**Buyer interpretation:** Lineage does not create admissibility. It proves whether preserved evidence still holds after decision.

## 8. Hash verification

**Purpose:** Bind the release package to a reviewable file set.

**Input:** `RELEASE_HASHES.json` and preserved release files.

**Output:** Hash verification pass or failure.

**Failure mode:** Missing or changed files fail hash verification.

**Buyer interpretation:** The buyer can tell whether the reviewed package is the same preserved release artifact.
