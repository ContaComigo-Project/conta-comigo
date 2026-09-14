#!/usr/bin/env bash
# Auditoria de Integridade e Governança do Repositório (Bash)
# Varre .agents/ e docs/ verificando conformidade com as regras inegociáveis:
#   1. Limite de 300 linhas por artefato (.agents/{skills,rules,prompts}/*.md)
#   2. Estrutura 1 pasta = 1 artefato (SKILL.md, RULE.md, PROMPT.md)
#   3. Frontmatter YAML válido (name, description)
#   4. Links internos Markdown quebrados em docs/ e .agents/
# Uso: scripts/auditar-repositorio.sh

set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${RAIZ}"

FALHAS=0
AVISOS=0
CHECKS=0

falhar() { echo "  [FALHA] $1" >&2; FALHAS=$((FALHAS + 1)); }
avisar() { echo "  [AVISO] $1" >&2; AVISOS=$((AVISOS + 1)); }
passar() { echo "  [OK]    $1"; }

echo "=== Auditoria de Governanca do Repositorio ContaComigo ==="
echo "Raiz: ${RAIZ}"
echo

# 1. Limite de Linhas (Regra 12b: <= 300 linhas)
echo "1. Verificando limite de 300 linhas em artefatos de agentes..."
ARTEFATOS_EXCEDENTES=0
while IFS= read -r ARQUIVO; do
  [ -z "${ARQUIVO}" ] && continue
  CHECKS=$((CHECKS + 1))
  LINHAS=$(wc -l < "${ARQUIVO}")
  if [ "${LINHAS}" -gt 300 ]; then
    falhar "Limite de linhas excedido: ${ARQUIVO} (${LINHAS} linhas > 300)"
    ARTEFATOS_EXCEDENTES=$((ARTEFATOS_EXCEDENTES + 1))
  fi
done < <(find .agents -type f -name "*.md" ! -path "*/assets/*")

if [ "${ARTEFATOS_EXCEDENTES}" -eq 0 ]; then
  passar "Todos os artefatos de agentes estao dentro do limite de 300 linhas."
fi

# 2. Estrutura de Artefatos (Regra 7: 1 pasta = 1 artefato)
echo
echo "2. Verificando padronizacao de nomes de arquivos principais..."
for P in .agents/skills/*; do
  [ -d "${P}" ] || continue
  [ "$(basename "${P}")" = "assets" ] && continue
  CHECKS=$((CHECKS + 1))
  if [ ! -f "${P}/SKILL.md" ]; then
    falhar "Pasta de skill '${P}' nao possui SKILL.md"
  fi
done

for P in .agents/rules/*; do
  [ -d "${P}" ] || continue
  [ "$(basename "${P}")" = "assets" ] && continue
  CHECKS=$((CHECKS + 1))
  if [ ! -f "${P}/RULE.md" ]; then
    falhar "Pasta de rule '${P}' nao possui RULE.md"
  fi
done

for P in .agents/prompts/*; do
  [ -d "${P}" ] || continue
  [ "$(basename "${P}")" = "assets" ] && continue
  CHECKS=$((CHECKS + 1))
  if [ ! -f "${P}/PROMPT.md" ]; then
    falhar "Pasta de prompt '${P}' nao possui PROMPT.md"
  fi
done
passar "Estruturas de pastas em .agents/ validada com sucesso."

# 3. Integridade de Frontmatters
echo
echo "3. Verificando presenca de frontmatters basicos (name, description)..."
FRONTMATTER_ERROS=0
while IFS= read -r ARQUIVO; do
  [ -z "${ARQUIVO}" ] && continue
  CHECKS=$((CHECKS + 1))
  if ! head -n 1 "${ARQUIVO}" | grep -q '^---$'; then
    falhar "Frontmatter invalido (nao inicia com ---): ${ARQUIVO}"
    FRONTMATTER_ERROS=$((FRONTMATTER_ERROS + 1))
  elif ! grep -q '^name:' "${ARQUIVO}" || ! grep -q '^description:' "${ARQUIVO}"; then
    falhar "Frontmatter incompleto (falta name ou description): ${ARQUIVO}"
    FRONTMATTER_ERROS=$((FRONTMATTER_ERROS + 1))
  fi
done < <(find .agents -type f \( -name "SKILL.md" -o -name "RULE.md" -o -name "PROMPT.md" \))

if [ "${FRONTMATTER_ERROS}" -eq 0 ]; then
  passar "Todos os artefatos principais possuem frontmatter YAML basico."
fi

# 4. Integridade de Links Internos Markdown
echo
echo "4. Verificando links internos Markdown em docs/ e .agents/..."
LINKS_QUEBRADOS=0
while IFS= read -r DOC; do
  [ -z "${DOC}" ] && continue
  DIRDOC="$(dirname "${DOC}")"
  # Extrai destinos [texto](destino.md) ignorando http/https
  while IFS= read -r TARGET; do
    [ -z "${TARGET}" ] && continue
    # Ignora links externos
    if [[ "${TARGET}" =~ ^https?:// ]]; then continue; fi
    # Remove fragmento #ancora
    CLEAN_PATH="${TARGET%%#*}"
    [ -z "${CLEAN_PATH}" ] && continue

    CHECKS=$((CHECKS + 1))
    RESOLVED_PATH="${DIRDOC}/${CLEAN_PATH}"
    if [ ! -f "${RESOLVED_PATH}" ] && [ ! -d "${RESOLVED_PATH}" ]; then
      falhar "Link quebrado em ${DOC} -> ${TARGET}"
      LINKS_QUEBRADOS=$((LINKS_QUEBRADOS + 1))
    fi
  done < <(grep -oE '\[[^]]+\]\([^)]+\.md\)' "${DOC}" | sed -E 's/.*\]\(([^)]+)\)/\1/' || true)
done < <(find docs .agents -type f -name "*.md")

if [ "${LINKS_QUEBRADOS}" -eq 0 ]; then
  passar "Nenhum link interno Markdown quebrado encontrado."
fi

# 5. Resultado
echo
echo "======================================================="
echo "Total de checagens executadas: ${CHECKS}"
if [ "${FALHAS}" -eq 0 ]; then
  echo "AUDITORIA APROVADA: Repositorio 100% aderente a governanca! (${AVISOS} avisos)"
  exit 0
fi

echo "AUDITORIA REPROVADA: ${FALHAS} inconsistencia(s) encontrada(s)." >&2
exit 1
