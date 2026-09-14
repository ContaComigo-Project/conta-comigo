---
name: task-hn-002
description: Recorte executável da história HN-002 — registro de consentimento, conexão e sincronização com isolamento por titular.
document_type: task
applies_when:
  - executar a história HN-002
max_lines: 300
---

# TASK — `HN-002`

- **História:** [`docs/backlog/historias/HN-002-conectar-instituicao.md`](../../backlog/historias/HN-002-conectar-instituicao.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Criar o registro de consentimento de primeira classe (RF-004), listar conexões (RF-005) e sincronizar (RF-007) com isolamento por titular, cifra do token e política de degradação — no backend, com endpoints e testes.

## Critérios de aceite copiados da história

- [ ] Consentimento ativo criado com escopo/expiração; credencial cifrada (RNF-014)
- [ ] Um consentimento ativo por instituição por pessoa (RN-014)
- [ ] Sem consentimento ativo não há sincronização nem dado (RN-012)
- [ ] Sincronização assíncrona persiste contas/lançamentos e atualiza última sincronização (RF-005/007)
- [ ] Dado de um titular nunca vaza para outro (RN-015) com teste negativo
- [ ] Agregador fora → erro estruturado, tela não esvazia (RNF-005/006)

## Escopo desta task

**Dentro:** contexto `consent` (domain/application/infrastructure), extensão da porta `OpenFinanceAggregator` (criarConexao), migração Prisma, DTOs no contract, endpoints, testes BDD/unitários.
**Fora:** revogação/exclusão (HN-012), painel consolidado e integração da UI real (HN-003), IA.

## Arquivos previstos

Novo contexto `backend/src/consent/` + migração + `contract` (DTOs) + controller. Testes unitários colados.

## Critério de parada

Suíte verde (unit + integração + fronteiras) + testes negativos por titular + critérios da história com evidência.