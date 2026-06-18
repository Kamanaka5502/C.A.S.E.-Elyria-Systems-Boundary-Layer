# INDEPENDENT VERIFIER PACK

Purpose: give a third-party reviewer a minimal path to verify the boundary claim without relying on narration.

## Verify in this order
1. Read `docs/START_HERE.md`
2. Read `docs/BOUNDARY_MODEL.md`
3. Open `ui/index.html` and run one clean EXECUTE and one REFUSE case
4. Run the proof suite from `runtime/proof_suite.js`
5. Inspect one commit attestation and one emitted receipt
6. Inspect one replay break classification and one lineage verification result

## Boundary claim under review
UI submits proposals. Runtime decides at `runtime_commit_gate`. Commit attestation and receipt emit from execution. Replay evaluates governing-condition equivalence explicitly.

## What an independent reviewer should confirm
- no effect-bearing decision originates in the UI layer
- contract identity is loaded and verified before commit
- standing is resolved at commit, not inherited
- outcome classes remain bounded to EXECUTE / REFUSE / ESCALATE / HALT
- receipt lineage verifies or fails loudly on tamper
- replay holds only when governing conditions truly match

## Minimum artifacts to inspect
- `contracts/case_contract_authoritative_v5.json`
- `contracts/contract_identity.json`
- `runtime/boundary_service.js`
- `runtime/commit_gate.js`
- `runtime/commit_attestation.js`
- `runtime/receipt.js`
- `runtime/replay.js`
- `runtime/lineage.js`
- `proof/proof_suite_report_v22.json`
