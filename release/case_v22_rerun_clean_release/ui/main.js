import { submitProposal } from '../runtime/boundary_api.js';
import { replayEquivalent, compareReceipts } from '../runtime/replay.js';
import { forgeReceipt } from '../runtime/tamper.js';
import { verifyLineage } from '../runtime/lineage.js';
import { buildAttestation } from '../runtime/attest.js';
import { runProofSuite } from '../runtime/proof_suite.js';
import { loadAuthoritativeContract } from '../runtime/contract_loader.js';

const loaded = await loadAuthoritativeContract();
const contract = loaded.contract;
const contractIdentity = loaded.identity;
const deploymentProfile = loaded.deployment;
const contractLoadCheck = loaded.contract_load_check;

const scenarios = {
  execute: { decision_id: 'case_execute', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 300, risk: 0.20, state_epoch: 'epoch_1', proposal_contract_sha: contractIdentity.contract_sha256 },
  refuse: { decision_id: 'case_refuse_consent', authority: true, consent: 'revoked', contextComplete: true, ttlSeconds: 300, risk: 0.20, state_epoch: 'epoch_1', proposal_contract_sha: contractIdentity.contract_sha256 },
  escalate: { decision_id: 'case_escalate_risk', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 300, risk: 0.36, state_epoch: 'epoch_1', proposal_contract_sha: contractIdentity.contract_sha256 },
  halt: { decision_id: 'case_halt_risk', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 300, risk: 0.62, state_epoch: 'epoch_1', proposal_contract_sha: contractIdentity.contract_sha256 },
  shift: { decision_id: 'case_shift_detected', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 300, risk: 0.18, state_epoch: 'epoch_old', proposal_contract_sha: contractIdentity.contract_sha256 },
  tamper: { decision_id: 'case_tamper_contract', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 300, risk: 0.18, state_epoch: 'epoch_1', proposal_contract_sha: 'tampered_contract_sha' },
  ttl: { decision_id: 'case_stale_ttl', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 0, risk: 0.18, state_epoch: 'epoch_1', proposal_contract_sha: contractIdentity.contract_sha256 },
  context: { decision_id: 'case_context_incomplete', authority: true, consent: 'granted', contextComplete: false, ttlSeconds: 300, risk: 0.18, state_epoch: 'epoch_1', proposal_contract_sha: contractIdentity.contract_sha256 },
  precheck: { decision_id: 'case_precheck_valid_commit_invalid', authority: true, consent: 'granted', contextComplete: true, ttlSeconds: 300, risk: 0.22, state_epoch: 'epoch_candidate', proposal_contract_sha: contractIdentity.contract_sha256 }
};
const expected = { execute:'EXECUTE', refuse:'REFUSE', escalate:'ESCALATE', halt:'HALT', shift:'REFUSE', tamper:'REFUSE', ttl:'REFUSE', context:'REFUSE', precheck:'REFUSE' };
const appState = { mode:'operator', last:null, previousReceipt:null, lineage:{ prev_receipt_hash:'GENESIS', lineage_index:0 }, proofReport:null, currentScenario:'execute', history:[], deploymentProfile, contractLoadCheck };

const value = id => document.getElementById(id).value;
const shortHash = v => String(v || '').slice(0, 12);
const badgeClass = o => o === 'EXECUTE' ? 'exec' : o === 'ESCALATE' ? 'escalate' : o === 'HALT' ? 'halt' : o === 'READY' ? 'neutral' : 'refuse';

function markActive(name){ document.querySelectorAll('.scenario').forEach(btn => btn.classList.toggle('active', btn.dataset.scenario === name)); appState.currentScenario = name; }
function setMode(mode){ document.body.classList.remove('mode-operator','mode-auditor','mode-buyer'); document.body.classList.add(`mode-${mode}`); document.querySelectorAll('.mode').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode)); }
function setForm(name){
  const s=scenarios[name];
  for (const [k,v] of Object.entries(s)) {
    const id = k === 'proposal_contract_sha' ? 'proposal_contract_sha' : k;
    const el=document.getElementById(id);
    if (el) el.value=String(v);
  }
  document.getElementById('live_state_epoch').value = name === 'precheck' ? 'epoch_real' : 'epoch_1';
  document.getElementById('live_contract_sha').value = contractIdentity.contract_sha256;
  markActive(name);
}
function readProposal(){ return { decision_id:value('decision_id'), authority:value('authority')==='true', consent:value('consent'), contextComplete:value('contextComplete')==='true', ttlSeconds:Number(value('ttlSeconds')), risk:Number(value('risk')), state_epoch:value('state_epoch'), contract_sha256:value('proposal_contract_sha') }; }
function readState(){ return { state_epoch:value('live_state_epoch'), contract_sha256:value('live_contract_sha') }; }
function downloadText(filename, text, type='application/json'){ const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }
function setScore(id, pass, label){ const el=document.getElementById(id); el.textContent=label; el.className=`score-value ${pass ? 'pass' : 'fail'}`; }

