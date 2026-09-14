#!/usr/bin/env bash
# Configura o Git para utilizar os hooks versionados em .githooks (Linux/macOS/Git Bash)
# Uso: scripts/instalar-hooks.sh

set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${RAIZ}"

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit 2>/dev/null || true

echo "[OK] Git hooks configurados com sucesso em '.githooks'!"
echo "O pre-commit hook validará automaticamente seu staging a cada commit."
