---
name: entrega-ht-004
description: Documento de entrega das quatro decisões de stack do ContaComigo, registradas como ADR-002 a ADR-005.
document_type: delivery
story_key: HT-004
version: v0.5.0
max_lines: 300
---

# ENTREGA — `HT-004` — Decisões de stack registradas como ADR

- **Data:** 2026-09-05
- **Tipo:** Técnica (governança)
- **Versão:** `v0.5.0`
- **Commit:** `c048700`
- **Tag:** `v0.5.0` → `c048700`

## O que foi entregue

Quatro decisões de tecnologia que travavam a fila foram fechadas pelo time e
registradas como ADR com contexto, alternativas, consequência, custo, forma de
verificação e caminho de reversão:

| ADR | Decisão |
| --- | --- |
| [`ADR-002`](../adr/ADR-002-orm-prisma.md) | ORM **Prisma** com **PostgreSQL**, modelo de persistência separado da entidade de domínio (`ADR-001`), cifra em repouso na borda (`RNF-014`) |
| [`ADR-003`](../adr/ADR-003-testes-vitest-playwright.md) | Testes com **Vitest** (unitário) + **Playwright** (funcional/E2E) + **dependency-cruiser** (fronteiras de `ADR-001`); cobertura ≥ 80% no domínio; web entra na medição a partir de `HT-017` |
| [`ADR-004`](../adr/ADR-004-autenticacao-jwt-proprio.md) | Autenticação própria com **JWT** (access curto + refresh revogável), atrás de porta, autorização no servidor com teste negativo por rota (`RNF-013`) |
| [`ADR-005`](../adr/ADR-005-hospedagem-adiada.md) | **Hospedagem adiada**: foco no dev local reprodutível (`HT-005`); provedores decididos em `HT-015` com critério fixo de R$ 0 recorrente (`RNF-011`) |

