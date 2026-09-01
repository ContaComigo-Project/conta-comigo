---
name: skills-indice
description: Índice das skills do workflow agêntico, com papel, momento de acionamento e relação de complemento.
document_type: index
applies_when:
  - escolher qual skill aciona a próxima ação
  - criar uma skill nova para um domínio específico
max_lines: 300
---

# Skills

Skill é um papel com procedimento próprio. Ela executa; a rule limita.
Uma skill pode complementar outra, nunca substituir o veredito de um gate alheio.

| Skill | Papel | Aciona quando |
| --- | --- | --- |
| [product-manager](./product-manager.md) | Produto | Definir escopo, requisitos, histórias, kanban e entrega |
| [executor-agent](./executor-agent.md) | Execução | Implementar a história puxada |
| [qa-agent](./qa-agent.md) | Gate | Validar testes, cobertura e evidência |
| [sre-agent](./sre-agent.md) | Gate | Validar ambiente, harness, CI/CD, observabilidade |
| [security-specialist-agent](./security-specialist-agent.md) | Gate | Validar autenticação, autorização, dados e segredos |
| [architect-reviewer-agent](./architect-reviewer-agent.md) | Gate | Validar fronteiras, SOLID e manutenibilidade |
| [final-reviewer-agent](./final-reviewer-agent.md) | Gate | Cruzar tudo e autorizar o fechamento |
| [git-operator](./git-operator.md) | Execução | Commit semântico e tag no mesmo hash |

## Ordem típica em uma história

```
product-manager  ->  executor-agent  ->  qa-agent
                                          +  sre-agent
                                          +  security-specialist-agent
                                          +  architect-reviewer-agent
                                                     |
                                          final-reviewer-agent
                                                     |
                                              git-operator
                                                     |
                                          product-manager (fecha kanban)
```

Gates intermediários são acionados conforme a marcação na história; o gate final
é sempre obrigatório.

## Especialistas adicionais

Crie skills específicas quando o domínio exigir julgamento que as atuais não
cobrem — por exemplo `data-specialist-agent`, `ux-writer-agent`,
`performance-agent`, `compliance-agent`. Toda skill nova precisa de:

1. Frontmatter com `name`, `description`, `document_type`, `role`,
   `applies_when`, `uses_rules`, `complements`, `complemented_by`, `outputs`,
   `max_lines`.
2. Responsabilidade única declarada em uma frase.
3. Máximo de 300 linhas.
4. Roteiro verificável, critério de veredito e antipadrões.
5. Fronteira explícita: o que ela **não** decide.
