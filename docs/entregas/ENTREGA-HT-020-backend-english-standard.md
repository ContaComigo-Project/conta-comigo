---
name: entrega-ht-020
description: Documento de entrega da padronização do código e da estrutura do backend em inglês — pastas, port/driving|driven, arquivos, símbolos, DTOs e Prisma, sem mudança de comportamento.
document_type: delivery
story_key: HT-020
version: v0.16.0
max_lines: 300
---

# ENTREGA — `HT-020` — Padronizar código e estrutura do backend em inglês

- **Data:** 2026-09-07
- **Tipo:** Técnica (refactor)
- **Versão:** `v0.16.0`
- **Commit:** `43f4625`
- **Tag:** `v0.16.0` → `43f4625`

## O que foi entregue

Refactor de renomeação PT→EN, guiado por `git mv` + `sed` + `typecheck`/testes:

- **Pastas de contexto:** `access`, `aggregation`, `transactions`, `budget`.
- **Portas hexagonais:** `port/driving` e `port/driven` (não mais `entrada`/`saida`).
- **Arquivos e símbolos em EN** em todo o backend (controllers, casos de uso,
  repositórios, guardas, tokens).
- **Contrato:** DTOs renomeados (`CreateAccountDTO`, `CredentialsDTO`,
  `SessionDTO`, `AccountDTO`, `RefreshDTO`, `TransactionDTO`, `Result`) e
  `frontend/src/dados` atualizado (funções `signIn`/`signOut`/`createAccount`).
- **Prisma:** modelos `Transaction`, `Account`, `Session` com `@@map`
  preservando as tabelas (`lancamentos`, `contas`, `sessoes`) — **nenhuma
  migration mudou**.
- **`ADR-001`** atualizado com a nova estrutura de pastas.
- Rotas HTTP renomeadas (`/access/*`, `/transactions/*`) — nada externo consumia
  ainda; o teste de controle do Swagger foi atualizado junto.

**Zero mudança de comportamento:** a suíte completa ficou verde antes e depois.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-019` — fronteiras verificadas | `lint:fronteiras` verde após a renomeação (165 módulos) | depcruise |
| `RNF-021` — gates bloqueiam | typecheck, suíte e fronteiras verdes | pnpm |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contextos `access`/`aggregation`/`transactions`/`budget` | Aprovado | `git mv` + `find` |
| `port/driving` e `port/driven` | Aprovado | árvore de pastas |
| Sem token PT em nomes de arquivo/classe/função/variável | Aprovado | `find`/grep sem resíduo |
| DTOs do contrato em EN + `frontend/src/dados` | Aprovado | imports atualizados |
| Prisma EN com `@@map` preservando tabelas | Aprovado | `schema.prisma`; migrations intactas |
| `typecheck` verde (backend + web) | Aprovado | `tsc` + `vite build` |
| Suíte completa verde antes e depois | Aprovado | 136 unit + 4 integração + 2 funcional |
| `lint:fronteiras` verde | Aprovado | 165 módulos, 0 violações |
| `ADR-001` atualizado | Aprovado | estrutura com `driving`/`driven` |

## Evidência de verificação

```
$ pnpm run test:unitario
 Test Files  22 passed (22)   Tests  136 passed (136)

$ pnpm run test:integracao
 Test Files  1 passed (1)     Tests  4 passed (4)

$ pnpm run test:funcional
 2 passed (4.8s)

$ pnpm run lint:fronteiras
✔ no dependency violations found (165 modules, 389 dependencies cruised)