function buildBoundaryEnvelope(sourceChannel='case_ui_submit'){
  return {
    method: 'POST',
    boundary_attestation: `case_ui_boundary_${Date.now()}`,
    source_channel: sourceChannel,
    session_nonce: `nonce_${Math.random().toString(36).slice(2)}_${Date.now()}`,
    submitted_at_utc: new Date().toISOString()
  };
}

function renderHistory(){
  const el=document.getElementById('historyPanel');
  if (!appState.history.length) { el.innerHTML='<div class="history-empty">No runs yet.</div>'; return; }
  el.innerHTML = appState.history.slice().reverse().map(item => `
    <div class="history-item">
      <div><strong>${item.outcome}</strong> — ${item.reason}</div>
      <div class="history-meta">${item.decision_id} • boundary ${item.boundary} • epoch ${item.state_epoch}</div>
      <div class="history-meta">receipt ${shortHash(item.receipt_hash)} • lineage ${item.lineage_index}</div>
    </div>`).join('');
}

function renderReplayMatrix(currentReceipt){
  const el=document.getElementById('replayMatrix');
  if (!currentReceipt || appState.history.length < 2) {
    el.textContent = JSON.stringify({ note:'Run at least two proposals to compare replay and lineage behavior across receipts.' }, null, 2);
    return;
  }
  const previous = appState.history[appState.history.length - 2].receipt;
  const comparison = compareReceipts(previous, currentReceipt);
  const replay = replayEquivalent(previous, currentReceipt);
  el.textContent = JSON.stringify({ previous_decision_id: previous.decision_id, current_decision_id: currentReceipt.decision_id, comparison, replay }, null, 2);
}

function renderBoundaryApi(){
  document.getElementById('boundaryApiPanel').textContent = JSON.stringify({
    entrypoint:'submitProposal()',
    contract_gate:'verifyContractIdentity()',
    boundary:'runtime_commit_gate',
    output:'decision + runtime receipt + gate summary',
    guarantee:'UI submits proposal only. Runtime decides at commit.'
  }, null, 2);
}

