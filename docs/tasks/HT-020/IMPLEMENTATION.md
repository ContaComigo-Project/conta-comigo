---
name: implementation-ht-020
description: Plano técnico da história HT-020 — estratégia de renomeação guiada por ferramentas e testes.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HT-020
max_lines: 300
---

# IMPLEMENTATION — `HT-020`

- **Requisitos ligados:** `RNF-019`, `RNF-021`
- **Versão prevista:** `v0.16.0`
- **Tipo de mudança:** MINOR (refactor sem mudança de contrato semântico)

## 1. Abordagem

Renomeação mecânica dirigida por ferramentas, não por reescrita LLM:

1. `git mv` das pastas de contexto (`acesso`→`access`, `agregacao`→`aggregation`,
   `lancamentos`→`transactions`, `orcamento`→`budget`) e de `port/entrada|saida`
   → `port/driving|driven`.
2. `git mv` dos arquivos PT→EN e `sed` global dos identificadores (imports
   relativos e nomes de símbolos) no backend, contrato e `frontend/src/dados`.
3. Contrato: renomear DTOs; atualizar controllers e `frontend/src/dados`.
4. Prisma: renomear modelos com `@@map` explícito para as tabelas atuais.
5. Iterar com `tsc --noEmit`, `vitest run` e `depcruise` até verde.
6. Atualizar `ADR-001` (estrutura de pastas) e docs vivos.

## 2. Mapa de renomeação

Conforme a história: `access`, `aggregation`, `transactions`, `budget`;
`driving`/`driven`; DTOs `CreateAccountDTO`, `CredentialsDTO`, `AccountDTO`,
`SessionDTO`, `RefreshDTO`, `TransactionDTO`, `Result`; Prisma `Transaction`,
`Account`, `Session` com `@@map("Lancamento")` etc.

## 3. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 0 | Rodar suíte antes | Verde (baseline) |
| 1 | Renomeação | typecheck aponta erros de import |
| 2 | Corrigir imports/símbolos | Verde |
| 3 | `lint:fronteiras` + suíte completa | Verde |

## 4. Gates

QA (suíte verde antes/depois), SRE (build), Segurança (diff sem segredo), Arquitetura (ADR-001), Revisão final.

## 5. Riscos

Import quebrado (typecheck aponta), contrato quebra frontend (atualizar `src/dados`), tabela renomeada (`@@map`).

## 6. Fechamento

- Commit: `refactor(backend): standardize code to English (HT-020)`
- Tag: `v0.16.0`