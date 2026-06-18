# Start Here

1. Open `ui/index.html` through a local web server.
2. Run one governed proposal.
3. Inspect the boundary envelope facts.
4. Inspect the authoritative contract load + identity verification.
5. Inspect the commit attestation.
6. Inspect the emitted receipt.
7. Run replay.
8. Verify lineage.
9. Open the proof suite report.

## Canonical reviewer flow
`run -> commit -> attestation -> receipt -> replay -> lineage`

## What to pressure-test
- Every effect-bearing decision is gated at `runtime_commit_gate`.
- The UI submits but does not decide.
- Commit attestation binds proposal, contract, runtime, state epoch, and lineage.
- Replay explains whether governing conditions held or broke.
- Lineage verification fails loudly on tamper.