async function render(result){
  const badge=document.getElementById('decisionBadge');
  badge.className=`badge ${badgeClass(result.decision.outcome)}`;
  badge.textContent=`${result.decision.outcome} — ${result.decision.reason}`;
  document.getElementById('checksTable').innerHTML = Object.entries(result.decision.checks).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  document.getElementById('stateEpochReadout').textContent = result.receipt.state_epoch;
  document.getElementById('lineageReadout').textContent = String(result.receipt.lineage_index);
  document.getElementById('standingPanel').textContent = JSON.stringify(result.decision.standing, null, 2);
  document.getElementById('receiptPanel').textContent = JSON.stringify(result.receipt, null, 2);
  const lineageCheck = await verifyLineage(result.receipt, appState.previousReceipt);
  const attestation = buildAttestation({ decision: result.decision, receipt: result.receipt, contractCheck: result.contractCheck, lineageCheck, contractIdentity });
  document.getElementById('attestationPanel').textContent = JSON.stringify({ commit_attestation: result.commitAttestation, boundary_attestation: attestation }, null, 2);
  document.getElementById('lineagePanel').textContent = JSON.stringify({ prev_receipt_hash: result.receipt.prev_receipt_hash, lineage_index: result.receipt.lineage_index, lineage_hash: result.receipt.lineage_hash, receipt_hash: result.receipt.receipt_hash, lineage_verification: lineageCheck }, null, 2);
  document.getElementById('evidencePanel').textContent = JSON.stringify({ gate_summary: result.gateSummary, contract_check: result.contractCheck, enforced_contract_rules: result.receipt.enforced_contract_rules, reason_trace: result.receipt.reason_trace, commit_attestation_summary: result.commitAttestation?.summary, rebinding: result.commitAttestation?.rebinding, runtime_notes: result.decision.runtime_notes, attestation_summary: attestation.summary }, null, 2);
  document.getElementById('traceLine').textContent = `phase 1: proposal -> reduction/precheck -> ${result.decision.commit_boundary} re-bind -> ${result.decision.outcome} -> runtime receipt | phase 2: replay -> lineage verification`; 
  document.getElementById('commitTimeline').textContent = JSON.stringify({
    proposal: { decision_id: proposal.decision_id, proposal_state_epoch: proposal.state_epoch },
    reduction: 'Upstream may reduce candidates but cannot grant durable authority.',
    commit_rebinding: result.commitAttestation,
    receipt: { receipt_id: result.receipt.receipt_id, receipt_hash: result.receipt.receipt_hash },
    lineage: { prev_receipt_hash: result.receipt.prev_receipt_hash, lineage_index: result.receipt.lineage_index },
  }, null, 2);
  document.getElementById('replayClassReadout').textContent = 'READY';
  setScore('scoreContract', result.contractCheck.pass, result.contractCheck.pass ? 'PASS' : 'FAIL');
  setScore('scoreStanding', result.decision.standing.resolved_at_commit && !result.decision.standing.inherited, 'COMMIT-RESOLVED');
  setScore('scoreReplay', true, 'READY');
  setScore('scoreLineage', lineageCheck.pass, lineageCheck.pass ? 'VERIFIED' : 'BROKEN');
  setScore('scoreAttestation', !!result.commitAttestation, result.commitAttestation ? 'EMITTED' : 'MISSING');
  renderHistory();
  renderReplayMatrix(result.receipt);
  document.getElementById('replayGovernance').textContent = JSON.stringify({ note:'Run replay to inspect governing-condition comparison and the verification phase separately from commit enforcement.' }, null, 2);
renderBoundaryApi();
}

async function runCurrent(){
  const proposal=readProposal();
  const state=readState();
  const result=await submitProposal({ proposal, state, contract, contractIdentity, lineage: appState.lineage, previousReceipt: appState.previousReceipt, envelope: buildBoundaryEnvelope() });
  appState.previousReceipt = appState.last?.result?.receipt ?? null;
  appState.lineage = { prev_receipt_hash: result.receipt.receipt_hash, lineage_index: result.receipt.lineage_index };
  appState.last = { proposal, state, result };
  appState.history.push({ decision_id: proposal.decision_id, outcome: result.decision.outcome, reason: result.decision.reason, boundary: result.decision.commit_boundary, state_epoch: result.receipt.state_epoch, lineage_index: result.receipt.lineage_index, receipt_hash: result.receipt.receipt_hash, receipt: result.receipt });
  await render(result);
  document.getElementById('replaySummary').textContent = 'Phase 2 verification ready. Replay compares governing conditions explicitly: contract, relevant inputs, state epoch, runtime identity, boundary, and decision class.';
  document.getElementById('replayDiff').textContent = '';
  renderAdversarial(result.receipt);
}

async function replayCurrent(){
  if(!appState.last) return;
  const rerun = await submitProposal({ proposal: appState.last.proposal, state: appState.last.state, contract, contractIdentity, lineage: appState.lineage, previousReceipt: appState.last.result.receipt, envelope: buildBoundaryEnvelope() });
  const replay = replayEquivalent(appState.last.result.receipt, rerun.receipt);
  const diff = compareReceipts(appState.last.result.receipt, rerun.receipt);
  document.getElementById('replaySummary').textContent = JSON.stringify(replay, null, 2);
  document.getElementById('replayDiff').textContent = JSON.stringify(diff, null, 2);
  document.getElementById('replayClassReadout').textContent = replay.classification.toUpperCase();
  document.getElementById('replayGovernance').textContent = JSON.stringify(replay.governing_conditions, null, 2);
  setScore('scoreReplay', replay.pass, replay.pass ? 'PASS' : replay.classification.toUpperCase());
}

