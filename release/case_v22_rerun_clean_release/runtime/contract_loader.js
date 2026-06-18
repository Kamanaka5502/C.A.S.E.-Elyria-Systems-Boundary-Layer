import { sha256Hex } from './utils.js';

export async function loadAuthoritativeContract() {
  const [contract, identity, deployment] = await Promise.all([
    fetch('../contracts/case_contract_authoritative_v5.json').then(r => r.json()),
    fetch('../contracts/contract_identity.json').then(r => r.json()),
    fetch('../contracts/deployment_profile.json').then(r => r.json())
  ]);

  const actualSha = await sha256Hex(contract);
  const pass = actualSha === identity.contract_sha256;

  return {
    contract,
    identity,
    deployment,
    contract_load_check: {
      pass,
      expected_contract_sha256: identity.contract_sha256,
      observed_contract_sha256: actualSha,
      failure_mode: pass ? null : 'CONTRACT_LOAD_MISMATCH'
    }
  };
}
