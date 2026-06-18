import { invokeBoundaryService } from './boundary_service.js';

export async function submitProposal({ proposal, state, contract, contractIdentity, lineage, previousReceipt = null, envelope }) {
  return invokeBoundaryService({ envelope, proposal, state, contract, contractIdentity, lineage, previousReceipt });
}
