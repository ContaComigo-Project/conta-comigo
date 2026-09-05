---
name: kanban-oficial
description: Fonte única e oficial da ordem cronológica de execução do ContaComigo; define qual é a próxima demanda a ser puxada.
document_type: kanban
applies_when:
  - decidir qual é a próxima história a executar
  - mover uma história entre estados
  - registrar fechamento de entrega
max_lines: 300
---

# KANBAN OFICIAL

> **Fonte única da verdade de execução.** Nenhuma história é iniciada se não
> estiver aqui em `Ready` e no topo da fila. SDD, épicos e requisitos são
> insumos; a ordem de trabalho é esta.

- **Limite de trabalho em progresso (WIP): 1.**
- Puxar sempre o item `Ready` de menor `Ordem`.
- Estado só muda com evidência, nunca por intenção.
- **Chave não é ordem.** `HN-012` roda cedo porque revogar consentimento é a
  válvula de segurança de `HN-002`. A chave identifica; a coluna `Ordem` manda.

## Premissa que molda esta fila

A camada web **já existe**: 41 componentes, 5.930 linhas, 9 arquivos de mock,
zero testes. O time decidiu **preservar a UI e reescrever a lógica** — toda
regra de negócio hoje em `frontend/src/mocks/` é descartada e reimplementada no
domínio, com teste antes.

Consequência prática: a maioria das `HN` é **integração**, não construção. Cada
uma tem a coluna "UI hoje" dizendo o que já está pronto na tela.

## Próxima demanda

**`HT-016` — Inventário do frontend existente e destino dos mocks.**

Ele redefine o escopo real de quase toda `HN`, então nenhuma história de negócio
entra em `Ready` antes dele. `HT-004` (decisões de stack e ADR-002..005) foi
concluída e está em revisão final.

## Fluxo de estados

```
Backlog -> Ready -> Em execução -> Em revisão -> Done
             ^                         |
             +------ devolvida --------+
```

| Estado | Condição de entrada |
| --- | --- |
| `Backlog` | Item na fila, escopo não fechado, arquivo pode não existir |
| `Ready` | Arquivo criado, critérios verificáveis, requisitos citados, dependências resolvidas |
| `Em execução` | Existe `docs/tasks/[CHAVE]/` com TASK, IMPLEMENTATION e progress |
| `Em revisão` | Testes verdes, refatoração feita, gates aplicáveis executados |
| `Done` | Evidência registrada, `docs/entregas/` criado, commit e tag no mesmo hash |

## Fila cronológica oficial

### Fase 0 — Governança e entendimento

| Ordem | Chave | Título | Tipo | Estado | Depende de | Versão |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | `HT-000` | Fundação do workflow agêntico | Técnica | **Done** | — | `v0.1.0` → `1a2f863` |
| 1 | `HT-001` | Conduzir SDD-001 e registrar entendimento inicial | Técnica | **Done** | HT-000 | `v0.2.0` → `fe1f89b` |
| 2 | `HT-002` | Catalogar RF e RN e preencher o épico de negócio | Técnica | **Done** | HT-001 | `v0.3.0` → `96ec972` |
| 3 | `HT-003` | Catalogar RNF e preencher o épico técnico | Técnica | **Done** | HT-001 | `v0.4.0` → `f9ed24f` |

Correção posterior a `HT-002` e `HT-003`, entregue em `v0.4.1` → `9c063f7`:
o backlog passou a considerar o frontend existente.

### Fase 1 — Decisões e fundação técnica

| Ordem | Chave | Título | Tipo | Estado | Depende de | RNF |
| --- | --- | --- | --- | --- | --- | --- |
| 4 | `HT-004` | Decidir tecnologias em aberto e registrar ADRs | Técnica | **Done** | HT-003 | — |
| 5 | `HT-016` | Inventário do frontend existente e destino dos mocks | Técnica | **Ready** | HT-004 | RNF-018, RNF-020 |
| 6 | `HT-005` | Harness local reprodutível com docker compose | Técnica | Backlog | HT-004 | RNF-007 |
| 7 | `HT-006` | Infraestrutura de testes funcional/BDD e unitário | Técnica | Backlog | HT-005 | RNF-018, RNF-019 |
| 8 | `HT-007` | Pipeline de CI com gates bloqueantes | Técnica | Backlog | HT-006 | RNF-021 |
| 9 | `HT-008` | Baseline de segurança: segredos, autorização, varredura | Técnica | Backlog | HT-007 | RNF-012, RNF-013, RNF-015 |

