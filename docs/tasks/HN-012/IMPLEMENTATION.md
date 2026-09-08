---
name: implementation-hn-012
description: Plano técnico da história HN-012 — revogação com exclusão agendada e exclusão da conta cruzando contextos.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HN-012
max_lines: 300
---

# IMPLEMENTATION — `HN-012`

- **Requisitos ligados:** `RF-006`, `RF-025` · `RN-013`, `RN-015`, `RN-016` · `RNF-013`, `RNF-014`
- **Versão prevista:** `v0.18.0`
- **Tipo de mudança:** MINOR (capacidade nova compatível)

## 1. Abordagem

1. **Consent**: modelo ganha `deletionScheduledAt` (migração). `RevokeConsent`
   marca `revokedAt` (saída imediata do painel — lista só retorna ativos) e
   `deletionScheduledAt = agora + 24h` (RN-013). `ConsentRepository` ganha
   `purgeDue(agora)` (exclui consents vencidos) e `deleteByHolder(holderId)`.
   Endpoint `DELETE /consents/:id` (somente do titular, RN-015).
2. **Transactions**: `TransactionRepository` ganha `deleteByHolder`.
3. **Access**: `DeleteAccount` apaga conta + sessões + consents + transações do
   titular (portas dos três contextos injetadas por token; application → domain,
   permitido por ADR-001). Endpoint `DELETE /access/accounts`. O refresh token
   para de funcionar porque a sessão e a conta somem.
4. **Contract**: sem DTOs novos (respostas 204/404); o `ConsentDTO` já cobre.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Exclusão imediata ao revogar | Decisão do time: até 24h (SDD §7 resolvida) |
| Anonimizar em vez de apagar | RF-025 pede "não recuperável"; apagar é mais simples e verificável |

## 3. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenários BDD/unit: revoga+agenda, RN-015 negativo, exclusão apaga tudo, refresh inválido | Vermelho antes do código |
| 2 | Implementar (consent + transactions + access) | Verdes |
| 3 | Integração Prisma (deletionScheduledAt + deleteByHolder) | Verde |
| 4 | Suíte completa + fronteiras | Verdes |

## 4. Gates

QA, Segurança (open-finance-security-agent: revogação/exclusão/isolamento), SRE, Arquitetura (exclusão cruza contextos), Revisão final.

## 5. Riscos

Exclusão irreversível (prazo 24h para auditoria), cruzar contextos errado (portas injetadas por token, fronteiras verificadas).

## 6. Fechamento

- Commit: `feat(consent): revoke consent and delete account with data (HN-012)`
- Tag: `v0.18.0`