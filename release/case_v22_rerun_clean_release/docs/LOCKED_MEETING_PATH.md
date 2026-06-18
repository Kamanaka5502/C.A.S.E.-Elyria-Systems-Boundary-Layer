# Locked Meeting Path

Use this exact path in the meeting:

1. **Run** a clean EXECUTE proposal through the UI.
2. Show the **decision boundary** at `runtime_commit_gate`.
3. Show the emitted **commit attestation**.
4. Show the emitted **receipt** from execution.
5. Replay under the **same governing conditions** -> PASS.
6. Change **one governing condition** only (state epoch or contract identity).
7. Replay again -> FAIL with explicit classification.
8. Show **lineage verification** and a **tamper break**.

## What this proves
- runtime authority exists only at commit
- receipts come from execution, not presentation
- standing resolves at commit, not by inheritance
- replay is a governing-conditions comparison
- lineage breaks loudly on tamper

## What to keep visually separate
- **Decision-boundary enforcement**
- **Receipt / lineage verification**
