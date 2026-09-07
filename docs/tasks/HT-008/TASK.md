---
name: task-ht-008
description: Recorte executável do baseline de segurança — skill de Open Finance, porta de identidade, guarda por titular com teste negativo, redator de log e varredura do bundle.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-008`

- **História:** [`docs/backlog/historias-tecnicas/HT-008-baseline-de-seguranca.md`](../../backlog/historias-tecnicas/HT-008-baseline-de-seguranca.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Dado de uma pessoa deixa de ser alcançável por outra, e isso é provado por teste
negativo — com o roteiro de Open Finance escrito para os gates seguintes usarem.

## Critérios de aceite copiados da história

- [x] `open-finance-security-agent/SKILL.md` com frontmatter, ≤300 linhas, no índice e no workflow
- [x] Porta `Identidade`; titular vem da sessão, nunca de parâmetro
- [x] `titularId` em `Lancamento`, migração commitada, filtro na consulta
- [x] Falha esperada: sem credencial recusa autenticação
- [x] Falha esperada: credencial de outro titular devolve vazio, não 403
- [x] Credencial válida devolve apenas os próprios lançamentos
- [x] Redator de log prova que valor, descrição, token e e-mail não sobrevivem
- [x] `harness security` cobre o `dist/` da web, com a cobertura guardada
- [x] Falha esperada: chave plantada no bundle é detectada
- [x] Evidência por `registrar-evidencia.sh`

## Escopo desta task

**Dentro:** skill de Open Finance + índice + tabela de gates do
`WORKFLOW-AGENTICO.md`; porta `Identidade` e `TitularId` no domínio de
`lancamentos`; `titularId` na entidade, no schema Prisma e em migração;
`RepositorioDeLancamentos.listarDoTitular`; `GuardaDeTitular` em
`infrastructure/http/`; `IdentidadeDoCabecalho` como implementação provisória
até `HN-001`; redator de log em `infrastructure/log/`; `seguranca.mjs`
varrendo `frontend/dist`; testes negativos e de redação.

**Fora:** JWT real, login e sessão (`HN-001`); consentimento e agregador
(`HN-002`, `HT-011`); log estruturado (`HT-012`); varredura no CI (`HT-007`).

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `.agents/skills/open-finance-security-agent/SKILL.md` | criar | Roteiro de gate do domínio |
| `.agents/skills/README.md`, `docs/WORKFLOW-AGENTICO.md` | alterar | Índice e tabela de gates |
| `backend/src/lancamentos/domain/model/titular.ts` | criar | `TitularId` como tipo do domínio |
| `backend/src/lancamentos/domain/port/saida/identidade.ts` | criar | Quem é o solicitante |
| `backend/src/lancamentos/domain/model/lancamento.ts` | alterar | `titularId` na entidade |
| `backend/src/lancamentos/domain/port/saida/repositorio-de-lancamentos.ts` | alterar | `listarDoTitular` |
| `backend/src/lancamentos/application/*.ts` | alterar | Casos de uso recebem o titular |
| `backend/src/lancamentos/infrastructure/http/guarda-de-titular.ts` + teste | criar | Barreira no servidor |
| `backend/src/lancamentos/infrastructure/http/identidade-do-cabecalho.ts` | criar | Implementação provisória da porta |
| `backend/src/lancamentos/infrastructure/log/redator.ts` + teste | criar | `RNF-015` |
| `backend/prisma/schema.prisma` + migração | alterar/criar | Coluna `titular_id` |
| `backend/src/.../persistence/repositorio-prisma.ts` + teste de integração | alterar | Filtro por titular na consulta |
| `scripts/seguranca.mjs` | alterar | Varredura do bundle |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-009` esqueleto e portas | Done (`v0.9.0`) | Não |
| `HT-010` persistência e cifra | Done (`v0.10.0`) | Não |
| `HT-007` CI | **Adiada** | Parcialmente: só o critério de varredura no CI |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
