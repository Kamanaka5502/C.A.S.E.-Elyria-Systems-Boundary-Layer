# Security Posture

## Current posture

This repository is a local proof package. It does not claim production hardening.

Current security posture:

- local-only operation
- no production hardening claimed
- no secrets required
- no customer data required
- no external network dependency for proof execution
- release hash verification included
- lineage tamper detection included
- receipt and replay evidence included
- claim boundary documented
- commercial use gated by written scope

## What is intentionally excluded

This repository does not include:

- production authentication
- buyer tenant isolation
- managed signing keys
- persistent production audit store
- persistent production receipt store
- monitoring and alerting pipeline
- customer data processing agreement
- external security assessment
- production incident response plan

## Local verification controls

Local verification is performed with:

```bash
npm run verify
```

This runs release-hash verification and proof-suite execution.

The release hash check validates the preserved release files against `RELEASE_HASHES.json`.

The proof suite validates the local scenario outcomes against expected admissibility behavior.

## Evidence controls

The local proof surface includes:

- hash verification
- commit attestation
- runtime receipt
- replay comparison
- lineage tamper visibility

These are local artifact controls. They are not substitutes for production security architecture.

## Production security gates

Before production use, the following gates are required:

- authentication / RBAC
- tenant isolation
- persistent audit store
- persistent receipt store
- signing keys / KMS
- deployment hardening
- monitoring / alerting
- external security review
- incident response procedure
- backup and recovery plan
- customer data agreement

## Security interpretation

This repository is safe to review as a bounded local artifact proof package. It is not sufficient for production deployment without additional security engineering and review.
