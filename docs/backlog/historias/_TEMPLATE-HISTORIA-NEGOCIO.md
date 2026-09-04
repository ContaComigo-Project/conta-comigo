---
name: template-historia-negocio
description: Template de história de negócio com critérios de aceite verificáveis em Gherkin e rastreio a RF e RN.
document_type: template
applies_when:
  - criar uma história com comportamento percebido por usuário, operador, administrador ou cliente
max_lines: 300
---

# `HN-XXX` — [Título curto em linguagem de domínio]

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** Backlog | Ready | Em execução | Em revisão | Done
- **Requisitos:** `RF-XXX`, `RN-XXX`
- **Depende de:** [chaves ou —]
- **Versão prevista:** `vX.Y.Z`

## Narrativa

> Como **[persona]**
> quero **[capacidade]**
> para **[resultado percebido]**.

## Contexto

[Por que agora, e o que muda para a pessoa que usa. Sem solução técnica aqui.]

## Critérios de aceite

Cada critério vira um cenário funcional/BDD antes de existir código produtivo.

```gherkin
Cenário: [nome do comportamento]
  Dado [contexto]
  Quando [ação]
  Então [resultado observável]
```

```gherkin
Cenário: [caso de borda ou erro]
  Dado [contexto]
  Quando [ação inválida]
  Então [proteção esperada]
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-XXX` | |

## Fora de escopo

- [o que esta história não faz]

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | |
| Segurança | | |
| SRE | | |
| Arquitetura | | |
| Revisão final | Sim | |

## Definição de pronto

- [ ] Cenários funcionais/BDD escritos antes do código e agora verdes
- [ ] Refatoração feita após os funcionais verdes
- [ ] Testes unitários cobrindo casos de borda
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-XXX` e tag no mesmo hash
