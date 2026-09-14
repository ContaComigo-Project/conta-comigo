---
name: task-hn-004
description: Recorte executável de HN-004 — descrição legível derivada do lançamento, com regras determinísticas, IA em lote como último recurso e original preservado.
document_type: task
applies_when:
  - executar a história HN-004
max_lines: 300
---

# TASK — `HN-004`

- **História:** `docs/backlog/historias/HN-004-descricao-legivel.md`
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

A lista de lançamentos passa a mostrar o que a pessoa reconhece, sem perder o
texto original do agregador.

## Critérios de aceite copiados da história

- [ ] `GET /transactions` devolve `description` legível e `descriptionOriginal`
- [ ] Regras determinísticas cobrem prefixo de adquirente, parcela, código e caixa alta
- [ ] Não reconhecido mantém o original, sem inventar (`RN-010`)
- [ ] Valor, data e identificador não mudam
- [ ] IA é chamada uma vez por lote, nunca por lançamento (`RNF-009`)
- [ ] Provedor fora do ar não derruba a lista (`RNF-005`, `RN-021`)
- [ ] Nenhum valor monetário vai para o provedor (`RN-019`, `RNF-015`)
- [ ] A tela exibe a legível e mantém a original acessível
- [ ] `lint:boundaries`, `test:unit`, `test:integration` e `test:functional` verdes

## Escopo desta task

**Dentro:** regras de limpeza no domínio de `transactions`, campo derivado na
entidade e na persistência, caso de uso que aplica regras e, para o que sobrar,
uma chamada de IA em lote, tradução no DTO, exibição na lista.

**Fora:** categoria (`HN-005`), edição manual da descrição, reprocessamento em
massa do histórico.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/transactions/domain/model/readable-description.ts` | criar | Regras determinísticas, puras |
| `backend/src/transactions/domain/model/readable-description.test.ts` | criar | Prova de `RF-010` e `RN-010` |
| `backend/src/transactions/domain/model/transaction.ts` | alterar | Campo derivado `readableDescription` |
| `backend/src/transactions/application/make-descriptions-readable.ts` | criar | Caso de uso: regras, lote de IA, fallback |
| `backend/src/transactions/application/make-descriptions-readable.test.ts` | criar | Prova do lote e da degradação |
| `backend/src/transactions/domain/port/driven/description-translator.ts` | criar | Porta do tradutor (implementada sobre a IA) |
| `backend/src/transactions/infrastructure/ai/advisor-description-translator.ts` | criar | Adaptador sobre a porta de `intelligence` |
| `backend/src/transactions/infrastructure/http/transaction.dto.ts` | alterar | `descriptionOriginal` no transporte |
| `backend/src/transactions/infrastructure/persistence/*` | alterar | Coluna derivada |
| `backend/prisma/schema.prisma` + migration | alterar | `readable_description` |
| `frontend/src/...TransactionsListView` | alterar | Exibir a legível, manter a original acessível |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HN-003` — painel consolidado | Done | Não |
| `HT-013` / `HT-014` — porta de IA e guarda | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