### Fase 2 — Esqueleto do sistema e fronteira com a web

| Ordem | Chave | Título | Tipo | Estado | Depende de | UI hoje |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | `HT-009` | Esqueleto do backend hexagonal (`ADR-001`) | Técnica | Backlog | HT-006, HT-004 | — |
| 11 | `HT-010` | Persistência PostgreSQL, migrações e cifra em repouso | Técnica | Backlog | HT-009, HT-004 | — |
| 12 | `HT-017` | Contrato de dados entre a web e a API | Técnica | Backlog | HT-016, HT-009 | Define como a UI atual passa a receber dado |
| 13 | `HN-001` | Acesso: cadastro, login e encerramento de sessão | Negócio | Backlog | HT-010, HT-008, HT-017 | Telas prontas; `Login.tsx` faz `console.log` + `setTimeout` |
| 14 | `HT-011` | Adaptador Pluggy Sandbox atrás da porta de agregação | Técnica | Backlog | HT-009 | — |

### Fase 3 — Consolidação e controle dos dados

| Ordem | Chave | Título | Tipo | Estado | Depende de | UI hoje |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | `HN-002` | Conectar instituição com consentimento e sincronizar | Negócio | Backlog | HN-001, HT-011 | `ConnectedBanksWidget` existe; falta fluxo de consentimento |
| 16 | `HN-012` | Revogar consentimento e excluir conta e dados | Negócio | Backlog | HN-002 | **Sem tela** — construção do zero |
| 17 | `HN-003` | Painel consolidado de saldos, cartões e lançamentos | Negócio | Backlog | HN-002, HT-017 | `MetricsCards`, `SpendingChart`, `TransactionsListView`, `MonthPicker`, `QuickFilterBar` |
| 18 | `HT-012` | Observabilidade mínima: log estruturado e erro rastreável | Técnica | Backlog | HT-009 | — |

### Fase 4 — Camada de inteligência

| Ordem | Chave | Título | Tipo | Estado | Depende de | UI hoje |
| --- | --- | --- | --- | --- | --- | --- |
| 19 | `HT-013` | Adaptador Gemini/LangChain com teto de custo e cache | Técnica | Backlog | HT-009 | — |
| 20 | `HT-014` | Guarda de saída da IA: validação, coerência e fronteira | Técnica | Backlog | HT-013 | — |
| 21 | `HN-004` | Descrição legível do lançamento (limpeza semântica) | Negócio | Backlog | HN-003, HT-014 | Lista existe; **sem tratamento de descrição** |
| 22 | `HN-005` | Categorização automática e correção manual | Negócio | Backlog | HN-004 | Categorias exibidas; **sem correção manual** |

### Fase 5 — Orçamento e histórico

| Ordem | Chave | Título | Tipo | Estado | Depende de | UI hoje |
| --- | --- | --- | --- | --- | --- | --- |
| 23 | `HN-006` | Definir e editar limite mensal por categoria | Negócio | Backlog | HN-005 | `CategoryCard` já edita limite inline, sem persistir |
| 24 | `HN-007` | Orçamento semáforo e aviso ao cruzar faixa | Negócio | Backlog | HN-006 | Barras e faixas prontas; **a regra sai de `budget.mock.ts` para o domínio** |
| 25 | `HN-008` | Histórico de 6 meses e problemas recorrentes | Negócio | Backlog | HN-007 | `HistoricalOverview` completo, sobre dados simulados |

### Fase 6 — Consultoria educativa, limpeza e publicação

