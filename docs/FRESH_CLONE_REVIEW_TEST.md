# Fresh Clone Review Test

Run:

```bash
git clone https://github.com/Kamanaka5502/C.A.S.E.-Elyria-Systems-Boundary-Layer
cd C.A.S.E.-Elyria-Systems-Boundary-Layer
npm install
npm run verify
```

Expected:

```text
RESULT: C.A.S.E. BOUNDARY PASS
```

If the command fails on a fresh clone, the repo is not A/A+.

## Tamper check

After a clean pass, modify one preserved release artifact and rerun verification.

Expected:

```text
RESULT: C.A.S.E. BOUNDARY FAIL
```

Restore the release package and rerun verification.

Expected:

```text
RESULT: C.A.S.E. BOUNDARY PASS
```
