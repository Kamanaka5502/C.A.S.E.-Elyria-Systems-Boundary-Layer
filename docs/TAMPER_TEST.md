# Tamper Test

## Purpose

Prove that release artifact tampering fails verification.

## Clean Pass

```bash
npm run verify
```

Expected:

```text
RESULT: C.A.S.E. BOUNDARY PASS
```

## Tamper

Modify any preserved release artifact under:

```text
release/case_v22_rerun_clean_release/
```

Example:

```bash
node -e "const fs=require('fs'); const p='release/case_v22_rerun_clean_release/contracts/deployment_profile.json'; fs.appendFileSync(p, '\n')"
```

## Expected Failure

```bash
npm run verify
```

Expected:

```text
RESULT: C.A.S.E. BOUNDARY FAIL
```

## Restore

```bash
git checkout -- release/case_v22_rerun_clean_release/
npm run verify
```

Expected:

```text
RESULT: C.A.S.E. BOUNDARY PASS
```