$ pnpm run build
✓ built in 998ms   (web + typecheck backend)
```

## Refatoração feita após os funcionais verdes

A renomeação foi dirigida pelas ferramentas, não por reescrita: o `typecheck`
apontou cada import quebrado, e os efeitos colaterais do `sed` (substrings como
`contacomigo`→`accountcomigo`, `toContain`→`toAccountin`, `error`→`errorr`, URLs
de banco) foram corrigidos e registrados no diário. As fixtures de `tests/fronteiras`
foram restauradas para o estado original (são árvores de teste do gate, não
código de produto) e o padrão do teste de integração virou `.integration.test.ts`.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 136 unit + 4 integração + 2 funcional verdes — comportamento inalterado |
| SRE | `sre-agent` | Aprovado | build + typecheck verdes; banco preservado via `@@map` |
| Segurança | `security-specialist-agent` | Aprovado | Diff de renomeação revisado; nenhum segredo/credencial alterada |
| Arquitetura | `architect-reviewer-agent` | Aprovado | `ADR-001` atualizado; fronteiras intactas |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.16.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Rotas HTTP também em EN | Consistência total; nada consumia ainda | Swagger atualizado; contrato HTTP novo |
| Prisma com `@@map` | Migrations e tabelas intactas | Banco não é renomeado |
| Fixtures de fronteira preservadas em PT | São árvores de teste do gate, não produto | Sem impacto no gate |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Comentários/strings de UI do frontend seguem PT | Fora do escopo (UI é PT-BR por regra) | `AGENTS.md` §5 |

## Verificação de fechamento

- [x] Testes e gates aplicáveis verdes
- [x] Commit semântico contém a chave `HT-020`
- [x] Commit não contém arquivos de outra história
- [x] Tag `v0.16.0` aponta para o mesmo hash do commit
- [x] `KANBAN-OFICIAL.md` atualizado

## Correção posterior (`v0.16.1` → `2caa4bd`)

Completada a padronização nos pontos que ficaram pendentes:

- **`packages/contrato`:** arquivos `bank.ts`, `category.ts`, `common.ts`,
  `result.ts`, `access.test.ts`, `contract.test.ts`; tipos `ConnectionStatus`,
  `BudgetCategoryDTO`, `Cents`, `ISOInstant`, `Reference`, `ErrorCode`; campos
  `category`/`name`/`year`/`month`/`totalInCents`.
- **`tooling/fronteiras`:** `regras.cjs` em EN (`createRules`, `commonOptions`,
  nomes de regras `domain-imports-domain-only` etc.) e `fixtures.cjs`; fixtures
  do gate renomeadas para `budget`/`billing` com nomes EN; testes de fronteira
  atualizados — o gate continua bloqueando.
- **`tests`:** `smoke.spec.ts` (era `fumaca`), `allowlist.test.ts` e `setup.ts`
  traduzidos, `README.md` em EN.
- **`frontend/src/dados`:** `equivalence.test.ts`, símbolos EN, strings de UI
  revertidas ao PT (UI é PT-BR por regra).
- **`pnpm-workspace.yaml`:** overrides movidos do `package.json` (o pnpm >= 10
  não lê mais a chave `pnpm`; o warning poluía o stderr do gate).

Suíte verde: 136 unit + 4 integração + 2 funcional; fronteiras 165 módulos sem
violação; auditoria 100%.

## Correção posterior (`v0.16.2` → `c3e2231`)

Pastas e pacote de fronteira renomeados para EN:

- **`packages/contrato` → `packages/contract`** e pacote **`@contacomigo/contrato`
  → `@contacomigo/contract`** (imports em backend/frontend/raiz, `pnpm-lock`,
  docs e a regra do depcruiser).
- **`frontend/src/dados` → `frontend/src/data`** (imports de Login/Register e
  internos).
- `vitest.config.ts` e `tests/README.md` atualizados para o novo caminho.

Suíte verde: 136 unit + 4 integração + 2 funcional; fronteiras 165 módulos;
auditoria 100%.

## Correção posterior (`v0.16.3` → `ef8fffd`)

Pastas e nomes do gate de fronteiras em EN:

- **`tests/fronteiras` → `tests/boundaries`** e **`tooling/fronteiras` →
  `tooling/boundaries`**.
- Arquivos: `production-config.test.ts`, `boundaries.test.ts`,
  `no-decorator-in-domain.test.ts` (conteúdo traduzido em EN).
- Script `lint:fronteiras` → **`lint:boundaries`** no `package.json` e no
  `scripts/harness.env`, com referências em docs atualizadas.
- Fixtures do gate: `limpo`→`clean` e `violacao`→`violation`; pasta
  `tests/seguranca` → `tests/security`.

Suíte verde: 136 unit + 4 integração + 2 funcional; `lint:boundaries` verde;
auditoria 100%.

## Correção posterior (`v0.16.4` → `[preenchido no fechamento]`)

Nomes de scripts e pastas de teste em EN:

- `vitest.integracao.config.ts` → **`vitest.integration.config.ts`**.
- Scripts: `test:unitario`→`test:unit`, `test:funcional`→`test:functional`,
  `test:integracao`→`test:integration` (em `package.json`, `harness.env` e
  `tests/README.md`).
- Pasta `tests/funcional` → `tests/functional` (`playwright.config.ts` atualizado).

Suíte verde: 136 unit + 4 integração + 2 funcional; `lint:boundaries` verde;
auditoria 100%.