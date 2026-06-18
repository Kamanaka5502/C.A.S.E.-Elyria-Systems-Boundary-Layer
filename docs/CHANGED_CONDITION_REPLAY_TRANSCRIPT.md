# Changed-Condition Replay Transcript

## Rule

Prior admissibility does not automatically travel into changed conditions.

## Changed Conditions Required

The proof suite must include examples where:

- authority scope changes
- evidence lineage changes
- current state changes
- runtime identity changes
- contract identity changes
- release artifact hash changes

## Required Result

The replay must not silently preserve the original result.

Changed conditions must produce:

- refusal,
- no-bind,
- escalation,
- halt,
- or verification failure.

## Invariant

No protected consequence binds under changed governing conditions without a valid boundary result.
