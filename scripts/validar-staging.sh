#!/usr/bin/env bash
# Valida os arquivos atualmente preparados em staging (git diff --cached)
# Verifica:
#   1. Arquivos sensíveis/segredos ou espúrios proibidos
#   2. Limite de 300 linhas em artefatos de agentes (.agents/{skills,rules,prompts}/*.md)
#   3. Resíduos de debug/prints em adições de código
# Uso: scripts/validar-staging.sh

set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${RAIZ}"

FALHAS=0
AVISOS=0

falhar() { echo "  [FALHA] $1" >&2; FALHAS=$((FALHAS + 1)); }
avisar() { echo "  [AVISO] $1" >&2; AVISOS=$((AVISOS + 1)); }
passar() { echo "  [OK]    $1"; }

echo "=== Validando arquivos em staging (pre-commit) ==="

# 1. Verificar se há arquivos em staging
STAGED_FILES="$(git diff --cached --name-only || true)"
if [ -z "${STAGED_FILES}" ]; then
  echo "Nenhum arquivo em staging. Adicione arquivos com 'git add' antes de validar."
  exit 0
fi

# 2. Inspecionar arquivos proibidos / segredos
echo
echo "1. Verificando presenca de arquivos proibidos ou segredos..."
while IFS= read -r ARQUIVO; do
  [ -z "${ARQUIVO}" ] && continue

  # Permite arquivos de exemplo/template explicitos
  if [[ "${ARQUIVO}" =~ \.example$ ]]; then
    continue
  fi

  if [[ "${ARQUIVO}" =~ (^|/)\.env(\..+)?$ ]] || \
     [[ "${ARQUIVO}" =~ \.(pem|key|pkcs12|pfx|kdbx)$ ]] || \
     [[ "${ARQUIVO}" =~ id_rsa ]] || \
     [[ "${ARQUIVO}" =~ (^|/)node_modules/ ]] || \
     [[ "${ARQUIVO}" =~ (^|/)(dist|\.next|build)/ ]] || \
     [[ "${ARQUIVO}" =~ \.(log|tmp)$ ]] || \
     [[ "${ARQUIVO}" =~ \.DS_Store$ ]] || \
     [[ "${ARQUIVO}" =~ Thumbs\.db$ ]]; then
    falhar "Arquivo indevido no staging: ${ARQUIVO}"
  fi
done <<< "${STAGED_FILES}"

if [ "${FALHAS}" -eq 0 ]; then
  passar "Nenhum arquivo de segredo, build ou temporario detectado no staging."
fi

# 3. Limite de 300 linhas em artefatos .agents/
echo
echo "2. Verificando limite de linhas em artefatos de agentes (<= 300 linhas)..."
FALHAS_ANTES="${FALHAS}"
while IFS= read -r ARQUIVO; do
  [ -z "${ARQUIVO}" ] && continue

  if [[ "${ARQUIVO}" =~ ^\.agents/(skills|rules|prompts)/.*\.md$ ]]; then
    # Regra 12b: subpasta assets/ é livre de limite de linhas
    if [[ "${ARQUIVO}" =~ /assets/ ]]; then
      continue
    fi

    if [ -f "${ARQUIVO}" ]; then
      LINHAS=$(wc -l < "${ARQUIVO}")
      if [ "${LINHAS}" -gt 300 ]; then
        falhar "Artefato excede 300 linhas: ${ARQUIVO} (${LINHAS} linhas > 300)"
      fi
    fi
  fi
done <<< "${STAGED_FILES}"

if [ "${FALHAS}" -eq "${FALHAS_ANTES}" ]; then
  passar "Artefatos em .agents/ estao dentro do limite permitido."
fi

# 4. Resíduos de debug / prints nas linhas adicionadas
echo
echo "3. Verificando residuos de debug nas adicoes staged..."
RESIDUOS="$(git diff --cached -U0 -- ":!scripts/*" | grep -E '^\+[^+]' | grep -E '(console\.log\(|debugger;|pdb\.set_trace\(|TODO:[[:space:]]*remove)' || true)"
if [ -n "${RESIDUOS}" ]; then
  while IFS= read -r LINHA; do
    [ -z "${LINHA}" ] && continue
    avisar "Possivel residuo de debug encontrado: ${LINHA}"
  done <<< "${RESIDUOS}"
else
  passar "Nenhum residuo obvio de debug (console.log, debugger, etc.) detectado."
fi

# Resultado
echo
if [ "${FALHAS}" -eq 0 ]; then
  echo "Validacao do staging concluida com SUCESSO! (${AVISOS} aviso(s))"
  exit 0
fi

echo "Validacao do staging REPROVADA: ${FALHAS} erro(s) critico(s) encontrado(s)." >&2
exit 1
