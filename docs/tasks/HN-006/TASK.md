---
name: task-hn-006
description: Recorte executável de HN-006 — limite mensal por categoria persistido por titular, com definição, edição e remoção.
document_type: task
applies_when:
  - executar a história HN-006
max_lines: 300
---

# TASK — `HN-006`

- **História:** `docs/backlog/historias/HN-006-limite-mensal.md`
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

O limite que a pessoa define continua lá amanhã, por mês e por categoria.

## Critérios de aceite copiados da história

- [ ] `PUT /budgets/:month/:category` grava o limite do titular
- [ ] `DELETE /budgets/:month/:category` volta ao estado sem limite (`RN-002`)
- [ ] `GET /budgets/:month` lista só os limites do titular (`RN-015`)
- [ ] Definir de novo substitui, sem duplicar
- [ ] Valor não inteiro, negativo ou acima do teto responde 400 sem gravar
- [ ] Mês inválido e categoria fora do catálogo respondem 400
- [ ] Limite de um titular não aparece para outro, provado no PostgreSQL
- [ ] O limite viaja em centavos (`RN-006`)
- [ ] `lint:boundaries`, `test:unit` e `test:integration` verdes

## Escopo desta task

**Dentro:** modelo de limite e validação no domínio de `budget`, porta e
repositório Prisma, casos de uso de definir, remover e listar, endpoints,
contrato e migração.

**Fora:** semáforo e aviso (`HN-007`), sugestão de limite, cópia entre meses,
ligação da tela de despesas (que ainda lê mocks — `HT-018`).

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/budget/domain/model/monthly-limit.ts` | criar | Mês de referência, valor e validação, puros |
| `backend/src/budget/domain/model/monthly-limit.test.ts` | criar | Prova de `RN-002` e `RN-006` |
| `backend/src/budget/domain/port/driven/budget-repository.ts` | criar | Porta de persistência |
| `backend/src/budget/domain/port/driven/tokens.ts` | criar | Tokens de injeção |
| `backend/src/budget/application/set-monthly-limit.ts` | criar | Definir e substituir |
| `backend/src/budget/application/remove-monthly-limit.ts` | criar | Remover (`RN-002`) |
| `backend/src/budget/application/list-monthly-limits.ts` | criar | Listar do titular |
| `backend/src/budget/infrastructure/persistence/*` | criar | Adaptadores em memória e Prisma |
| `backend/src/budget/infrastructure/http/budget.controller.ts` | criar | Os três endpoints |
| `backend/src/budget/budget.module.ts` | criar | Wiring |
| `backend/prisma/schema.prisma` e migration | alterar | Tabela de limites |
| `packages/contract/src/budget.ts` | alterar | DTO de limite |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HN-005` — categorias no domínio | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
