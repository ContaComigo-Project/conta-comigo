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
  ├─> docs/jira-pessoal/EPICO-NEGOCIO.md e EPICO-TECNICO.md
  └─> docs/jira-pessoal/historias{,-tecnicas}/  ->  KANBAN-OFICIAL.md
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

Nenhuma spec fechada. A primeira demanda do kanban (`HT-001`) é justamente
produzir a `SDD-001` com o time.
