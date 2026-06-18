# Boundary Model

C.A.S.E. v22 treats commit as a re-binding event, not just a decision point.

At `runtime_commit_gate`, the runtime binds:
- governing basis
- authority scope
- evidence lineage
- current state

Only after that re-binding does the runtime select `EXECUTE`, `REFUSE`, `ESCALATE`, or `HALT`.

Anything earlier may reduce candidate volume, but it cannot grant durable standing.

## Separation discipline
- **Decision-boundary enforcement** = admissibility resolved at commit and bounded outcome lawfully determined
- **Receipt/lineage verification** = post-decision integrity layer that proves continuity, traceability, replay classification, and tamper visibility

Verification does not own decision authority. It proves what the boundary already decided.
