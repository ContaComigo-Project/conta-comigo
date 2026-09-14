---
name: task-template
description: Recorte executável de uma história — escopo concreto, arquivos afetados e critério de parada.
document_type: template
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `[CHAVE]`

- **História:** [caminho do arquivo da história]
- **Iniciada em:** [AAAA-MM-DD]
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

[O que estará funcionando ao final.]

## Critérios de aceite copiados da história

- [ ] [critério 1]
- [ ] [critério 2]

## Escopo desta task

**Dentro:** [lista]

**Fora:** [lista — qualquer coisa aqui que apareça vira nova história, não escopo extra]

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| | criar/alterar/remover | |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| | | |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