async function renderAdversarial(receipt){
  const forged=forgeReceipt(receipt);
  const comparable = { ...forged }; delete comparable.receipt_hash;
  const { sha256Hex } = await import('../runtime/utils.js');
  const forgedRecomputedHash = await sha256Hex(comparable);
  const forgedHashBroken = forged.receipt_hash !== forgedRecomputedHash;
  document.getElementById('adversarialPanel').textContent = JSON.stringify({ forged_receipt_detectable: forgedHashBroken, forged_outcome: forged.outcome, authoritative_outcome: receipt.outcome, lineage_break_if_forged: forgedHashBroken, note: 'A forged receipt must break receipt integrity or lineage continuity loudly at the boundary review surface.' }, null, 2);
}

async function runSuite(){
  appState.proofReport = await runProofSuite({ scenarios, expected, contract, contractIdentity });
  document.getElementById('suiteSummary').textContent = appState.proofReport.summary;
  document.getElementById('suiteStats').innerHTML = [`<span>Cases: ${appState.proofReport.cases.length}</span>`,`<span>Passed: ${appState.proofReport.cases.filter(c => c.pass).length}</span>`,`<span>Replay classified: yes</span>`,`<span>Lineage checked: yes</span>`].join('');
  document.getElementById('suiteReport').textContent = JSON.stringify(appState.proofReport, null, 2);
}

function exportProofReport(){ downloadText('CASE_v22_proof_report.json', JSON.stringify(appState.proofReport || { package:'C.A.S.E. v22 Rerun Clean Release', summary:'No suite run yet.' }, null, 2)); }
function exportHtmlBrief(){
  const summary=appState.proofReport?.summary || 'No proof suite has been run yet.';
  const rows=(appState.proofReport?.cases || []).map(c=>`<tr><td>${c.case}</td><td>${c.expected}</td><td>${c.actual}</td><td>${c.reason}</td><td>${c.replay_classification}</td><td>${c.pass}</td></tr>`).join('');
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>C.A.S.E. v22 Rerun Clean Brief</title><style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#111}h1{margin:0 0 8px}p{color:#444;line-height:1.45}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f7fb}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.card{border:1px solid #ddd;border-radius:12px;padding:12px}</style></head><body><h1>C.A.S.E. v22 Rerun Clean Brief</h1><p>${summary}</p><div class="cards"><div class="card"><strong>Boundary</strong><br>runtime_commit_gate</div><div class="card"><strong>Runtime</strong><br>${contractIdentity.runtime_identity}</div><div class="card"><strong>Contract</strong><br>${contract.contract_version}</div></div><p>This brief summarizes a local commit-attested governed decision environment with two distinct phases: decision-boundary enforcement at commit, then receipt/lineage verification after the decision. Admissibility is re-evaluated at commit, governing basis/authority scope/evidence lineage/current state are rebound at the boundary, and replay/lineage make continuity and tamper visibility inspectable afterward.</p><table><thead><tr><th>Case</th><th>Expected</th><th>Actual</th><th>Reason</th><th>Replay class</th><th>Pass</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Run the proof suite first.</td></tr>'}</tbody></table></body></html>`;
  downloadText('CASE_v22_trust_brief.html', html, 'text/html');
}

document.getElementById('contractVersion').textContent = contract.contract_version;
document.getElementById('runtimeIdentity').textContent = contractIdentity.runtime_identity;
document.getElementById('buyerSummary').textContent = 'Use this when you need visible enforcement logic, commit-time re-binding, receipts, replay discipline, and trust export rather than explanation after the fact.';
document.getElementById('notes').value = 'Every effect-bearing contract rule is enforced at runtime_commit_gate. Commit emits a first-class attestation showing re-binding of governing basis, authority scope, evidence lineage, and current state.';
document.getElementById('run').addEventListener('click', runCurrent);
document.getElementById('replay').addEventListener('click', replayCurrent);
document.getElementById('runSuite').addEventListener('click', runSuite);
document.getElementById('exportReport').addEventListener('click', exportProofReport);
document.getElementById('exportHtml').addEventListener('click', exportHtmlBrief);
document.querySelectorAll('.scenario').forEach(btn => btn.addEventListener('click', () => setForm(btn.dataset.scenario)));
document.querySelectorAll('.mode').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
setMode('operator');
setForm('execute');
renderHistory();
renderReplayMatrix(null);
renderBoundaryApi();
