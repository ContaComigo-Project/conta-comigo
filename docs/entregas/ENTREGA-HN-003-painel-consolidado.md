---
name: entrega-hn-003
description: Documento de entrega da HN-003 — painel consolidado com dados sincronizados persistidos e regras financeiras no domínio.
document_type: delivery
story_key: HN-003
version: v0.19.0
max_lines: 300
---

# ENTREGA — `HN-003` — Painel consolidado de saldos, cartões e lançamentos

- **Data:** 2026-09-08
- **Tipo:** Negócio
- **Versão:** `v0.19.0`
- **Commit:** `d1b04acbc04a20c8bf8b2c30daae25d7d5800db8`
- **Tag:** `v0.19.0` → `d1b04acbc04a20c8bf8b2c30daae25d7d5800db8`

## O que foi entregue

- **Persistência da sincronização**: `SyncInstitution` (consent) agora persiste as
  contas externas (snapshot) e os lançamentos vindos do agregador, com
  **deduplicação por identificador externo** (RN-008).
- **Resumo consolidado** (`GET /dashboard/summary`): saldo total (soma das contas
  ativas — RN-009), fatura do cartão separada (RN-009), gastos/receitas do mês
  (RN-007: estorno nunca infla o gasto) e quantidade de lançamentos (RN-006:
  valores em centavos).
- **Contrato**: `ConsolidatedSummaryDTO` no `@contacomigo/contract`.
- Model `Transaction` ganhou `externalId` e a tabela `ExternalAccount` foi criada
  (migração).

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-008` — painel consolidado | `GET /dashboard/summary` com saldo total e por instituição | testes + API real |
| `RF-009` — lançamentos do mês | Métricas mensais em centavos, isoladas por titular | testes |
| `RN-006` | Valores em centavos, sem arredondamento intermediário | testes |
| `RN-007` | Estorno (crédito) nunca infla o gasto | testes |
| `RN-008` | Sincronização não duplica por identificador externo | testes |
| `RN-009` | Saldo = contas ativas; cartão como fatura separada | testes + API real |
| `RN-015` | Tudo isolado por titular | testes |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Sincronização não duplica (RN-008) | Aprovado | `in-memory-repository.test.ts` |
| Estorno anula o gasto (RN-007) | Aprovado | `consolidated-summary.test.ts` |
| Saldo total = contas ativas; cartão separado (RN-009) | Aprovado | `consolidated-summary.test.ts` + API |
| Lista do mês em centavos, ordenada (RF-009, RN-006) | Aprovado | testes + `GET /transactions` |
| Isolamento por titular (RN-015) | Aprovado | `consolidated-summary.test.ts` |

## Evidência de verificação

```
$ curl GET /dashboard/summary -H "Bearer <token>"
  → {"mes":{"ano":2026,"mes":9},"saldoTotalEmCentavos":1326045,
     "faturaDoCartaoEmCentavos":-87450,"gastosDoMesEmCentavos":0,
     "receitasDoMesEmCentavos":0,"quantidadeDeLancamentos":0}
```

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  30 passed (30)   Tests  166 passed (166)

$ pnpm run test:integration
 Test Files  2 passed (2)     Tests  9 passed (9)

$ pnpm run test:functional
 2 passed

$ pnpm run lint:boundaries
✔ no dependency violations found

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Refatoração feita após os funcionais verdes

Os testes afetados pelo novo campo `externalId` (Transaction) foram
padronizados; o `GetConsolidatedSummary` usa tipos locais do domínio (não o
contrato) para respeitar `domain-avoids-workspace-transport`.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | RN-006..009 provadas com teste; dedup e estorno cobertos |
| Segurança | `open-finance-security-agent` | Aprovado | Isolamento por titular (RN-015); dados persistidos sem credencial |
| SRE | `sre-agent` | Aprovado | Persistência e build verdes; integração no Postgres real |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Domínio limpo (sem contrato); portas por token; fronteiras intactas |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.19.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Persistir dados sincronizados na HN-003 | O painel precisa ler do banco (assíncrono) | Fonte de HN-004/005/007 |
| `ExternalAccount` com tipo separando cartão | RN-009 (fatura nunca soma no saldo) | Painel e semáforo futuros |
| Estorno tratado como crédito (não infla gasto) | Sem campo de estorno no agregador | RN-007 satisfeita pela soma com sinal |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| UI real do painel (trocar `FakeSource` por API) | Última milha da fronteira `data/` | Kanban — próxima integração de UI |
| Sem campo explícito de estorno no agregador | O provedor não expõe a marca | RN-007 por soma com sinal |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-003`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.19.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado