---
name: task-hn-003
description: Recorte executável da história HN-003 — persistir a sincronização (dedup/estorno) e entregar o resumo consolidado (RF-008/009, RN-006..009).
document_type: task
applies_when:
  - executar a história HN-003
max_lines: 300
---

# TASK — `HN-003`

- **História:** [`docs/backlog/historias/HN-003-painel-consolidado.md`](../../backlog/historias/HN-003-painel-consolidado.md)
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Persistir os dados sincronizados (lançamentos com dedup por identificador externo e contas) e entregar o resumo consolidado do painel com as regras financeiras no domínio.

## Critérios de aceite copiados da história

- [ ] Sincronização não duplica lançamentos (RN-008)
- [ ] Estorno anula o lançamento original no gasto (RN-007)
- [ ] Saldo total = soma das contas ativas; cartão é fatura separada (RN-009)
- [ ] Lista de lançamentos do mês em centavos, ordenada (RF-009, RN-006)
- [ ] Tudo isolado por titular (RN-015)

## Escopo desta task

**Dentro:** externalId no Transaction (migração), repositório com `salvarSincronizados` (dedup), tabela ExternalAccount (migração), persistência no SyncInstitution, `ConsolidatedSummary` (RN-009) + endpoint + DTO.
**Fora:** UI real (ApiSource), HN-004/005.

## Critério de parada

Suíte verde (unit + integração + fronteiras) + regras RN-006..009 provadas + critérios com evidência.