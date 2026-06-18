# Architecture

## Layers
- `ui/` observer and submit surface
- `runtime/boundary_service.js` deployment-facing no-bypass entry stub
- `runtime/commit_gate.js` authoritative commit decision surface
- `runtime/receipt.js` runtime-emitted receipt
- `runtime/replay.js` governing-condition replay comparison
- `contracts/` authoritative contract, identity, deployment profile

## Enforcement model
Nothing effect-bearing should bypass the boundary service envelope. The envelope is not authority; it is the required entry discipline before contract and state may be evaluated at commit.
