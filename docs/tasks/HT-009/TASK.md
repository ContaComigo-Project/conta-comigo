---
name: task-ht-009
description: Recorte executável do esqueleto hexagonal do backend — um contexto de exemplo atravessando todas as camadas, verificado pelo gate de fronteiras.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-009`

- **História:** [`docs/backlog/historias-tecnicas/HT-009-esqueleto-backend-hexagonal.md`](../../backlog/historias-tecnicas/HT-009-esqueleto-backend-hexagonal.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

`backend/src/lancamentos/` existe com domínio, portas, caso de uso, controller
e adaptador falso, ligado por token, executável, e a primeira regra de domínio
(`RN-003`, mês de referência) roda sem banco, HTTP ou framework.

## Critérios de aceite copiados da história

- [x] Estrutura por contexto de `ADR-001` com um contexto atravessando todas as camadas
- [x] Entidade de domínio, porta de entrada, porta de saída, caso de uso, controller e adaptador de persistência falso
- [x] `<contexto>.module.ts` liga porta a adaptador por **token**
- [x] Nenhuma entidade de domínio tem decorator
- [x] Porta `Relogio` com implementação real e fixa para teste
- [x] Checagem de fronteiras roda em `harness lint`
- [x] A checagem bloqueia: existe teste que prova (herdado de `HT-006`, estendido ao código real)
- [x] Caso de uso com teste sem banco, HTTP ou framework, < 1 s

## Escopo desta task

**Dentro:** contexto `lancamentos`; entidade `Lancamento`; regra
`mesDeReferencia` (`RN-003`, fuso de São Paulo); portas `ConsultarResumoDoMes`
(entrada), `RepositorioDeLancamentos` e `Relogio` (saída); caso de uso;
`RepositorioDeLancamentosEmMemoria`; `RelogioDoSistema` e `RelogioFixo`;
controller `GET /lancamentos/resumo-do-mes`; `lancamentos.module.ts` e
`app.module.ts`/`main.ts`; teste que proíbe decorator em `domain/` (fecha a
dívida de `HT-006`); `backend/tsconfig.json`; scripts de build e execução.

**Fora:** persistência real (`HT-010`); qualquer outra RN; Pluggy/Gemini
(`HT-011`, `HT-013`); autenticação (`HN-001`); contrato com a web (`HT-017`).

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/package.json`, `backend/tsconfig.json` | alterar/criar | Deps NestJS fixadas; decorators habilitados |
| `backend/src/lancamentos/domain/model/lancamento.ts` | criar | Entidade sem decorator |
| `backend/src/lancamentos/domain/mes-de-referencia.ts` | criar | `RN-003` pura |
| `backend/src/lancamentos/domain/port/entrada/consultar-resumo-do-mes.ts` | criar | Porta driving |
| `backend/src/lancamentos/domain/port/saida/{repositorio-de-lancamentos,relogio,tokens}.ts` | criar | Portas driven e símbolos de injeção |
| `backend/src/lancamentos/application/consultar-resumo-do-mes.ts` | criar | Caso de uso |
| `backend/src/lancamentos/infrastructure/persistence/repositorio-em-memoria.ts` | criar | Adaptador falso |
| `backend/src/lancamentos/infrastructure/relogio/{relogio-do-sistema,relogio-fixo}.ts` | criar | Implementações da porta |
| `backend/src/lancamentos/infrastructure/http/lancamentos.controller.ts` | criar | Adaptador de entrada |
| `backend/src/lancamentos/lancamentos.module.ts`, `backend/src/app.module.ts`, `backend/src/main.ts` | criar | Wiring por token e bootstrap |
| `backend/src/lancamentos/**/*.test.ts` | criar | Domínio, caso de uso e HTTP |
| `tests/fronteiras/sem-decorator-no-dominio.test.ts` | criar | Regra adicional 1 de `ADR-001` |
| `package.json` (raiz) | alterar | `build` inclui typecheck do backend |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-006` — Vitest, dependency-cruiser, cobertura armada | Done (`v0.8.0`) | Não |
| `HT-004` — NestJS decidido | Done (`v0.5.0`) | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