| Ordem | Chave | Título | Tipo | Estado | Depende de | UI hoje |
| --- | --- | --- | --- | --- | --- | --- |
| 26 | `HN-009` | Diagnóstico de saúde financeira e insights | Negócio | Backlog | HN-007, HT-014 | `AIInsightPanel` existe, com insights fixos |
| 27 | `HN-010` | Chatbot educativo com aviso permanente | Negócio | Backlog | HN-009 | `AIChatWidget` existe, com respostas roteirizadas |
| 28 | `HN-011` | Simulação de compra e exportação PDF/CSV | Negócio | Backlog | HN-008 | `ExportDropdown` existe; **não gera arquivo** |
| 29 | `HT-018` | Remover a lógica de negócio e os mocks do frontend | Técnica | Backlog | HN-010, HN-011 | Fecha a fronteira aberta em `HT-017` |
| 30 | `HT-015` | Publicação da PoC e verificação de custo zero | Técnica | Backlog | HT-018 | — |

## Quadro

### Ready
- `HT-016` — Inventário do frontend existente e destino dos mocks

### Em execução
- _(vazio — WIP 1)_

### Em revisão
- _(vazio)_

### Done
- `HT-000` `v0.1.0` · `HT-001` `v0.2.0` · `HT-002` `v0.3.0` · `HT-003` `v0.4.0` · `HT-004` `v0.5.0`

Todas verificadas por `scripts/verificar-fechamento.sh`: tag e commit no mesmo
hash, mensagem semântica citando a chave, documento de entrega presente.

### Backlog
Ordens 5 a 30 na tabela acima.

## Grooming

Arquivo de história é criado quando o item entra em `Ready`, não antes.
Existem hoje como arquivo: `HT-000` a `HT-004`, `HT-009`, `HT-016`, `HT-017`, `HT-018`.

`HT-009` foi groomada cedo, fora da regra acima, porque `ADR-001` tornou seus
critérios de aceite verificáveis — deixaram de ser adivinhação.

**Nenhuma `HN` ganha arquivo antes de `HT-016`.** O inventário define quanto de
cada tela é aproveitável, e isso muda o critério de aceite de quase todas elas.

## Histórico de movimentações

| Data | Chave | De | Para | Evidência |
| --- | --- | --- | --- | --- |
| 2026-09-01 | `HT-000` | — | Em revisão | `ENTREGA-HT-000-fundacao-workflow-agentico.md` |
| 2026-09-02 | `HT-001` | Ready | Em revisão | `ENTREGA-HT-001-sdd-inicial.md` |
| 2026-09-02 | `HT-002` | Backlog | Em revisão | `ENTREGA-HT-002-catalogo-rf-rn.md` |
| 2026-09-02 | `HT-003` | Backlog | Em revisão | `ENTREGA-HT-003-catalogo-rnf.md` |
| 2026-09-02 | `HT-004` | Backlog | Ready | Dependência concluída; arquivo criado |
| 2026-09-02 | `HT-016` `HT-017` `HT-018` | — | Backlog | Inseridas após inventário do frontend existente revelar regra de negócio em `src/mocks/` |
| 2026-09-02 | `HN-001` a `HN-012` | Backlog | Backlog | Reescritas como integração; coluna "UI hoje" adicionada |
| 2026-09-02 | `HT-009` | Backlog | Backlog | Groomada após `ADR-001` fixar a arquitetura hexagonal |
| 2026-09-02 | `HT-000` | Em revisão | Done | `v0.1.0` → `1a2f863` |
| 2026-09-02 | `HT-001` | Em revisão | Done | `v0.2.0` → `fe1f89b` |
| 2026-09-02 | `HT-002` | Em revisão | Done | `v0.3.0` → `96ec972` |
| 2026-09-02 | `HT-003` | Em revisão | Done | `v0.4.0` → `f9ed24f` |
| 2026-09-05 | `HT-004` | Backlog | Ready | Arquivo de história já existia |
| 2026-09-05 | `HT-004` | Ready | Em execução | `docs/tasks/HT-004/` criado com TASK e IMPLEMENTATION |
| 2026-09-05 | `HT-016` | Backlog | Ready | `HT-004` concluída; dependência resolvida |
| 2026-09-05 | `HT-004` | Em execução | Em revisão | ADRs e artefatos produzidos; aguardando gates e fechamento |
| 2026-09-05 | `HT-004` | Em revisão | Done | `v0.5.0` → `c048700` |
