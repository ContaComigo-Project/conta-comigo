---
name: entrega-ht-007-mock-e2e
description: Entrega parcial da HT-007 — testes funcionais determinísticos no CI com o mock da API alinhado ao contrato real.
document_type: delivery
story_key: HT-007
version: v0.41.0
max_lines: 200
---

# ENTREGA — `HT-007` — Mock e2e alinhado ao contrato (incremento)

- **Data:** 2026-09-10
- **Tipo:** Técnica
- **Versão:** `v0.41.0`
- **Commit:** `a944b7c`
- **Tag:** `v0.41.0` → `a944b7c`

## O que foi entregue

Incremento da `HT-007` (pipeline de CI): os testes funcionais do Playwright
passam a usar um mock da API **alinhado ao contrato real** (`@contacomigo/contract`).

- `tests/functional/mock-api.ts` reescrito: toda resposta segue os DTOs atuais
  (`SessionDTO`, `AccountProfileDTO`, `ConsolidatedSummaryDTO`,
  `Result<TransactionDTO[]>`, `BudgetSemaphoreDTO`, `BudgetHistoryDTO`,
  `DiagnosisDTO`, `ChatRespostaDTO`, `ConsentDTO`) e é **validada com o
  `safeParse`** do DTO antes de ser devolvida — se o mock divergir do contrato,
  o teste falha em vez de passar com dado errado.
- Corrigido o `AccountProfileDTO` (era `strict`, o `createdAt` extra fazia o
  `safeParse` do perfil falhar).
- O diagnóstico `ok` fez o `AIInsightPanel` exibir o aviso RN-018; o spec do
  consultor-ia foi escopado ao widget (`first()`).

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Mock segue o contrato real | Aprovado | respostas validadas por DTO |
| e2e rodam sem backend/banco no CI | Aprovado | 17 testes funcionais, ~10s |
| Divergência de mock falha o teste | Aprovado | `safeParse` lança erro |

## Evidência

```
$ pnpm run test:functional
  17 passed (10.7s)

$ pnpm run test:unit        → 351 passed
$ pnpm run test:integration → 29 passed
$ auditoria                 → 100%
```

## Pendência da `HT-007`

A entrega **formal** da HT-007 (proteção de branch no GitHub + PR de prova)
permanece dependente de ação humana — ver `KANBAN-OFICIAL.md`.

## Verificação de fechamento

- [x] Testes e gates aplicáveis verdes
- [x] Commit semântico contém a chave `HT-007`
- [x] Tag `v0.41.0` aponta para o mesmo hash do commit