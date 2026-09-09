---
name: entrega-ht-018-parte-2
description: Documento de entrega da parte 2 da HT-018 — páginas de despesas e os últimos consumidores de mock do overview passam a consumir o backend real; nenhuma tela lê mock.
document_type: delivery
story_key: HT-018
version: v0.33.0
max_lines: 300
---

# ENTREGA — `HT-018` — Fechamento da fronteira (parte 2)

- **Data:** 2026-09-09
- **Tipo:** Técnica
- **Versão:** `v0.33.0`
- **Commit:** `b6825ea4fe1f47f3c93e83ae14260c123bff6ab8`
- **Tag:** `v0.33.0` → `b6825ea4fe1f47f3c93e83ae14260c123bff6ab8`

## O que foi entregue

Continuação da `HT-018` (a parte 1 fechou as superfícies de IA, exportação e o
semáforo do overview). Esta parte liga **as páginas de despesas e os últimos
consumidores de mock** ao backend real.

| Superfície | Antes (mock) | Depois (real) |
| --- | --- | --- |
| `use-expenses-state` | `BUDGET_BY_MONTH`/`TRANSACTIONS_BY_MONTH`/`MONTHS`, `resolveStatus`, `recomputeCategory` | `GET /budgets/history` + `GET /budgets/semaphore` + `GET /transactions`; faixas prontas (RN-001) |
| Edição de limite | `overrides` locais (sem persistir) | `PUT /budgets/:month/:category` + reload |
| Remover limite | inexistente | `DELETE /budgets/:month/:category` |
| `HistoricalOverview` | ranking recalculado no front | `problemas` do `GET /budgets/history` (RN-023) |
| `TransactionsListView` | mock + `onCorrigirCategoria` nunca ligado | transações reais + `PATCH /transactions/:id/category` ligado |
| `SpendingChart` | `mockSpendingCategories` | agregado das transações reais |
| `WelcomeHeader`/`use-profile` | `mockUser` (nome real) | perfil real; fallback local fictício |
| `CategoryCard`/`MonthPicker`/`QuickFilterBar`/`Expenses` | `BUDGET_STATUS_META`/`resolveStatus`/`MonthSlug` | faixa `Band` do backend + meses reais `AAAA-MM` |

## Código e arquivos em inglês

Toda a parte 2 foi escrita em inglês (`band.ts`, `monthInfo`, `toCategory`,
`CategoryOfMonth`, `MonthSummary`, `applyDraft`, `removeLimit`...), conforme
`HT-020`. Apenas as strings de UI permanecem em PT-BR.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RN-001` | Faixa exibida vem do backend (`band`), sem limiar no front | `band.ts` + hook |
| `RF-013` (limite por categoria) | Edição persiste via `PUT`, remoção via `DELETE` | hook + API |
| `RF-012` (correção manual) | Seletor ligado ao `PATCH` real | `TransactionsListView` |
| `RN-023` | Ranking vem pronto do histórico | `HistoricalOverview` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Nenhuma página importa de `mocks/` | Aprovado | grep: só `data/` de teste referencia mocks |
| `resolveStatus`/`recomputeCategory`/`BUDGET_RULES` removidos | Aprovado | arquivos removidos |
| Edição de limite persiste no backend | Aprovado | `PUT`/`DELETE` validados na API |
| Código em inglês | Aprovado | `band.ts`, hook e componentes |

## Evidência de verificação

```
$ pnpm --filter client-contacomigo build  → ✓ built
$ pnpm run test:unit        → 314 passed
$ pnpm run test:integration → 22 passed
$ pnpm run test:functional  → 3 passed (Playwright)
$ pnpm run build            → ✓ built
$ pnpm run lint:boundaries  → sem violações
$ auditar-repositorio.sh    → 100%

$ curl PUT /budgets/2026-01/moradia -d '{"limiteEmCents":1200000}' → {"estado":"ok",...}
$ curl DELETE /budgets/2026-01/moradia → 204
```

## O que ainda referencia mock (resumo honesto)

Após a parte 2, **nenhuma tela/página importa de `mocks/`**. O que resta são
apenas três arquivos de **dado sintético de teste** consumidos pelo data-layer
falso da porta (`FakeSource`) e pelo teste de equivalência da `HT-017`:

- `frontend/src/mocks/spending-categories.mock.ts`
- `frontend/src/mocks/transactions.mock.ts`
- `frontend/src/mocks/connected-banks.mock.ts`

Referenciados por `data/fake-source.ts` (implementação falsa da porta, usada em
ambiente de teste) e `data/equivalence.test.ts` (prova o mapper). Isso é
intencional (ADR-001: todo adaptador externo tem um falso para teste) e
**nenhuma integração real com o backend fica pendente por causa de mock**.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Functional verde; fluxos reais; ranking do backend |
| Segurança | `open-finance-security-agent` | Aprovado | Só token Bearer; sem identidade real no front |
| SRE | `sre-agent` | Aprovado | Persistência validada; degradação tratada |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Fronteira fechada; código EN; regra fora do front |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.33.0`) |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HT-018`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.33.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado