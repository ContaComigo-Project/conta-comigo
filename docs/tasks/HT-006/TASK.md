---
name: task-ht-006
description: Recorte executável da infraestrutura de testes — escopo concreto, arquivos afetados e critério de parada.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-006`

- **História:** [`docs/backlog/historias-tecnicas/HT-006-infraestrutura-de-testes.md`](../../backlog/historias-tecnicas/HT-006-infraestrutura-de-testes.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

`scripts/harness.sh gates` fecha verde de ponta a ponta, e um teste permanente
prova que a checagem de fronteiras de `ADR-001` reprova código ilegal.

## Critérios de aceite copiados da história

- [x] `scripts/harness.sh gates` retorna sucesso de ponta a ponta
- [x] `lint` executa o dependency-cruiser sobre `backend/` e `frontend/src`
- [x] `test-unitario` executa o Vitest e lista os cenários de `tests/fronteiras/`
- [x] `test-funcional` executa o Playwright em Chromium contra a web real
- [x] `coverage` emite relatório com o domínio como alvo
- [x] Falha esperada: dependency-cruiser sobre `fixtures/violacao` sai ≠ 0 nomeando regra e arquivo
- [x] Falha esperada: enfraquecer uma regra para `info` deixa o teste de fronteiras vermelho
- [x] Vermelho registrado antes do código
- [x] Evidência registrada por `scripts/registrar-evidencia.sh`

## Escopo desta task

**Dentro:** instalação de Vitest, `@vitest/coverage-v8`, Playwright e
dependency-cruiser na raiz; `vitest.config.ts`, `playwright.config.ts`,
`.dependency-cruiser.cjs` e a fábrica de regras em `tooling/fronteiras/`;
fixtures legal e ilegal em `tests/fronteiras/fixtures/`; teste de fronteiras;
cenário de fumaça Playwright sobre a web; preenchimento das quatro variáveis
de teste em `scripts/harness.env`; Chromium no `setup`; correção de
`EPICO-TECNICO.md` §5 e do nome da tarefa em `ADR-003`.

**Fora:** código de backend (`HT-009`); cenários `RN-XXX` (histórias de
negócio); CI (`HT-007`); cobertura da web (`HT-017`).

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `package.json` (raiz) | alterar | devDependencies e scripts de teste |
| `vitest.config.ts` | criar | Executor unitário e cobertura com alvo no domínio |
| `playwright.config.ts` | criar | Chromium, `webServer` do frontend |
| `.dependency-cruiser.cjs` | criar | Config de produção, exclui fixtures |
| `tooling/fronteiras/regras.cjs` | criar | Fábrica de regras parametrizada pela raiz |
| `tooling/fronteiras/fixtures.cjs` | criar | Config apontando para as fixtures |
| `tests/fronteiras/fixtures/**` | criar | Árvores legal e ilegal |
| `tests/fronteiras/fronteiras.test.ts` | criar | Prova de que o gate bloqueia |
| `tests/funcional/fumaca.spec.ts` | criar | Cenário de fumaça na web |
| `tsconfig.json` (raiz) | criar | Exclui fixtures e `node_modules` do type-check |
| `scripts/harness.env` | alterar | Quatro tarefas de teste preenchidas; lint com fronteiras |
| `docs/backlog/EPICO-TECNICO.md` | alterar | §5 nomeia as ferramentas |
| `docs/adr/ADR-003-testes-vitest-playwright.md` | alterar | `test-unit` → `test-unitario` |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-005` — harness | Done (`v0.7.0`) | Não |
| Docker de pé (Postgres no `setup`) | Verificado | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
