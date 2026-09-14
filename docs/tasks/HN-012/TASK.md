---
name: task-hn-012
description: Recorte executável da história HN-012 — revogar consentimento com exclusão agendada (≤24h) e excluir conta com todos os dados.
document_type: task
applies_when:
  - executar a história HN-012
max_lines: 300
---

# TASK — `HN-012`

- **História:** [`docs/backlog/historias/HN-012-revogar-consentimento-e-excluir-conta.md`](../../backlog/historias/HN-012-revogar-consentimento-e-excluir-conta.md)
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Revogar consentimento (saída imediata do painel + exclusão definitiva agendada em até 24h) e excluir a conta com todo o dado pessoal e financeiro, sempre isolado por titular.

## Critérios de aceite copiados da história

- [ ] Revogar tira do painel imediatamente (RN-013) e agenda exclusão ≤24h
- [ ] Só o próprio titular revoga (RN-015), teste negativo
- [ ] Excluir conta apaga conta, sessões, consentimentos e transações (RN-016/RF-025)
- [ ] Excluir conta de outro titular é negado (RN-015)
- [ ] Refresh token deixa de funcionar após exclusão

## Escopo desta task

**Dentro:** consent (deletionScheduledAt + revoke agendado + purgeDue + deleteByHolder), access (DeleteAccount + endpoint), transactions (deleteByHolder), migração, testes.
**Fora:** UI real (HN-003), job de purge em background (HT-012), exportação pré-exclusão.

## Critério de parada

Suíte verde (unit + integração + fronteiras) + testes negativos por titular + critérios com evidência.