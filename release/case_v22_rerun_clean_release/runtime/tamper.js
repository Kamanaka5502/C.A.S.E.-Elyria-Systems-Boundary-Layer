export function tamperProposal(proposal, mode = 'contract') {
  const next = structuredClone(proposal);
  if (mode === 'contract') next.contract_sha256 = 'tampered_contract_sha';
  if (mode === 'state_epoch') next.state_epoch = 'state_epoch_tampered';
  if (mode === 'authority') next.authority = false;
  if (mode === 'ttl') next.ttlSeconds = -10;
  return next;
}

export function forgeReceipt(receipt) {
  const next = structuredClone(receipt);
  next.outcome = 'EXECUTE';
  next.reason = 'forged_after_refuse';
  return next;
}
