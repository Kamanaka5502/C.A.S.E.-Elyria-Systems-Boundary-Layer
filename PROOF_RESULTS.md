# Proof Results

## Command run

```bash
npm run verify
```

This command runs:

```bash
npm run verify:hashes
npm run proof
```

## Expected pass result

Expected local result:

```text
RELEASE_HASHES: PASS
Proof suite: PASS — 11/11 proof cases passed
Runtime identity: CASE_v22_rerun_clean_runtime
Contract version: 9.0.0
```

## Proof case names

The buyer-review proof suite covers:

- `execute`
- `refuse`
- `escalate`
- `halt`
- `constitutional_shift`
- `ttl`
- `context`
- `tamper`
- `forged_receipt`
- `replay`
- `precheck`

## Receipt sample location

Receipt behavior is generated through the runtime proof path and receipt module:

```text
release/case_v22_rerun_clean_release/runtime/receipt.js
```

Proof scenarios are preserved under:

```text
release/case_v22_rerun_clean_release/proof/
```

## Replay sample location

Replay behavior is handled by:

```text
release/case_v22_rerun_clean_release/runtime/replay.js
```

Replay proof inputs are included in:

```text
release/case_v22_rerun_clean_release/proof/replay_case.json
```

## Lineage tamper sample

Lineage and tamper behavior can be reviewed through:

```text
release/case_v22_rerun_clean_release/runtime/lineage.js
release/case_v22_rerun_clean_release/runtime/tamper.js
release/case_v22_rerun_clean_release/proof/tamper_case.json
release/case_v22_rerun_clean_release/proof/forged_receipt_case.json
```

## Hash verification result

Hash verification uses:

```text
release/case_v22_rerun_clean_release/RELEASE_HASHES.json
scripts/verify-release-hashes.mjs
```

A clean result means the preserved release files match the review manifest. A failure means the package has drifted or a file is missing.

## Buyer interpretation

A passing proof suite supports buyer review and pilot scoping. It does not establish production certification, third-party certification, legal compliance, or live no-bypass deployment security.
