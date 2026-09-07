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

## Notas do inventário (`HT-016`, `docs/inventario-frontend.md`)

- **Navegação do dashboard:** as telas `/dashboard/investimentos`, `/bancos`,
  `/configuracoes` e `/metas` **são mantidas**; em um primeiro momento o link
  leva a uma tela com o estado **"Em construção"**. A decisão de implementar ou
  cortar cada uma fica com o product-manager antes do fim da PoC.
- `HN-001` precisa **eliminar o `console.log` de credenciais** (`Login.tsx:23`,
  `Register.tsx:53`) durante a reescrita de autenticação.
- `HT-018` precisa **substituir a identidade pessoal real dos mocks**
  (`user.mock.ts:3-5`, `chat.mock.ts:235`) por identidade fictícia ao remover a
  camada de mock.
- `RN-024` e `RN-025` foram **descartadas** pelo inventário; a única fonte de
  faixa é `RN-001`.

## Próxima demanda

**`HN-001` — Acesso: cadastro, login e encerramento de sessão** (ordem 13), em execução.

É a primeira história de **negócio**: as três anteriores da fila (`HT-011`,
`HT-012`) são técnicas e não bloqueiam. `HN-001` fecha a lacuna deixada por
`HT-008` — a barreira por titular existe e é provada, mas quem afirma ser o
titular ainda é um cabeçalho forjável.

### Dependência parcialmente resolvida

`HT-008` depende de `HT-007` (CI), que segue adiada. `RNF-012` exige varredura
de segredo "no harness **e** no CI": a metade do harness é entregue aqui, a
metade do CI fica **pendente e registrada** na entrega, não marcada como feita.
Os outros dois requisitos da história (`RNF-013` autorização, `RNF-015` log) não
dependem de CI e são verificáveis localmente.

Depois dela, os caminhos abertos são:

- **`HT-011` — Adaptador Pluggy Sandbox** (ordem 14): depende só de `HT-009`,
  concluída. É o próximo passo que não exige nada de fora do repositório.
- **`HT-007` — CI com gates bloqueantes** (ordem 8, adiada): volta a fazer
  sentido assim que `develop` for publicado, porque a proteção de branch e o
  PR de prova acontecem no GitHub.

`HT-010` (`v0.10.0`) e `HT-017` (`v0.11.0`) fecharam; com o contrato no lugar,
`HN-001` só espera `HT-008`.

### Nota de reordenação (2026-09-07)

`HT-007` (CI) e `HT-008` (baseline de segurança, que depende dela) foram
**adiadas** por decisão do time; `HT-009` foi puxada antes. Motivo registrado
conforme `spec-to-execution-plan`, obrigação 7:

- O sinal de verdade que o ciclo precisa já existe localmente desde `HT-006`
  (`harness gates` verde e bloqueante; evidência amarrada ao fechamento). O CI
  protege a etapa de push/merge, que o loop local não executa (regra 6 do
  `AGENTS.md`: push só com autorização humana).
- Metade de `HT-007` depende de ação fora do repositório — push, proteção de
  branch no GitHub, PR de prova. Sem o remoto atualizado ela ficaria pela
  metade, esperando.
- Com `HT-009` pronta, o PR de prova de `HT-007` pode violar uma fronteira em
  código real em vez de fixture.

**Consequência assumida:** `RNF-021` ("gates bloqueiam de fato") fica satisfeito
só localmente até `HT-007`. `HT-007` volta a `Ready` quando o time decidir fazer
o push de `develop`.

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
| 5 | `HT-016` | Inventário do frontend existente e destino dos mocks | Técnica | **Done** | HT-004 | RNF-018, RNF-020 |
| 6 | `HT-005` | Harness local reprodutível com docker compose | Técnica | **Done** | HT-004 | `v0.7.0` |
| 7 | `HT-006` | Infraestrutura de testes funcional/BDD e unitário | Técnica | **Done** | HT-005 | `v0.8.0` |
| 8 | `HT-007` | Pipeline de CI com gates bloqueantes | Técnica | Backlog — **adiada**, ver nota | HT-006 | RNF-021 |
| 9 | `HT-008` | Baseline de segurança: segredos, autorização, varredura | Técnica | **Em revisão** | ~~HT-007~~ (parcial — ver nota) | RNF-012, RNF-013, RNF-015 |

### Fase 2 — Esqueleto do sistema e fronteira com a web

| Ordem | Chave | Título | Tipo | Estado | Depende de | UI hoje |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | `HT-009` | Esqueleto do backend hexagonal (`ADR-001`) | Técnica | **Done** (puxada antes da 8 e da 9) | HT-006, HT-004 | `v0.9.0` |
| 11 | `HT-010` | Persistência PostgreSQL, migrações e cifra em repouso | Técnica | **Done** | HT-009, HT-004 | `v0.10.0` |
| 12 | `HT-017` | Contrato de dados entre a web e a API | Técnica | **Done** | HT-016, HT-009 | Define como a UI atual passa a receber dado |
| 13 | `HN-001` | Acesso: cadastro, login e encerramento de sessão | Negócio | **Em revisão** | HT-010, HT-008, HT-017 | Telas prontas; `Login.tsx` faz `console.log` + `setTimeout` |
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
- _(vazio — WIP 1)_

### Em execução
- _(vazio)_

### Em revisão
- `HN-001` — Acesso (ordem 13) — commit local feito; **tag `v0.13.0` aguarda autorização humana**
- `HT-008` — Baseline de segurança (ordem 9) — commit local feito; **tag `v0.12.0` aguarda autorização humana**

