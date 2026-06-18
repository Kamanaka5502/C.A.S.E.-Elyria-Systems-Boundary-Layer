import { sha256Hex } from './utils.js';

export async function verifyLineage(receipt, previousReceipt = null) {
  const expectedPrev = previousReceipt ? previousReceipt.receipt_hash : 'GENESIS';
  const lineageSeed = {
    prev_receipt_hash: receipt.prev_receipt_hash,
    proposal_hash: receipt.proposal_hash,
    state_hash: receipt.state_hash,
    contract_sha256: receipt.contract_sha256,
    runtime_identity: receipt.runtime_identity,
    lineage_index: receipt.lineage_index
  };
  const expectedLineageHash = await sha256Hex(lineageSeed);
  const checks = {
    prev_receipt_hash_matches: receipt.prev_receipt_hash === expectedPrev,
    lineage_hash_matches: receipt.lineage_hash === expectedLineageHash,
    lineage_index_valid: previousReceipt ? receipt.lineage_index === previousReceipt.lineage_index + 1 : receipt.lineage_index === 1
  };
  const failed = Object.entries(checks).filter(([,v]) => !v).map(([k]) => k);
  return {
    expected_prev_receipt_hash: expectedPrev,
    checks,
    pass: failed.length === 0,
    failed,
    failure_mode: failed.length ? `LINEAGE_TAMPER_DETECTED:${failed.join('|')}` : null,
    loud_break: failed.length > 0,
    expected_lineage_hash: expectedLineageHash
  };
}
