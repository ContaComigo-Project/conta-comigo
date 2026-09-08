---
name: task-ht-020
description: Recorte executável da história HT-020 — padronizar backend em inglês (pastas, port/driving|driven, arquivos, símbolos, DTOs, Prisma) sem mudança de comportamento.
document_type: task
applies_when:
  - executar a história HT-020
max_lines: 300
---

# TASK — `HT-020`

- **História:** [`docs/backlog/historias-tecnicas/HT-020-backend-english-standard.md`](../../backlog/historias-tecnicas/HT-020-backend-english-standard.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Renomear pastas, arquivos, símbolos e DTOs do backend para inglês, mantendo a
suíte verde antes e depois (zero mudança de comportamento).

## Critérios de aceite copiados da história

- [ ] Contextos `access`, `aggregation`, `transactions`, `budget`
- [ ] `port/driving` e `port/driven`
- [ ] Sem token PT em nomes de arquivo/classe/função/variável do backend
- [ ] DTOs do contrato em EN + `frontend/src/dados` atualizado
- [ ] Prisma EN com `@@map` preservando tabelas
- [ ] `typecheck`, suíte completa e `lint:fronteiras` verdes antes e depois
- [ ] `ADR-001` atualizado

## Escopo desta task

**Dentro:** renomeação mecânica guiada por `git mv` + `sed` + typecheck/testes.
**Fora:** mudar regra/contrato semântico; renomear tabelas; mexer em entregas passadas.

## Arquivos previstos

Backend (`backend/src/**`), contrato (`packages/contrato/**`), `frontend/src/dados/**`, `ADR-001`, fixtures de fronteira se citarem paths.

## Critério de parada

Suíte completa verde + typecheck verde + fronteiras verdes + `ADR-001` atualizado.