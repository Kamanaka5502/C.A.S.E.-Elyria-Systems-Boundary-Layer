# C.A.S.E. / Elyria Mapping

## Bridge line

```text
C.A.S.E. defines the human-attuned governance conditions. Elyria tests whether those conditions still hold at commit before effect-bearing movement may bind.
```

## C.A.S.E. side

C.A.S.E. defines the human and governance conditions that must remain valid before movement can bind.

C.A.S.E. concerns include:

- psychological safety
- human challenge
- escalation
- authority boundaries
- context packet
- governance stress test
- human oversight
- consent and challenge status
- buyer-facing review language
- pilot use-case framing

## Elyria side

Elyria tests and enforces whether the conditions still hold at commit.

Elyria concerns include:

- admissibility
- standing
- bind / no-bind
- commit gate
- receipt
- replay
- lineage
- consequence-boundary proof
- contract identity
- runtime identity
- tamper-visible proof corridor

## Mapping table

| C.A.S.E. condition | Elyria runtime test |
|---|---|
| Authority boundary | Is authority still valid at commit? |
| Human challenge | Has challenge reopened review or revoked consent? |
| Context packet | Is required context complete? |
| Governance stress test | Does risk require escalation or halt? |
| Human oversight | Is the movement allowed to bind now? |
| Psychological safety condition | Is the movement within the admitted boundary? |
| Escalation | Does the outcome need `ESCALATE` instead of `EXECUTE`? |
| Refusal | Does the outcome need `REFUSE`? |
| Halt | Does the outcome need `HALT`? |

## Buyer interpretation

C.A.S.E. is the governance language a buyer can reason about.

Elyria is the runtime proof discipline that checks whether the governed movement may bind.

The repository shows the seam. It does not disclose the full protected Elyria kernel.
