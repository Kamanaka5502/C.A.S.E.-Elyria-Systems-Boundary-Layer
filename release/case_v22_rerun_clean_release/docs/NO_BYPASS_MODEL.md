# No-Bypass Model

C.A.S.E. v22 introduces a boundary service envelope. All effect-bearing proposals must enter through the boundary service with:
- POST method
- allowed source channel
- boundary attestation marker
- session nonce
- submitted_at_utc

Missing or invalid envelope data fails closed before contract evaluation.