Nenhuma dependência foi adicionada ao `package.json` e nenhum código foi escrito
— a história decide e registra, as histórias seguintes instalam e implementam.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-011` — R$ 0 recorrente | Cada ADR declara o custo da opção; auth própria e hospedagem adiada não contratam nada | `ADR-002..005` §Consequências |
| `RNF-013` — autorização no servidor | `ADR-004` fixa guard por dono e teste negativo por rota | `ADR-004` §Regras 1–4 |
| `RNF-014` — cifra em repouso | `ADR-002` fixa cifra na borda da persistência para consentimento/credencial | `ADR-002` §Regra 4 |
| `RNF-018` — rastreio RN→teste | `ADR-003` nomeia cenário `RN-XXX` e cobertura mínima no domínio | `ADR-003` §Regras 1–4 |
| `RNF-020` — adapters trocáveis | Auth e ORM atrás de porta; `@prisma/client` só em `infrastructure/persistence/` | `ADR-002/004` §Regras |
| `RNF-021` — gates bloqueantes | dependency-cruiser entra no lint do harness e do CI | `ADR-003` §Regra 2 |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| ADR-002 a ADR-005 existem em `docs/adr/` | Aprovado | 4 arquivos criados |
| Nenhuma decisão contraria `ADR-001` | Aprovado | ORM sem decorator; teste roda caso de uso sem framework |
| Decisão de teste nomeia a ferramenta de fronteira | Aprovado | dependency-cruiser, confirmado na stack |
| Cada ADR com contexto, ≥ 2 alternativas, escolha, consequência | Aprovado | Todos seguem `ADR-000-template.md` |
| Cada ADR declara o que a reverteria | Aprovado | §Como reverter em todos |
| Custo declarado, nenhum fora do free tier | Aprovado | §Consequências/§Decisão de cada ADR |
| Autenticação declara como `RNF-013` será atendida | Aprovado | `ADR-004` §Regras 1–4 |
| ORM declara `RNF-014` e separação do modelo de persistência | Aprovado | `ADR-002` §Regras 1 e 4 |
| Teste declara rastreio RN→teste (`RNF-018`) | Aprovado | `ADR-003` §Regra 3 |
| `EPICO-TECNICO.md` §3 fora de "Em aberto" | Aprovado | 4 linhas atualizadas |
| `SDD-001` §7 fora de "em aberto" | Aprovado | 4 questões resolvidas/marcadas |
| Nenhuma dependência nova no `package.json` | Aprovado | Nenhum pacote instalado |
| Teste declara se a web entra na cobertura | Aprovado | `ADR-003` §Regra 4: web entra a partir de `HT-017` |

## Evidência de verificação

```
$ ls docs/adr/
ADR-001-arquitetura-hexagonal-no-backend.md
ADR-002-orm-prisma.md
ADR-003-testes-vitest-playwright.md
ADR-004-autenticacao-jwt-proprio.md
ADR-005-hospedagem-adiada.md
```

Sem comportamento executável, os critérios foram conferidos linha a linha na
revisão final contra a história `HT-004`.

## Testes

Não aplicável: história de documentação e decisão — não instala dependência nem
escreve código (critério de aceite explícito). A ferramenta de fronteira
escolhida (`dependency-cruiser`) passa a ser executada pelo harness a partir de
`HT-006`.

## Refatoração feita após os funcionais verdes

Não aplicável. Consistência entre artefatos: o `ADR-005` registra que a decisão
de hospedagem (listada em `HT-004`) é adiada para `HT-015`, resolvendo a
divergência entre a história, o épico técnico e o índice de ADRs — os três agora
dizem a mesma coisa.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Não aplicável | Sem comportamento de produto |
| SRE | `sre-agent` | Aprovado com ressalva | Custo zero declarado em cada ADR; reversão documentada em todos. Ressalva: o harness segue sem comandos (`scripts/harness.env` vazio) — lacuna endereçada por `HT-005` |
| Segurança | `security-specialist-agent` | Aprovado | `ADR-004` define access curto + refresh revogável, hash forte, autorização por dono no servidor (`RNF-013`) e teste negativo por rota; segredo do JWT fora do repositório (`RNF-012`). Nenhuma credencial adicionada ao repo |
| Arquitetura | `architect-reviewer-agent` | Aprovado | ORM e auth atrás de porta (`RNF-020`); `@prisma/client` restrito a `infrastructure/persistence/`; dependency-cruiser verifica `ADR-001`; decisões registradas com contexto, alternativas, consequência e reversão |
| Revisão final | `final-reviewer-agent` | Aprovado | Todos os critérios de aceite com evidência; sem escopo extra; incremento MINOR coerente (`v0.5.0`); commit semântico citando `HT-004` |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| ORM Prisma + PostgreSQL | Tipagem forte, migrações versionadas, separação do domínio | `HT-010` implementa |
| Vitest + Playwright + dependency-cruiser | Um ecossistema (Vite); fronteiras verificáveis | `HT-006` implementa |
| JWT próprio em vez de provedor gerenciado | Custo zero garantido (`RNF-011`), controle de sessão, atrás de porta | `HN-001` implementa; troca futura é troca de adaptador |
| Hospedagem adiada — dev primeiro | Nada a hospedar; free tiers mudam; `RNF-011` | `HT-015` decide provedores com termos vigentes |
| Web entra na cobertura só a partir de `HT-017` | 5.930 linhas sem teste; exigir 80% agora inviabilizaria `HT-006` | Linha de base da medição documentada em `ADR-003` |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Nenhuma decisão ainda é verificada por ferramenta | dependency-cruiser, Prisma e auth entram quando as histórias donas implementarem | `ADR-002..004`; `HT-006`, `HT-009`, `HN-001` |
| Provedores de hospedagem não escolhidos | Decisão consciente de adiar | `ADR-005`; `HT-015` |

## Verificação de fechamento

- [x] Testes e gates aplicáveis verdes
- [x] Commit semântico contém a chave `HT-004`
- [x] Commit não contém arquivos de outra história
- [x] Tag `v0.5.0` aponta para o mesmo hash do commit
- [x] `KANBAN-OFICIAL.md` atualizado