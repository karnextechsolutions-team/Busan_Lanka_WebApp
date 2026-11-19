#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO='https://github.com/karnextechsolutions-team/Busan_Lanka_WebApp.git'
if [[ ! -d .git ]]; then
  git init -b main
fi
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO"
fi
if ! git config user.name >/dev/null || ! git config user.email >/dev/null; then
  echo 'Please configure Git user identity:'
  echo '  git config --global user.name "YOUR GITHUB NAME"'
  echo '  git config --global user.email "YOUR GITHUB EMAIL"'
  exit 1
fi
if grep -RIl --exclude='PUSH_TO_GITHUB.sh' -E 'sk-[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]{16,}|github_pat_[A-Za-z0-9_]+' --include='*.js' --include='*.ts' --include='*.json' --include='*.toml' --include='*.md' . | grep -q .; then
  echo 'Potential secret found; review before committing. No files were pushed.'
  exit 1
fi
node tools/build-netlify.mjs
node tests/smoke.mjs
node tests/v3-smoke.mjs
node tests/gemini-smoke.mjs
git add .
git status --short
git commit -m 'Busan Lanka V3.5 animated Sri Lanka scroll stories' || echo 'No uncommitted changes'
git push -u origin main
