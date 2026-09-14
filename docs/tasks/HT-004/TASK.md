---
name: task-ht-004
description: Recorte executável da história HT-004 — fechar as quatro decisões de stack em aberto e registrá-las como ADR-002..ADR-005.
document_type: task
applies_when:
  - executar a história HT-004
max_lines: 300
---

# TASK — `HT-004`

- **História:** [`docs/backlog/historias-tecnicas/HT-004-decisoes-de-stack.md`](../../backlog/historias-tecnicas/HT-004-decisoes-de-stack.md)
- **Iniciada em:** 2026-09-05
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Fechar as quatro decisões de stack que travam a fila (ORM, teste, autenticação e
hospedagem) e registrá-las como `ADR-002` a `ADR-005` em `docs/adr/`, com
contexto, alternativas, consequência e caminho de reversão.

## Critérios de aceite copiados da história

- [ ] Existe um ADR por decisão em `docs/adr/`, numerados de `ADR-002` a `ADR-005`
- [ ] Nenhuma decisão contraria `ADR-001`: ORM sem decorator na entidade de domínio;
      teste roda caso de uso sem subir framework
- [ ] A decisão de teste nomeia a ferramenta que verifica as fronteiras de importação
      e confirma que ela existe para a stack
- [ ] Cada ADR registra contexto, ao menos duas alternativas, escolha e consequência
- [ ] Cada ADR declara **o que precisaria acontecer para revertê-la**
- [ ] Cada decisão declara o impacto no custo, e nenhuma sai do free tier (`RNF-011`)
- [ ] A decisão de autenticação declara como `RNF-013` será atendida
- [ ] A decisão de ORM declara como `RNF-014` será atendida e como o modelo de
      persistência fica separado da entidade de domínio
- [ ] A decisão de teste declara como o rastreio RN→teste (`RNF-018`) será verificável
- [ ] `EPICO-TECNICO.md` seção 3 atualizado: as linhas saem de "Em aberto"
- [ ] `SDD-001` seção 7 atualizada: as questões saem de "em aberto"
- [ ] Nenhuma dependência nova é adicionada ao `package.json` nesta história
- [ ] A decisão de teste considera a camada web (5.930 linhas, zero teste) e declara
      se ela entra na medição de cobertura

## Escopo desta task

**Dentro:**

- Escrever `ADR-002` (ORM Prisma + PostgreSQL), `ADR-003` (Vitest + Playwright +
  dependency-cruiser), `ADR-004` (JWT próprio), `ADR-005` (hospedagem adiada —
  dev primeiro)
- Atualizar `docs/adr/README.md`, `EPICO-TECNICO.md` (seção 3) e `SDD-001`
  (seção 7)
- Preencher `TASK.md`, `IMPLEMENTATION.md` e `progress.txt`
- Atualizar `KANBAN-OFICIAL.md` (HT-004 `Done`, HT-016 `Ready`)
- Criar `docs/entregas/ENTREGA-HT-004-decisoes-de-stack.md`

**Fora:**

- Instalar dependências ou escrever código (é de outras histórias)
- Configurar o harness (é `HT-005`)
- Decidir teto de custo de IA (é `HT-012`/`HT-013`)
- Decidir prazo de exclusão após revogação (é `HN-012`)

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `docs/adr/ADR-002-orm-prisma.md` | criar | Decisão de ORM |
| `docs/adr/ADR-003-testes-vitest-playwright.md` | criar | Decisão de framework de teste |
| `docs/adr/ADR-004-autenticacao-jwt-proprio.md` | criar | Decisão de autenticação |
| `docs/adr/ADR-005-hospedagem-adiada.md` | criar | Decisão de hospedagem (dev primeiro) |
| `docs/adr/README.md` | alterar | Linhas ADR-002..005 saem de "Pendente" |
| `docs/backlog/EPICO-TECNICO.md` | alterar | Seção 3: linhas saem de "Em aberto" |
| `docs/spec-driven-development/SDD-001-contacomigo-poc.md` | alterar | Seção 7: questões resolvidas |
| `docs/backlog/KANBAN-OFICIAL.md` | alterar | Estado HT-004 → Done, HT-016 → Ready |
| `docs/tasks/HT-004/TASK.md` | alterar | Este recorte |
| `docs/tasks/HT-004/IMPLEMENTATION.md` | alterar | Plano técnico |
| `docs/tasks/HT-004/progress.txt` | alterar | Diário append-only |
| `docs/entregas/ENTREGA-HT-004-decisoes-de-stack.md` | criar | Documento de entrega |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-003` (catálogo RNF) | Done | Não |
| `ADR-001` (arquitetura hexagonal) | Aceita | Sim — nenhuma decisão pode contrariá-la |
| Decisão de stack pelo time | Fechada | — |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".