#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  echo "Usage: ./push_to_github.sh https://github.com/Kamanaka5502/C.A.S.E.-Elyria-Systems-Boundary-Layer.git"
  exit 1
fi

git init
git branch -M main
git add .
git commit -m "Initial C.A.S.E. boundary layer release"
git remote add origin "$REPO_URL"
git push -u origin main
