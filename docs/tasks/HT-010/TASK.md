---
name: task-ht-010
description: Recorte executável da persistência PostgreSQL — Prisma, migração no harness, repositório real e utilitário de cifra em repouso.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-010`

- **História:** [`docs/backlog/historias-tecnicas/HT-010-persistencia-postgresql.md`](../../backlog/historias-tecnicas/HT-010-persistencia-postgresql.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent` (loop autônomo, volta 2)

## Objetivo em uma frase

Lançamentos sobrevivem ao processo: Prisma sobre o Postgres do compose, com
migração aplicada pelo `setup`, e um utilitário de cifra em repouso provado
por teste.

## Critérios de aceite copiados da história

- [x] `schema.prisma` com `Lancamento` e primeira migração commitada
- [x] `harness setup` aplica migrações; passo 6 deixa de ser slot vazio
- [x] `RepositorioDeLancamentosPrisma`; `@prisma/client` só em `persistence/`
- [x] Entidade `Lancamento` intacta, sem tipos do Prisma
- [x] Teste de integração ida e volta contra o Postgres real, fora de `test-unitario`
- [x] Utilitário AES-256-GCM `cifrar`/`decifrar` com `ENCRYPTION_KEY`, testado
- [x] Falha esperada: sem `ENCRYPTION_KEY` recusa operar
- [x] Falha esperada: `@prisma/client` em `application/` quebra o lint
- [x] `test-unitario` continua sem banco
- [x] Evidência por `registrar-evidencia.sh`

## Escopo desta task

**Dentro:** `prisma` CLI e `@prisma/client` em `backend/`; `schema.prisma`;
migração inicial; `prisma generate` + `migrate deploy` no `setup-ambiente.mjs`;
`RepositorioDeLancamentosPrisma` + tradução modelo→entidade; `cifra.ts` em
`persistence/`; tarefa `test-integracao` no harness (Vitest com config própria);
módulo escolhendo o repositório real; `.env.example` e `scripts/README.md`.

**Fora:** campos cifrados reais (`HN-002`); autenticação (`HN-001`); modelos
além de `Lancamento`; hospedagem.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/package.json` | alterar | `prisma`, `@prisma/client` fixados; scripts `prisma:*` |
| `backend/prisma/schema.prisma` | criar | Modelo de persistência (≠ entidade) |
| `backend/prisma/migrations/**` | criar | Primeira migração versionada |
| `backend/src/lancamentos/infrastructure/persistence/repositorio-prisma.ts` | criar | Adaptador real |
| `backend/src/lancamentos/infrastructure/persistence/repositorio-prisma.integracao.test.ts` | criar | Ida e volta no banco |
| `backend/src/lancamentos/infrastructure/persistence/cifra.ts` + `cifra.test.ts` | criar | `RNF-014` |
| `backend/src/lancamentos/lancamentos.module.ts` | alterar | Token → repositório Prisma |
| `scripts/setup-ambiente.mjs` | alterar | Passo 6 real |
| `vitest.integracao.config.ts`, `package.json` (raiz), `scripts/harness.env` | criar/alterar | Tarefa de integração separada do unitário |
| `.env.example`, `scripts/README.md` | alterar | `DATABASE_URL` já existe; `ENCRYPTION_KEY` documentada |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-009` porta `RepositorioDeLancamentos` | Done (`v0.9.0`) | Não |
| Postgres do compose de pé | `harness setup` | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
