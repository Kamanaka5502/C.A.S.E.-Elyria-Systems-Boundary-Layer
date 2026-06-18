# RULE COVERAGE

Artifact line: C.A.S.E. v22 Rerun Clean Release
Contract version: 7.0.0
Contract sha256: ccbac6be23c84b5ea97d9afcdf742dc69e7dcbba98a48a7d8754bcfebde789ac

This pass hardens the system by making contract-rule coverage explicit.

Covered rule ids:
- contract_identity_required
- state_contract_alignment_required
- state_epoch_required
- authority_required
- consent_required
- context_complete_required
- ttl_positive_required
- risk_within_max_or_halt
- receipt_lineage_required
- runtime_identity_required

Coverage target: every contract rule influences runtime decisioning or receipt enforcement directly at `runtime_commit_gate` or in the receipt/lineage validation phase.
