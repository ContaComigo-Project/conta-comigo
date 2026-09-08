---
name: entrega-hn-012
description: Documento de entrega da HN-012 — revogar consentimento (exclusão agendada em até 24h) e excluir conta com todos os dados.
document_type: delivery
story_key: HN-012
version: v0.18.0
max_lines: 300
---

# ENTREGA — `HN-012` — Revogar consentimento e excluir conta e dados

- **Data:** 2026-09-08
- **Tipo:** Negócio
- **Versão:** `v0.18.0`
- **Commit:** `[preenchido no fechamento]`
- **Tag:** `v0.18.0` → `[mesmo hash]`

## O que foi entregue

- **Revogação (RF-006/RN-013):** `DELETE /consents/:id` revoga imediatamente (a
  instituição sai da lista de conectadas) e agenda a **exclusão definitiva em até
  24h** (`deletionScheduledAt`). `ConsentRepository.purgeDue(agora)` apaga os
  consents vencidos.
- **Exclusão da conta (RF-025/RN-016):** `DELETE /consents/account` apaga conta,
  sessões, consentimentos e transações do titular — nada recuperável.
- **Isolamento (RN-015):** revogar e excluir são sempre do próprio titular;
  recurso alheio → 404/negação (testes negativos).
- **Decisão de produto resolvida:** prazo de exclusão definitiva = **até 24h**
  (`SDD-001` §7 atualizada).
- Persistência: migração `consent_deletion_scheduled` (coluna de agendamento).

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-006` — revogar consentimento | `DELETE /consents/:id` → revogado + exclusão agendada | testes + API real |
| `RN-013` — sai do painel imediatamente e agenda exclusão | `revokedAt` na hora; `deletionScheduledAt` = agora + 24h | `revoke-consent.test.ts` |
| `RN-016` — excluir conta apaga tudo | `DeleteAccount` apaga conta+sessões+consents+transactions | `delete-account.test.ts` |
| `RN-015` — isolamento entre pessoas | Recurso alheio → não-encontrado (revogar e excluir) | testes negativos |
| `RF-025` — nada recuperável | Login pós-exclusão → 401 | API real |
| `RNF-013` — autorização no servidor | Guarda de titular em todas as rotas | controller |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Revogar tira do painel imediatamente e agenda ≤24h | Aprovado | `revoke-consent.test.ts` + API (204) |
| Só o próprio titular revoga (teste negativo) | Aprovado | `revoke-consent.test.ts` RN-015 |
| Excluir apaga conta, sessões, consents e transações | Aprovado | `delete-account.test.ts` RN-016 |
| Excluir conta de outro titular é negado | Aprovado | `delete-account.test.ts` RN-015 |
| Refresh token deixa de funcionar após exclusão | Aprovado | API real: login pós-exclusão 401 |

## Evidência de verificação

```
$ curl -X DELETE /consents/<id> -H "Bearer <token>"            → 204
$ curl GET /consents -H "Bearer <token>"                       → lista sem ativo da instituição
$ curl -X DELETE /consents/account -H "Bearer <token>"         → 204
$ curl -X POST /access/sessions (credencial da conta excluída) → 401
```

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  28 passed (28)   Tests  158 passed (158)

$ pnpm run test:integration
 Test Files  2 passed (2)     Tests  9 passed (9)   (inclui purgeDue e deleteByHolder)

$ pnpm run test:functional
 2 passed

$ pnpm run lint:boundaries
✔ no dependency violations found (190 modules, 492 dependencies cruised)

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Refatoração feita após os funcionais verdes

A rota estática `DELETE /consents/account` era capturada pelo `:id`; a ordem foi
invertida (estática antes de param) para que a exclusão da conta retorne 204 de
fato. Bug detectado na validação de ponta a ponta e corrigido antes do fechamento.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Cenários BDD por critério; RN-013/015/016 com teste negativo |
| Segurança | `open-finance-security-agent` | Aprovado | Revogação e exclusão por titular; prazo 24h registrado; nada recuperável após exclusão |
| SRE | `sre-agent` | Aprovado | Exclusão agendada e purge; build e integração verdes |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Exclusão cruza access+consent+transactions via portas por token; fronteiras intactas |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.18.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Prazo de exclusão = até 24h | Decisão do time (SDD §7) | Documentado na RN-013 |
| `DeleteAccount` no contexto consent | Evita ciclo access↔transactions; consent é o dono da gestão de dados | Endpoint `DELETE /consents/account` |
| Purge disparável (não job) | Job de background é operacional (HT-012) | Dívida registrada |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Job periódico de purge em background | Operacional — `HT-012` | Kanban → HT-012 |
| UI de revogação/exclusão (sem tela) | Construção do zero fica com HN-003 | Kanban |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-012`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.18.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado