---
name: adr-template
description: Template de registro de decisão de arquitetura, com contexto, alternativas, decisão, consequência e caminho de reversão.
document_type: template
applies_when:
  - registrar uma decisão estrutural nova
max_lines: 300
---

# ADR-XXX — [Decisão em uma frase]

- **Status:** Proposta | Aceita | Substituída por ADR-XXX | Descartada
- **Data:** [AAAA-MM-DD]
- **História:** `[CHAVE]`
- **Decidido por:** [quem]

## Contexto

[Qual é a situação que força uma escolha. Fatos, não preferências. O que
acontece se ninguém decidir.]

## Alternativas consideradas

### A — [nome]

| | |
| --- | --- |
| Como funciona | |
| A favor | |
| Contra | |
| Por que não foi escolhida | |

### B — [nome]

| | |
| --- | --- |
| Como funciona | |
| A favor | |
| Contra | |
| Por que não foi escolhida | |

## Decisão

[O que foi escolhido, em uma frase afirmativa. Depois, as regras concretas que
derivam da escolha — o que alguém precisa fazer ou evitar por causa dela.]

## Consequências

**O que ganhamos:** [lista]

**O que perdemos:** [lista — se esta seção estiver vazia, a análise está incompleta]

**O que passa a ser obrigatório:** [regras que o gate vai cobrar]

## Como verificar que a decisão está sendo respeitada

[Comando, teste ou checagem automatizável. Decisão que ninguém consegue
verificar vira decoração em três semanas.]

## Como reverter

[O que precisaria acontecer para a decisão ser revisitada, e qual o custo de
voltar atrás.]

## Requisitos relacionados

`RF-XXX`, `RN-XXX`, `RNF-XXX`
