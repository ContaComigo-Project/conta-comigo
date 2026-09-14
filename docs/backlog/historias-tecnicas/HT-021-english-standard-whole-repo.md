---
name: ht-021-english-standard-whole-repo
description: História técnica para padronizar código, pastas, identificadores e comentários em inglês em todo o repositório (frontend, backend, contract, testes) e remover comentários desnecessários, sem mudança de comportamento.
document_type: story
story_key: HT-021
story_type: tecnica
epic: EPIC-TEC-001
status: Backlog
max_lines: 300
---

# `HT-021` — Padronizar código, pastas e comentários em inglês no repositório

- **Tipo:** História técnica (refactor/limpeza)
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Backlog** (inserida a pedido do time em 2026-09-14)
- **Requisitos:** `RNF-019` (fronteiras verificadas), `RNF-021` (gates bloqueiam)
- **Depende de:** `HT-020` (backend renomeado), `HT-018` (fronteira web/API fechada)
- **Versão prevista:** `v0.80.0`

## Problema técnico

`HT-020` padronizou nomes de pastas, símbolos, DTOs e modelos Prisma do **backend**
em inglês, mas deixou de fora o restante do repositório, que ainda viola a regra
de idioma do `AGENTS.md` §5 ("código, testes e commits em INGLÊS"):

- **Comentários em português:** ~120 no `frontend/src` e resíduos no `backend/src`
  e no `packages/contract` (o `HT-020` não varreu comentários).
- **Pasta em português no frontend:** `frontend/src/pages/dashboard/bancos/`
  (a página interna é `BanksPage.tsx`, já em inglês).
- **Identificadores em português no frontend:** `carregar`, `carregarInicial`,
  `idBanco`, `idCategoria`, `idDaCategoriaPeloNome`, `idDoBancoPeloNome`,
  `corrigirCategoria`, `comLimite`, `limiteAnimado`, `porCategoria`, `mes`, `ano`,
  `saldo`, constantes `BANCOS`, `MESES`, `CATEGORIAS`.
- **Descrições de testes em português:** ~420 linhas de `describe`/`it`/`test`
  em PT.
- **Comentários desnecessários:** comentários autoexplicativos e código
  comentado que só adicionam ruído.

**Importante — não é para traduzir a UI:** strings exibidas ao usuário
(labels, mensagens, títulos, placeholder) permanecem em PT-BR, conforme
`AGENTS.md` §5 ("React UI strings | PT-BR"). Só nomes, comentários e descrições
de teste mudam de idioma.

## Resultado esperado

Todo o código do repositório consistente com a regra de idioma: comentários e
descrições de teste em inglês, sem comentários desnecessários, pastas e
identificadores em inglês, com **zero mudança de comportamento** — a suíte
verde antes e depois é a prova.

## Escopo (do levantamento de 2026-09-14)

| Item | Exemplo atual | Alvo |
| --- | --- | --- |
| Pasta `bancos` do frontend | `pages/dashboard/bancos/BanksPage.tsx` | `pages/dashboard/banks/BanksPage.tsx` |
| Identificadores PT | `carregar`, `carregarInicial`, `idBanco`, `MESES`, `corrigirCategoria` | `load`, `loadInitial`, `bankId`, `MONTHS`, `fixCategory` |
| Comentários PT | `// busca o saldo do banco` | `// fetches the bank balance` ou removido se desnecessário |
| Comentários desnecessários | comentário que repete o código, código comentado | removido |
| Descrições de teste PT | `describe('carrega saldo')` | `describe('loads balance')` |
| Código comentado | linhas em `/* ... */` com lógica antiga | removido |

O mapa de renomeação final (cada símbolo afetado) é fechado no plano de
execução em `docs/tasks/HT-021/`, como feito em `HT-020`.

## Critérios de aceite

- [ ] Pasta `bancos` renomeada para `banks` com imports e rotas atualizados
- [ ] Zero token em português em nomes de arquivo, pasta, classe, função, variável, constante ou tipo em `backend/src`, `frontend/src` e `packages/contract`
- [ ] Zero comentário em português em código (`//`, `/* */`, JSDoc) em todo o repositório de código
- [ ] Comentários desnecessários (autoexplicativos, código comentado) removidos
- [ ] Descrições de `describe`/`it`/`test` em inglês
- [ ] Strings de UI em PT-BR preservadas (não são escopo desta história)
- [ ] `pnpm run typecheck` verde no backend e na web
- [ ] Suíte completa verde **antes e depois** (comportamento inalterado)
- [ ] `pnpm run lint:fronteiras` verde
- [ ] Auditoria do repositório (`scripts/auditar-repositorio.sh`) aprovada

```gherkin
Cenário: o código do repositório é consistente com a regra de idioma
  Dado o refactor concluído
  Quando alguém navega pela árvore de código
  Então pastas, arquivos, símbolos e comentários estão em inglês
  E nenhum comentário desnecessário permanece
  E a suíte completa continua verde (nenhuma regra mudou)
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-019` | Fronteiras verificadas | `lint:fronteiras` verde após a renomeação |
| `RNF-021` | Gates bloqueiam | Suíte + typecheck verdes antes e depois |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Renomeia | Pasta `bancos` do frontend e identificadores; estrutura lógica igual |
| Dependências externas | Não | — |
| Contratos públicos | Não | DTOs do contrato já renomeados em `HT-020` |
| Dados e migração | Não | Nenhuma tabela ou migration muda |
| UI exibida | Não | Strings PT-BR preservadas; zero mudança visual |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Renomear string de UI por engano | Critério de aceite explicita que strings PT-BR ficam | Reverter o valor da string |
| Import quebrado na renomeação de pasta | `typecheck` + testes apontam o erro exato | Corrigir o import; `git mv` preserva histórico |
| Traduzir comentário com sentido errado | Revisão humana + code-reviewer no diff | Corrigir a frase |

## Fora de escopo

- Traduzir strings de UI, mensagens, labels e textos exibidos ao usuário (PT-BR por regra)
- Traduzir documentação (`docs/*`, ADRs, kanban, histórias) — artefatos de documentação não são código
- Mudar qualquer regra de negócio, contrato ou comportamento
- Renomear tabelas do banco ou migrations
- Alterar commits/entregas passadas (registro histórico)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Suíte verde antes/depois prova zero mudança de comportamento |
| SRE | Sim | Build/typecheck reproduzível |
| Segurança | Sim | Nenhum segredo/credencial toca renomeação; código revisado |
| Arquitetura | Sim | Fronteiras intactas; estrutura consistente |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Renomeação aplicada e suíte verde
- [ ] Comentários PT eliminados e desnecessários removidos
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HT-021-english-standard-whole-repo.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-021` e tag `v0.80.0` no mesmo hash