### Done
- `HT-000` `v0.1.0` · `HT-001` `v0.2.0` · `HT-002` `v0.3.0` · `HT-003` `v0.4.0` · `HT-004` `v0.5.0` · `HT-016` `v0.6.0` · `HT-005` `v0.7.0` · `HT-006` `v0.8.0` · `HT-009` `v0.9.0` · `HT-010` `v0.10.0` · `HT-017` `v0.11.0`

Todas verificadas por `scripts/verificar-fechamento.sh`: tag e commit no mesmo
hash, mensagem semântica citando a chave, documento de entrega presente.

### Backlog
Ordens 5 a 30 na tabela acima.

## Grooming

Arquivo de história é criado quando o item entra em `Ready`, não antes.
Existem hoje como arquivo: `HT-000` a `HT-006`, `HT-008`, `HT-009`, `HT-010`, `HT-016`, `HT-017`, `HT-018` e `HN-001` — a primeira `HN` groomada, agora que `HT-016` definiu o aproveitamento das telas.

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
| 2026-09-05 | `HT-004` | Em revisão | Done | `v0.5.0` → `a1fa811` |
| 2026-09-05 | `HT-016` | Ready | Em execução | `docs/tasks/HT-016/` criado com TASK e IMPLEMENTATION |
| 2026-09-05 | `HT-016` | Em execução | Em revisão | Inventário completo; aguardando gates e fechamento |
| 2026-09-05 | `HT-016` | Em revisão | Done | `v0.6.0` → `5ebeb8a` |
| 2026-09-07 | `HT-005` | Backlog | Ready | Arquivo de história criado com critérios verificáveis; dependência `HT-004` concluída |
| 2026-09-07 | `HT-005` | Ready | Em execução | `docs/tasks/HT-005/` criado com TASK e IMPLEMENTATION; vermelho inicial registrado em `evidencia/` |
| 2026-09-07 | `HT-005` | Em execução | Em revisão | Harness preenchido; 7 evidências de execução em disco; gates SRE e Segurança aprovados |
| 2026-09-07 | `HT-005` | Em revisão | Done | `v0.7.0` → `3f57b53` |
| 2026-09-07 | `HT-006` | Backlog | Ready | Arquivo de história criado; `HT-005` concluída |
| 2026-09-07 | `HT-006` | Ready | Em execução | `docs/tasks/HT-006/` criado com TASK e IMPLEMENTATION |
| 2026-09-07 | `HT-006` | Em execução | Em revisão | `gates` verde de ponta a ponta; 8 evidências; QA, SRE e Arquitetura aprovados |
| 2026-09-07 | `HT-006` | Em revisão | Done | `v0.8.0` → `7e17dea` |
| 2026-09-07 | `HT-007` `HT-008` | Backlog | Backlog (adiadas) | Decisão do time; motivo na nota de reordenação |
| 2026-09-07 | `HT-009` | Backlog | Ready | Puxada antes das ordens 8 e 9; arquivo já existia (groomada em `ADR-001`) |
| 2026-09-07 | `HT-009` | Ready | Em execução | `docs/tasks/HT-009/` criado |
| 2026-09-07 | `HT-009` | Em execução | Em revisão | Contexto `lancamentos` completo; gate de fronteiras corrigido e provado em código real; 11 evidências |
| 2026-09-07 | `HT-009` | Em revisão | Done | `v0.9.0` → `b7f2945` |
| 2026-09-07 | `HT-010` | Backlog | Ready | Arquivo de história criado pelo loop autônomo (volta 1); dependências `HT-009`/`HT-004` concluídas |
| 2026-09-07 | `HT-010` | Ready | Em execução | `docs/tasks/HT-010/` criado (loop autônomo, volta 2) |
| 2026-09-07 | `HT-010` | Em execução | Em revisão | Gates verdes com persistência real; 9 evidências; commit local; tag pendente de OK humano (loop autônomo, volta 6) |
| 2026-09-07 | `HT-017` | Backlog | Ready | Dependências `HT-016`/`HT-009` concluídas; versão fixada `v0.11.0` (loop autônomo) |
| 2026-09-07 | `HT-017` | Ready | Em execução | `docs/tasks/HT-017/` criado (loop autônomo, volta 2) |
| 2026-09-07 | `HT-017` | Em execução | Em revisão | Contrato, RN-001, origem falsa e endpoint verdes; 2 furos do gate de fronteiras fechados; commit local; tag pendente (loop autônomo, volta 11) |
| 2026-09-07 | `HT-010` | Em revisão | Done | `v0.10.0` → `a419cf4`; `verificar-fechamento` verde |
| 2026-09-07 | `HT-017` | Em revisão | Done | `v0.11.0` → `1e011e4`; `verificar-fechamento` verde |
| 2026-09-07 | `HT-008` | Backlog | Em execução | Puxada com `HT-007` adiada; o critério de varredura no CI fica pendente e registrado. Decisão do time |
| 2026-09-07 | `HT-008` | Em execução | Em revisão | Barreira por titular provada por teste negativo e mutação; skill de Open Finance criada; 6 evidências; tag pendente |
| 2026-09-07 | `HN-001` | Backlog | Ready | Dependências `HT-008`/`HT-010`/`HT-017` concluídas; primeira `HN` a ganhar arquivo |
| 2026-09-07 | `HN-001` | Ready | Em execução | `docs/tasks/HN-001/` criado |
| 2026-09-07 | `HN-001` | Em execução | Em revisão | Acesso real; identidade por token substitui o cabeçalho de `HT-008`; `console.log` de credenciais eliminado; tag pendente |
