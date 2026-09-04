---
name: sdd-indice
description: Explica o papel do spec-driven-development como entendimento inicial que alimenta épicos, histórias e padrões de qualidade.
document_type: index
applies_when:
  - iniciar o entendimento de um produto ou de um novo domínio
  - decidir onde registrar descoberta antes de existir história
max_lines: 300
---

# Spec-Driven Development (SDD)

O SDD é a **camada de entendimento**, não uma fila paralela de execução.
Nada aqui é executável por si só: uma especificação só vira trabalho depois de
ser quebrada em épico, requisitos e histórias no `KANBAN-OFICIAL.md`.

## Fluxo

```
SDD (entendimento)
  ├─> docs/requisitos/            (RF, RNF, RN com identificador estável)
  ├─> docs/backlog/EPICO-NEGOCIO.md e EPICO-TECNICO.md
  └─> docs/backlog/historias{,-tecnicas}/  ->  KANBAN-OFICIAL.md
```

## O que uma spec precisa responder

1. Qual problema, de quem, e como sabemos que foi resolvido.
2. Quais são os limites: o que **não** está no escopo.
3. Quais decisões ainda estão em aberto e quem decide.
4. Quais riscos derrubam o produto se estivermos errados.

## Convenção de arquivos

`SDD-001-<assunto-em-kebab-case>.md`, numeração sequencial e imutável.
Use [SDD-000-template.md](./SDD-000-template.md) como base.

## Estado atual

| Spec | Assunto | Status |
| --- | --- | --- |
| [SDD-001](./SDD-001-contacomigo-poc.md) | ContaComigo (PoC) — problema, personas, escopo, fluxos e quebra | Aprovada |

A `SDD-001` já foi quebrada em requisitos (`docs/requisitos/`), épicos e 28
itens de fila no `KANBAN-OFICIAL.md`. Sete decisões seguem em aberto na seção 7
da spec; quatro delas são resolvidas por `HT-004`.
