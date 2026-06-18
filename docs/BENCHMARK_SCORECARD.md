# C.A.S.E. Boundary Benchmark Scorecard

The scorecard is evaluated by the reviewer command:

```bash
npm run verify
```

A PASS status means the file or behavior is included in the local artifact proof surface and is checked directly by the verifier command, release-hash verification, or proof-suite path.

| Category | Required Evidence | Status |
|---|---|---|
| Claim boundary | `CLAIM_BOUNDARY.md` | PASS |
| Reviewer command | `npm run verify` | PASS |
| Release hash verification | `RELEASE_HASHES.json` check | PASS |
| Boundary envelope required | proof suite | PASS |
| Authoritative contract load | proof suite | PASS |
| Standing re-bound | proof suite | PASS |
| Authority scope checked | proof suite | PASS |
| Evidence lineage checked | proof suite | PASS |
| Current state checked | proof suite | PASS |
| Runtime identity checked | proof suite | PASS |
| Contract identity checked | proof suite | PASS |
| Refusal / no-bind behavior | `NO_BIND_PROOF_TRANSCRIPT.md` | PASS |
| Same-condition replay | proof suite | PASS |
| Changed-condition replay | `CHANGED_CONDITION_REPLAY_TRANSCRIPT.md` | PASS |
| Tamper failure | `TAMPER_TEST.md` and release-hash verification | PASS |
| Route closure | `ROUTE_CLOSURE_PROOF.md` | PASS |
| Claim limits | `README.md` + `CLAIM_BOUNDARY.md` | PASS |

## Acceptance line

```text
RESULT: C.A.S.E. BOUNDARY PASS
```

## Boundary

This scorecard does not certify production deployment, third-party review, legal compliance, or deployed network no-bypass enforcement.
