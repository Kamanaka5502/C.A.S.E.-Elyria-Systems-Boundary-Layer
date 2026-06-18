# Meeting Brief

Run the locked path exactly once, then replay it.

## Phase 1 — decision-boundary enforcement
1. submit proposal
2. show commit-time re-binding
3. show runtime decision at `runtime_commit_gate`
4. show emitted commit attestation
5. show emitted receipt from execution

## Phase 2 — replay and verification
6. replay under unchanged governing conditions -> PASS
7. shift one governing condition -> replay FAIL with explicit classification
8. show lineage verification
9. show tamper break loudly

The point is not narration. The point is that the system proves itself through:

`run -> commit -> attestation -> receipt -> replay -> lineage`
