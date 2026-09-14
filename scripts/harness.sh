#!/usr/bin/env bash
# Harness local — um comando por tarefa, o mesmo local e em CI.
# Os comandos reais vivem em scripts/harness.env (ver harness.env.example).
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARQUIVO_ENV="${RAIZ}/scripts/harness.env"

TAREFAS="setup down build lint test-funcional test-unitario test-integracao test coverage security run gates"

uso() {
  cat <<TXT
Uso: scripts/harness.sh <tarefa>

Tarefas:
  setup           prepara o ambiente em máquina limpa
  down            derruba e limpa o ambiente local
  build           compila / empacota
  lint            análise estática e formatação
  test-funcional  testes funcionais / BDD
  test-unitario   testes unitários
  test-integracao testes de integração (precisam do PostgreSQL do compose)
  test            suíte completa
  coverage        relatório de cobertura
  security        verificação de segurança
  run             executa a aplicação localmente
  gates           lint + test + coverage + security, na ordem, parando no primeiro erro

Configuração: copie scripts/harness.env.example para scripts/harness.env
e preencha os comandos do projeto (história HT-005).
TXT
}

carregar_env() {
  if [ ! -f "${ARQUIVO_ENV}" ]; then
    echo "harness: scripts/harness.env não existe." >&2
    echo "harness: copie scripts/harness.env.example e preencha os comandos." >&2
    exit 2
  fi
  # shellcheck disable=SC1090
  . "${ARQUIVO_ENV}"
}

executar() {
  local nome_variavel="$1"
  local comando="${!nome_variavel:-}"

  if [ -z "${comando}" ]; then
    echo "harness: comando não configurado (${nome_variavel})." >&2
    echo "harness: defina-o em scripts/harness.env antes de usar esta tarefa." >&2
    exit 3
  fi

  echo "harness: ${nome_variavel} -> ${comando}"
  ( cd "${RAIZ}" && eval "${comando}" )
}

gates() {
  echo "harness: executando gates na ordem — falha no primeiro erro"
  executar HARNESS_LINT
  executar HARNESS_TEST
  executar HARNESS_COVERAGE
  executar HARNESS_SECURITY
  echo "harness: gates concluídos"
}

tarefa="${1:-}"
case "${tarefa}" in
  setup)          carregar_env; executar HARNESS_SETUP ;;
  down)           carregar_env; executar HARNESS_DOWN ;;
  build)          carregar_env; executar HARNESS_BUILD ;;
  lint)           carregar_env; executar HARNESS_LINT ;;
  test-funcional) carregar_env; executar HARNESS_TEST_FUNCTIONAL ;;
  test-unitario)  carregar_env; executar HARNESS_TEST_UNIT ;;
  test-integracao) carregar_env; executar HARNESS_TEST_INTEGRATION ;;
  test)           carregar_env; executar HARNESS_TEST ;;
  coverage)       carregar_env; executar HARNESS_COVERAGE ;;
  security)       carregar_env; executar HARNESS_SECURITY ;;
  run)            carregar_env; executar HARNESS_RUN ;;
  gates)          carregar_env; gates ;;
  ""|-h|--help|help) uso ;;
  *) echo "harness: tarefa desconhecida '${tarefa}'. Válidas: ${TAREFAS}" >&2; exit 1 ;;
esac
