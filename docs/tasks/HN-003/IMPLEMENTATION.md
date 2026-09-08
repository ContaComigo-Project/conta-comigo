---
name: implementation-hn-003
description: Plano técnico da história HN-003 — persistir sincronização com dedup e resumo consolidado no domínio.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HN-003
max_lines: 300
---

# IMPLEMENTATION — `HN-003`

- **Requisitos ligados:** `RF-008`, `RF-009` · `RN-006`, `RN-007`, `RN-008`, `RN-009`, `RN-015` · `RNF-019`
- **Versão prevista:** `v0.19.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

1. **Transaction**: campo `externalId` (identificador do agregador) + migração.
   `TransactionRepository.salvarSincronizados(itens, holderId)` deduplica por
   (holderId, externalId) — RN-008.
2. **ExternalAccount**: entidade + tabela + repositório (salvar + listar por
   holder, RN-015). Tipo distingue conta ativa (corrente/poupança) de cartão.
3. **SyncInstitution** (consent): passa a persistir contas e lançamentos vindos
   do agregador via portas injetadas.
4. **ConsolidatedSummary** (transactions): saldo total = soma das contas ativas
   (RN-009), fatura do cartão separada, métricas do mês (gastos/receitas) e
   quantidade — com estorno anulando (RN-007). Endpoint `GET /dashboard/summary`
   + `ConsolidatedSummaryDTO` no contract.
5. Testes unit (regras) + integração (Prisma).

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Recalcular saldo do sync em memória (sem persistir) | O painel é assíncrono; precisa ler do banco |
| Sem dedup no repositório | RN-008 exige unicidade no dado persistido |

## 3. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenários BDD/unit: dedup, estorno, saldo RN-009, lista mensal, isolamento | Vermelho antes do código |
| 2 | Implementar | Verdes |
| 3 | Integração Prisma | Verde |
| 4 | Suíte completa + fronteiras | Verdes |

## 4. Gates

QA (RN-006..009), Segurança (RN-015), SRE (persistência), Arquitetura (domínio), Revisão final.

## 5. Riscos

Duplicidade (dedup por externalId), saldo misturando cartão (RN-009 por tipo).

## 6. Fechamento

- Commit: `feat(transactions): persist synced data and consolidate panel (HN-003)`
- Tag: `v0.19.0`