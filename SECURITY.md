# Security Policy

## Supported artifact

This repository publishes the C.A.S.E. v22 Rerun Clean Release as a reviewable local artifact proof surface.

The supported security boundary is the artifact contained in:

```text
release/case_v22_rerun_clean_release/
```

## Disclosure boundary

Do not disclose private keys, credentials, customer materials, private runtime lineage, proprietary engagement material, or non-public governance architecture in an issue, pull request, discussion, fork, or public channel.

If you identify a security concern, report only the minimum reproducible technical facts needed to evaluate the issue.

## What may be reviewed

Reviewers may evaluate:

- release hash integrity
- proof-suite behavior
- boundary-service entry logic
- commit-gate admissibility behavior
- attestation generation
- receipt emission
- replay comparison
- lineage and tamper visibility

## What may not be inferred

This repository does not assert:

- production deployment security
- third-party certification
- universal compliance status
- live network no-bypass guarantees
- authorization to reuse, commercialize, or derive from this work

## Local verification

Run:

```bash
npm run verify
```

Expected result:

```text
RELEASE_HASHES: PASS
Proof suite: PASS
```

## Ownership and license posture

Copyright © Samantha Revita. All rights reserved.

This is not an open-source release. No license is granted to copy, modify, sublicense, sell, deploy, commercialize, or incorporate this work into another product or service without written permission.
