# C.A.S.E. Layer Architecture

## Python-first boundary layer

This repository is now structured as a Python-first boundary-layer proof surface.

Python is the primary implementation path for:

- release hash verification
- boundary envelope validation
- runtime commit gate evaluation
- standing re-bind logic
- admissibility resolution
- receipt emission
- replay comparison
- lineage/tamper detection
- proof-suite execution
- executable tamper-fail validation

Node remains available as an optional local UI/reviewer harness. It is not the authoritative layer implementation.

## Boundary split

```text
case_boundary_layer/        Python primary boundary layer
external-verifier/          Python external reviewer verifier
release/                    preserved release artifacts and proof fixtures
scripts/                    optional Node reviewer/UI helpers
tests/                      pytest verification surface
```

## Core invariant

Proposed movement enters.  
Boundary resolves.  
No protected consequence binds without the boundary result.

## Entry points

Primary verifier:

```bash
npm run verify
```

Equivalent Python entry point:

```bash
python -m case_boundary_layer.cli verify
```

Tamper-fail verifier:

```bash
npm run tamper:test
```

Equivalent Python entry point:

```bash
python -m case_boundary_layer.cli tamper-test
```

## Claim boundary

This is an A+ bounded local artifact proof surface.

It does not claim production certification, third-party certification, universal governance proof, deployed network no-bypass enforcement, customer-specific corridor certification, or protected kernel disclosure.
