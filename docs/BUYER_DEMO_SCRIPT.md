# Buyer Demo Script

This script is designed for a plain 15-minute buyer walkthrough.

## 1. Clone the repository

```bash
git clone https://github.com/Kamanaka5502/C.A.S.E.-Elyria-Systems-Boundary-Layer.git
cd C.A.S.E.-Elyria-Systems-Boundary-Layer
```

## 2. Install dependencies

This package currently uses Node built-ins for the proof path. Run install only if your environment expects package setup:

```bash
npm install
```

## 3. Run verification

```bash
npm run verify
```

Expected result:

```text
RELEASE_HASHES: PASS
Proof suite: PASS
```

Interpretation: the local release package is intact and the proof suite passes expected scenario outcomes.

## 4. Start the local UI

```bash
npm run start
```

Open:

```text
http://localhost:8080/ui/
```

## 5. Submit a proof case

In the UI, start with:

```text
EXECUTE — valid standing
```

Expected interpretation: valid standing should pass through the boundary path and produce an execution result.

## 6. Submit a refusal case

Run at least one refusal path:

```text
REFUSE — consent revoked
REFUSE — contract tamper
REFUSE — stale TTL
REFUSE — incomplete context
```

Expected interpretation: invalid movement should refuse rather than silently bind.

## 7. Inspect commit attestation

Review whether the commit path shows governing basis, authority scope, current state, runtime identity, and contract identity.

Interpretation: attestation is the commit-time proof that standing was re-bound before movement.

## 8. Inspect receipt

Review the receipt output after an admitted movement.

Interpretation: the receipt preserves runtime outcome evidence. It is not a production certification claim.

## 9. Run replay

Use the replay proof case or proof suite:

```bash
npm run proof
```

Interpretation: replay checks whether the proof corridor can be re-examined under preserved conditions.

## 10. Tamper with lineage

For a local-only demo, copy a proof case, alter a receipt or lineage field, and rerun the proof check.

Expected interpretation: tamper should break verification or produce an explicit failure signal.

Do not commit tampered files to the repository.

## Buyer close

The demo proves a local buyer-reviewable proof surface. It does not prove production deployment security, third-party certification, legal compliance, or universal governance correctness.
