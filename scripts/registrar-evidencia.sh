#!/usr/bin/env bash
# Executa uma tarefa do harness e registra a saída REAL como evidência.
#
# A evidência do ciclo Ralph não pode ser escrita à mão: este script não
# aceita texto de saída por parâmetro. A única fonte do corpo do arquivo é a
# execução do harness.
#
# Uso: scripts/registrar-evidencia.sh <CHAVE> <FASE> <tarefa> "descrição" [--esperar-falha] [--rotulo texto]
# Ex.: scripts/registrar-evidencia.sh HT-006 AGIR test-unitario "cenário de fronteira" --esperar-falha
set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHAVE="${1:-}"
FASE="${2:-}"
TAREFA="${3:-}"
DESCRICAO="${4:-}"
shift 4 2>/dev/null || true

ESPERAR_FALHA=0
ROTULO=""
while [ $# -gt 0 ]; do
  case "$1" in
    --esperar-falha) ESPERAR_FALHA=1; shift ;;
    --rotulo) ROTULO="${2:-}"; shift 2 ;;
    *) echo "registrar-evidencia: opção desconhecida '$1'" >&2; exit 1 ;;
  esac
done

uso() {
  cat >&2 <<TXT
Uso: scripts/registrar-evidencia.sh <CHAVE> <FASE> <tarefa> "descrição" [opções]

  CHAVE     HN-XXX ou HT-XXX (a pasta docs/tasks/<CHAVE>/ precisa existir)
  FASE      PERCEBER | ORIENTAR | DECIDIR | AGIR | REGISTRAR
  tarefa    tarefa do harness (lint, test, test-unitario, gates, ...)
  descrição texto curto que vai para o progress.txt

Opções:
  --esperar-falha   inverte o veredito: exige que o comando FALHE.
                    É o passo do vermelho obrigatório do ciclo TDD.
  --rotulo <texto>  sufixo no nome do arquivo (ex.: vermelho, verde)
TXT
  exit 1
}

[ -z "${CHAVE}" ] && uso
[ -z "${FASE}" ] && uso
[ -z "${TAREFA}" ] && uso
[ -z "${DESCRICAO}" ] && uso

if ! echo "${CHAVE}" | grep -Eq '^(HN|HT)-[0-9]{3}$'; then
  echo "registrar-evidencia: chave inválida '${CHAVE}'. Use HN-XXX ou HT-XXX." >&2
  exit 1
fi

if ! echo "${FASE}" | grep -Eq '^(PERCEBER|ORIENTAR|DECIDIR|AGIR|REGISTRAR)$'; then
  echo "registrar-evidencia: fase inválida '${FASE}'." >&2
  exit 1
fi

PASTA_TASK="${RAIZ}/docs/tasks/${CHAVE}"
PROGRESSO="${PASTA_TASK}/progress.txt"

if [ ! -f "${PROGRESSO}" ]; then
  echo "registrar-evidencia: ${PROGRESSO} não existe." >&2
  echo "registrar-evidencia: rode scripts/nova-historia.sh ${CHAVE} antes." >&2
  exit 1
fi

PASTA_EVIDENCIA="${PASTA_TASK}/evidencia"
mkdir -p "${PASTA_EVIDENCIA}"

CARIMBO="$(date +%Y%m%d-%H%M%S)"
NOME="${CARIMBO}-${TAREFA}"
[ -n "${ROTULO}" ] && NOME="${NOME}-${ROTULO}"
ARQUIVO="${PASTA_EVIDENCIA}/${NOME}.txt"

HEAD_HASH="$(cd "${RAIZ}" && git rev-parse --short HEAD 2>/dev/null || echo "sem-git")"
if [ -n "$(cd "${RAIZ}" && git status --porcelain 2>/dev/null)" ]; then
  ARVORE="suja"
else
  ARVORE="limpa"
fi

{
  echo "# evidência de execução — ${CHAVE}"
  echo "# Gerado por scripts/registrar-evidencia.sh. Não editar à mão."
  echo "comando : scripts/harness.sh ${TAREFA}"
  echo "data    : $(date '+%Y-%m-%d %H:%M:%S %z')"
  echo "commit  : ${HEAD_HASH} (árvore ${ARVORE})"
  echo "sistema : $(uname -s 2>/dev/null || echo desconhecido)"
  echo "espera  : $([ "${ESPERAR_FALHA}" -eq 1 ] && echo 'FALHA (vermelho obrigatório)' || echo 'SUCESSO')"
  echo "---------------------------------------------------------------"
} > "${ARQUIVO}"

echo "registrar-evidencia: executando 'harness.sh ${TAREFA}'..."

set +e
( cd "${RAIZ}" && bash scripts/harness.sh "${TAREFA}" 2>&1 ) \
  | sed -e "s|${HOME}|~|g" -e "s|${RAIZ}|.|g" \
  | tee -a "${ARQUIVO}"
CODIGO="${PIPESTATUS[0]}"
set -e

{
  echo "---------------------------------------------------------------"
  echo "EXIT_CODE=${CODIGO}"
} >> "${ARQUIVO}"

if command -v sha256sum >/dev/null 2>&1; then
  echo "SHA256=$(sha256sum "${ARQUIVO}" | cut -d' ' -f1)" >> "${ARQUIVO}"
fi

# Veredito: com --esperar-falha, passar é o erro.
if [ "${ESPERAR_FALHA}" -eq 1 ]; then
  if [ "${CODIGO}" -eq 0 ]; then
    VEREDITO="VERDE INESPERADO"
    SAIDA=1
  else
    VEREDITO="VERMELHO ESPERADO"
    SAIDA=0
  fi
else
  if [ "${CODIGO}" -eq 0 ]; then
    VEREDITO="VERDE"
    SAIDA=0
  else
    VEREDITO="VERMELHO"
    SAIDA="${CODIGO}"
  fi
fi

CAMINHO_RELATIVO="docs/tasks/${CHAVE}/evidencia/${NOME}.txt"
printf '%s | %s | %s — harness %s exit %s (%s) | %s\n' \
  "$(date '+%Y-%m-%d %H:%M')" "${FASE}" "${DESCRICAO}" \
  "${TAREFA}" "${CODIGO}" "${VEREDITO}" "${CAMINHO_RELATIVO}" >> "${PROGRESSO}"

echo
echo "registrar-evidencia: ${VEREDITO} (exit ${CODIGO})"
echo "registrar-evidencia: evidência em ${CAMINHO_RELATIVO}"
echo "registrar-evidencia: linha acrescentada a docs/tasks/${CHAVE}/progress.txt"

if [ "${ESPERAR_FALHA}" -eq 1 ] && [ "${CODIGO}" -eq 0 ]; then
  echo "registrar-evidencia: o comando deveria ter falhado e passou." >&2
  echo "registrar-evidencia: não há verde a comemorar antes do vermelho." >&2
fi

exit "${SAIDA}"
