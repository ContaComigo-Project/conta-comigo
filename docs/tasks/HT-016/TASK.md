---
name: task-ht-016
description: Recorte executável da história HT-016 — inventariar a camada web, mapear tela para requisito e decidir o destino de cada comportamento hoje nos mocks.
document_type: task
applies_when:
  - executar a história HT-016
max_lines: 300
---

# TASK — `HT-016`

- **História:** [`docs/backlog/historias-tecnicas/HT-016-inventario-frontend.md`](../../backlog/historias-tecnicas/HT-016-inventario-frontend.md)
- **Iniciada em:** 2026-09-05
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Produzir `docs/backlog/inventario-frontend.md` que classifica os 41 componentes e os 9
mocks da camada web (mantém / adapta / descarta), mapeia cada um para o `RF` que
serve, lista toda regra de negócio hoje fora do domínio com arquivo e linha, e
resolve `RN-024` e `RN-025`.

## Critérios de aceite copiados da história

- [ ] `docs/backlog/inventario-frontend.md` lista os componentes com: caminho, `RF`
      servido, classificação (mantém / adapta / descarta) e motivo
- [ ] Componente sem `RF` correspondente está marcado como "sem requisito" e
      vira decisão registrada
- [ ] Os 9 arquivos de mock estão classificados: vira contrato de dados, vira
      massa de teste, ou é descartado
- [ ] Toda regra de negócio encontrada em `src/` está listada com arquivo e linha
- [ ] `RN-024` e `RN-025` saem de `Rascunho` no catálogo: aprovadas ou descartadas,
      com motivo registrado
- [ ] Nenhum comportamento observado permanece em estado indefinido
- [ ] `KANBAN-OFICIAL.md` atualizado se o inventário mudar o escopo de alguma `HN`

## Escopo desta task

**Dentro:**

- Analisar `frontend/src` (58 arquivos .ts/.tsx, 5.930 linhas)
- Escrever `docs/backlog/inventario-frontend.md`
- Resolver `RN-024` e `RN-025` no catálogo
- Atualizar kanban e documento de entrega

**Fora:**

- Alterar qualquer código do frontend
- Escrever teste
- Definir o contrato de dados (é `HT-017`)
- Instalar dependência

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `docs/backlog/inventario-frontend.md` | criar | Entregável central da história |
| `docs/requisitos/REGRAS-DE-NEGOCIO.md` | alterar | `RN-024`/`RN-025` saem de Rascunho |
| `docs/backlog/KANBAN-OFICIAL.md` | alterar | Estado HT-016 → Em execução / Done; notas de escopo |
| `docs/tasks/HT-016/TASK.md` | alterar | Este recorte |
| `docs/tasks/HT-016/IMPLEMENTATION.md` | alterar | Plano técnico |
| `docs/tasks/HT-016/progress.txt` | alterar | Diário append-only |
| `docs/entregas/ENTREGA-HT-016-inventario-frontend.md` | criar | Documento de entrega |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-004` (decisões de stack) | Done | Não |
| Acesso de leitura ao `frontend/src` | Disponível | — |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".