---
name: task-hn-005
description: Recorte executável de HN-005 — categoria automática por regra e IA em lote, com correção manual que prevalece sobre a sincronização.
document_type: task
applies_when:
  - executar a história HN-005
max_lines: 300
---

# TASK — `HN-005`

- **História:** `docs/backlog/historias/HN-005-categorizacao.md`
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Cada lançamento chega classificado, e a correção da pessoa é definitiva.

## Critérios de aceite copiados da história

- [ ] `category` preenchida ou `null` explícito no contrato
- [ ] Regras determinísticas classificam os casos declarados
- [ ] O que sobra vai à IA em um lote; o que ela não classificar fica não classificado
- [ ] Categoria fora do catálogo devolvida pelo modelo é descartada (`RNF-017`)
- [ ] `PATCH /transactions/:id/category` grava a correção como manual
- [ ] Corrigir lançamento de outro titular é negado (`RN-015`)
- [ ] Sincronizar de novo preserva a categoria manual (`RN-011`)
- [ ] Categoria inválida responde 400 sem gravar
- [ ] A tela permite corrigir e mostra o resultado
- [ ] `lint:boundaries`, `test:unit` e `test:integration` verdes

## Escopo desta task

**Dentro:** catálogo e regras de categoria no domínio, campo de categoria e de
origem na entidade e na tabela, caso de uso de categorização em lote, caso de
uso de correção manual, endpoint `PATCH`, preservação na sincronização e
correção pela tela.

**Fora:** limite por categoria (`HN-006`), semáforo (`HN-007`), criação de
categoria pela pessoa, reclassificação em massa do histórico.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/transactions/domain/model/category.ts` | criar | Catálogo e regras determinísticas, puras |
| `backend/src/transactions/domain/model/category.test.ts` | criar | Prova de `RF-011` |
| `backend/src/transactions/domain/model/transaction.ts` | alterar | `category` e `categoryOrigin` |
| `backend/src/transactions/application/categorize-transactions.ts` | criar | Regras mais lote de IA |
| `backend/src/transactions/application/correct-category.ts` | criar | Correção manual com barreira por titular |
| `backend/src/transactions/domain/port/driven/category-suggester.ts` | criar | Porta do sugeridor |
| `backend/src/transactions/infrastructure/ai/advisor-category-suggester.ts` | criar | Adaptador sobre a porta de IA |
| `backend/src/transactions/infrastructure/http/transactions.controller.ts` | alterar | `PATCH /transactions/:id/category` |
| `backend/src/transactions/infrastructure/persistence/*` | alterar | Persistir categoria e origem; preservar manual |
| `backend/prisma/schema.prisma` e migration | alterar | Colunas novas |
| `packages/contract/src/transaction.ts` | alterar | Corpo do `PATCH` |
| `frontend/src/...` | alterar | Correção pela lista |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HN-004` — descrição legível | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
