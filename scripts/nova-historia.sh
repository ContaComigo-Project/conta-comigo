#!/usr/bin/env bash
# Cria a pasta de execução de uma história a partir do template.
# Uso: scripts/nova-historia.sh HT-005
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHAVE="${1:-}"

if [ -z "${CHAVE}" ]; then
  echo "Uso: scripts/nova-historia.sh <CHAVE>   (ex.: HT-005 ou HN-001)" >&2
  exit 1
fi

if ! echo "${CHAVE}" | grep -Eq '^(HN|HT)-[0-9]{3}$'; then
  echo "chave inválida: '${CHAVE}'. Use HN-XXX (negócio) ou HT-XXX (técnica)." >&2
  exit 1
fi

DESTINO="${RAIZ}/docs/tasks/${CHAVE}"
TEMPLATE="${RAIZ}/docs/tasks/_TEMPLATE"

if [ -d "${DESTINO}" ]; then
  echo "já existe: docs/tasks/${CHAVE} — nada foi alterado." >&2
  exit 1
fi

cp -r "${TEMPLATE}" "${DESTINO}"

CHAVE_MINUSCULA="$(echo "${CHAVE}" | tr '[:upper:]' '[:lower:]')"

for arquivo in "${DESTINO}"/*; do
  sed -i.bak \
    -e "s/\[CHAVE\]/${CHAVE}/g" \
    -e "s/^name: \(.*\)-template$/name: \1-${CHAVE_MINUSCULA}/" \
    "${arquivo}"
  rm -f "${arquivo}.bak"
done

echo "criado docs/tasks/${CHAVE}/ com TASK.md, IMPLEMENTATION.md e progress.txt"
echo
echo "próximos passos:"
echo "  1. preencher TASK.md e IMPLEMENTATION.md antes de escrever código"
echo "  2. mover ${CHAVE} para 'Em execução' no docs/backlog/KANBAN-OFICIAL.md"
echo "  3. seguir .agents/prompts/ralph-loop/PROMPT.md"
