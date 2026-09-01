---
name: kanban-oficial
description: Fonte única e oficial da ordem cronológica de execução do projeto; define qual é a próxima demanda a ser puxada.
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

- **Limite de trabalho em progresso (WIP): 1.** Uma história em `Em execução` por vez.
- Puxar sempre o item `Ready` de menor `Ordem`.
- Estado só muda com evidência, nunca por intenção.

## Próxima demanda

**`HT-001` — Conduzir a sessão de spec-driven-development inicial (SDD-001).**

Enquanto `HT-001` não fechar, o backlog de produto permanece intencionalmente
vazio: requisitos funcionais e não funcionais serão definidos pelo time.

## Fluxo de estados

```
Backlog -> Ready -> Em execução -> Em revisão -> Done
             ^                         |
             +------ devolvida --------+
```

| Estado | Condição de entrada |
| --- | --- |
| `Backlog` | História existe, escopo ainda não fechado |
| `Ready` | Critérios de aceite verificáveis, requisitos citados, dependências resolvidas |
| `Em execução` | Existe `docs/tasks/[CHAVE]/` com TASK, IMPLEMENTATION e progress |
| `Em revisão` | Testes verdes, refatoração feita, gates aplicáveis executados |
| `Done` | Evidência registrada, `docs/entregas/` criado, commit semântico e tag no mesmo hash |

## Fila cronológica oficial

| Ordem | Chave | Título | Tipo | Épico | Estado | Depende de | Entrega |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | `HT-000` | Fundação do workflow agêntico (governança, rules, skills, harness) | Técnica | Técnico | Em revisão | — | [ENTREGA-HT-000](../entregas/ENTREGA-HT-000-fundacao-workflow-agentico.md) |
| 1 | `HT-001` | Conduzir SDD-001 e registrar entendimento inicial | Técnica | Técnico | Ready | HT-000 | — |
| 2 | `HT-002` | Catalogar RF e RN a partir da SDD-001 | Técnica | Técnico | Backlog | HT-001 | — |
| 3 | `HT-003` | Catalogar RNF a partir da SDD-001 | Técnica | Técnico | Backlog | HT-001 | — |
| 4 | `HT-004` | Decidir stack e registrar decisões de arquitetura | Técnica | Técnico | Backlog | HT-002, HT-003 | — |
| 5 | `HT-005` | Harness local reprodutível (comandos únicos, Docker quando fizer sentido) | Técnica | Técnico | Backlog | HT-004 | — |
| 6 | `HT-006` | Estratégia de testes: funcional/BDD primeiro, unitário depois | Técnica | Técnico | Backlog | HT-005 | — |
| 7 | `HT-007` | Pipeline CI com gates obrigatórios | Técnica | Técnico | Backlog | HT-006 | — |
| 8 | `HT-008` | Baseline de segurança e privacidade | Técnica | Técnico | Backlog | HT-004 | — |
| 9 | `HT-009` | Observabilidade mínima (logs, métricas, erro) | Técnica | Técnico | Backlog | HT-004 | — |
| 10 | `HN-001` | _(primeira história de negócio — definida ao fechar HT-002)_ | Negócio | Negócio | Backlog | HT-002 | — |

## Quadro

### Backlog
- `HT-002` · `HT-003` · `HT-004` · `HT-005` · `HT-006` · `HT-007` · `HT-008` · `HT-009` · `HN-001`

### Ready
- `HT-001` — Conduzir SDD-001 e registrar entendimento inicial

### Em execução
- _(vazio — WIP 1)_

### Em revisão
- `HT-000` — Fundação do workflow agêntico (aguarda commit semântico + tag `v0.1.0` para ir a Done)

### Done
- _(vazio)_

## Histórico de movimentações

| Data | Chave | De | Para | Evidência |
| --- | --- | --- | --- | --- |
| 2026-09-01 | `HT-000` | — | Em revisão | `docs/entregas/ENTREGA-HT-000-fundacao-workflow-agentico.md` |
