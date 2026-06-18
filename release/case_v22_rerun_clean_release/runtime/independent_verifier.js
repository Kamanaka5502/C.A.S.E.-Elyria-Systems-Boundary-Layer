import { loadAndVerifyContract } from "./contract_loader.js";
import { processBoundaryProposal } from "./boundary_service.js";
import { verifyReplay } from "./replay.js";
import { verifyLineage } from "./lineage.js";
import executeCase from "../proof/execute_case.json" assert { type: "json" };
import replayCase from "../proof/replay_case.json" assert { type: "json" };

export function independentVerifierRun() {
  const contract = loadAndVerifyContract();
  const run = processBoundaryProposal(executeCase, contract);
  const replay = verifyReplay(run.receipt, run.receipt, { standard: "same governing conditions" });
  const lineage = verifyLineage([run.receipt]);
  return {
    reviewer_flow: ["run","commit","attestation","receipt","replay","lineage"],
    contract_version: contract.contract_version,
    outcome: run.receipt.outcome,
    reason: run.receipt.reason,
    replay,
    lineage
  };
}
