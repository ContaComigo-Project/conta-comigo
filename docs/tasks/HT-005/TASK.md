---
name: task-ht-005
description: Recorte executável do harness local reprodutível — escopo concreto, arquivos afetados e critério de parada.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-005`

- **História:** [`docs/backlog/historias-tecnicas/HT-005-harness-local.md`](../../backlog/historias-tecnicas/HT-005-harness-local.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Um comando sobe o ambiente e outro dá o veredito de qualidade, iguais na máquina
de qualquer pessoa e no CI.

## Critérios de aceite copiados da história

- [x] `scripts/harness.sh setup` retorna sucesso em máquina limpa e deixa o PostgreSQL saudável
- [x] `scripts/harness.sh lint`, `build` e `security` retornam sucesso
- [x] `docker compose ps` mostra `postgres` com estado `healthy`, na versão fixada por tag exata
- [x] `scripts/harness.sh down` derruba o ambiente e remove o volume
- [x] Falha esperada: `test-unitario` sai com exit 3 e "comando não configurado"
- [x] Falha esperada: `harness.sh` e `harness.ps1` retornam o mesmo código de saída para o mesmo erro
- [x] `git status --porcelain` limpo após `setup`
- [x] Evidência registrada por `scripts/registrar-evidencia.sh`

## Escopo desta task

**Dentro:** workspace pnpm na raiz; `docker-compose.yml` com PostgreSQL em tag
exata; preenchimento de `scripts/harness.env`; `setup-ambiente.mjs`;
`seguranca.mjs`; `.gitleaks.toml`; `.env.example`; correção da paridade de
código de saída entre `harness.sh` e `harness.ps1`; atualização de
`scripts/README.md`.

**Fora:** Vitest, Playwright, dependency-cruiser e qualquer teste (`HT-006`);
workflow de CI (`HT-007`); esquema Prisma, migração e código de backend
(`HT-009`, `HT-010`); decisão de hospedagem (`HT-015`). Qualquer um desses que
apareça vira nova história, não escopo extra.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `package.json` (raiz) | criar | Ponto único de orquestração; `packageManager` e `engines` fixados |
| `pnpm-workspace.yaml` | criar | Declara `frontend` e `backend` como membros |
| `.npmrc`, `.nvmrc` | criar | Versão de Node fixada e verificável, também pelo CI |
| `docker-compose.yml` | criar | PostgreSQL com tag exata e healthcheck |
| `.env.example` | criar | Variáveis documentadas, exemplo separado do obrigatório |
| `.gitleaks.toml` | criar | Allowlist justificada da credencial local |
| `scripts/harness.env` | criar | Registro dos comandos do projeto — versionado, sem segredo |
| `scripts/setup-ambiente.mjs` | criar | Setup portátil em máquina limpa |
| `scripts/seguranca.mjs` | criar | Varredura de segredo e de dependência |
| `backend/package.json` | criar | Stub para o workspace ter o membro; sem `src/` |
| `frontend/pnpm-lock.yaml` | remover | Lockfile único migra para a raiz |
| `scripts/harness.ps1` | alterar | Paridade de código de saída com o `.sh` |
| `scripts/README.md` | alterar | Seção "Estado atual" deixa de dizer que `harness.env` não existe |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-004` — stack decidida | Done (`v0.5.0`) | Não |
| Docker Desktop na máquina | Verificado — 28.5.1 | Não |
| Node ≥ 24 e pnpm 10 | Verificado — 24.11.0 / 10.32.1 | Não |
| `registrar-evidencia.sh` | Entregue em `af73267` | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
