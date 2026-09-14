---
name: tasks-indice
description: Explica o diretório de planos de execução por história, criado antes de qualquer código produtivo.
document_type: index
applies_when:
  - iniciar a execução de uma história puxada do kanban
max_lines: 300
---

# Tasks — Planos de Execução

Uma pasta por história: `docs/tasks/[CHAVE]/`.

| Arquivo | Papel | Quando é escrito |
| --- | --- | --- |
| `TASK.md` | Recorte executável da história: escopo, arquivos, dependências | Antes de qualquer código |
| `IMPLEMENTATION.md` | Plano técnico, estratégia de testes, gates e riscos | Antes de qualquer código |
| `progress.txt` | Diário append-only do ciclo Ralph (Perceber → Registrar) | Durante toda a execução |

## Regras

- Sem essas três peças, a história não entra em `Em execução`.
- `progress.txt` é **append-only**: linha errada é corrigida com nova linha, não apagada.
- O plano pode mudar durante a execução; a mudança é registrada, não silenciada.
- Ao fechar a história, o conteúdo relevante é destilado para `docs/entregas/`.

Base: [`_TEMPLATE/`](./_TEMPLATE/). Copie com `scripts/nova-historia.sh [CHAVE]`.
