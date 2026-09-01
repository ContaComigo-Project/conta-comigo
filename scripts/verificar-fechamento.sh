#!/usr/bin/env bash
# Verifica o fechamento de uma entrega:
#   1. a tag existe;
#   2. a tag aponta para o mesmo commit de fechamento;
#   3. a mensagem do commit é semântica e cita a chave da história (HN-/HT-);
#   4. existe documento de entrega citando a chave.
# Uso: scripts/verificar-fechamento.sh vX.Y.Z [commit]
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAG="${1:-}"
COMMIT="${2:-HEAD}"
FALHAS=0

falhar() { echo "  [FALHA] $1" >&2; FALHAS=$((FALHAS + 1)); }
passar() { echo "  [OK]    $1"; }

if [ -z "${TAG}" ]; then
  echo "Uso: scripts/verificar-fechamento.sh vX.Y.Z [commit]" >&2
  exit 1
fi

cd "${RAIZ}"
echo "verificando fechamento da tag ${TAG}"

# 1. formato da versão
if echo "${TAG}" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
  passar "versão semântica no formato vMAJOR.MINOR.PATCH"
else
  falhar "tag '${TAG}' não está no formato vMAJOR.MINOR.PATCH"
fi

# 2. tag existe e aponta para o mesmo hash
if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  passar "tag ${TAG} existe"
  HASH_TAG="$(git rev-list -n 1 "${TAG}")"
  HASH_COMMIT="$(git rev-parse "${COMMIT}")"
  if [ "${HASH_TAG}" = "${HASH_COMMIT}" ]; then
    passar "tag e commit apontam para ${HASH_COMMIT}"
  else
    falhar "tag aponta para ${HASH_TAG}, commit de fechamento é ${HASH_COMMIT}"
  fi
else
  falhar "tag ${TAG} não existe"
  HASH_COMMIT="$(git rev-parse "${COMMIT}")"
fi

# 3. commit semântico com a chave da história
ASSUNTO="$(git log -1 --format=%s "${HASH_COMMIT}")"
echo "  commit: ${ASSUNTO}"

if echo "${ASSUNTO}" | grep -Eq '^(feat|fix|refactor|test|docs|chore|perf|build|ci)(\([^)]+\))?!?: .+'; then
  passar "mensagem segue commit semântico"
else
  falhar "mensagem não segue 'tipo(escopo): descrição'"
fi

CHAVE="$(echo "${ASSUNTO}" | grep -Eo '(HN|HT)-[0-9]{3}' | head -n 1 || true)"
if [ -n "${CHAVE}" ]; then
  passar "commit cita a história ${CHAVE}"
else
  falhar "mensagem não cita chave de história (HN-XXX ou HT-XXX)"
fi

# 4. documento de entrega
if [ -n "${CHAVE}" ]; then
  if ls docs/entregas/ENTREGA-"${CHAVE}"-*.md >/dev/null 2>&1; then
    passar "documento de entrega encontrado para ${CHAVE}"
  else
    falhar "nenhum docs/entregas/ENTREGA-${CHAVE}-*.md encontrado"
  fi
fi

echo
if [ "${FALHAS}" -eq 0 ]; then
  echo "fechamento verificado: ${TAG} -> ${HASH_COMMIT}"
  exit 0
fi

echo "fechamento reprovado: ${FALHAS} verificação(ões) falharam" >&2
exit 1
