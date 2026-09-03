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
| [product-manager](./product-manager/SKILL.md) | Produto | Definir escopo, requisitos, histórias, kanban e entrega |
| [executor-agent](./executor-agent/SKILL.md) | Execução | Implementar a história puxada |
| [qa-agent](./qa-agent/SKILL.md) | Gate | Validar testes, cobertura e evidência |
| [sre-agent](./sre-agent/SKILL.md) | Gate | Validar ambiente, harness, CI/CD, observabilidade |
| [security-specialist-agent](./security-specialist-agent/SKILL.md) | Gate | Validar autenticação, autorização, dados e segredos |
| [architect-reviewer-agent](./architect-reviewer-agent/SKILL.md) | Gate | Validar fronteiras, SOLID e manutenibilidade |
| [final-reviewer-agent](./final-reviewer-agent/SKILL.md) | Gate | Cruzar tudo e autorizar o fechamento |
| [git-operator](./git-operator/SKILL.md) | Execução | Commit semântico e tag no mesmo hash |
| [commit-conventions](./commit-conventions/SKILL.md) | Execução / gate | Valida formato e metadados do commit, incluindo rodapé Gerado-por-IA com modelo |

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
## Estrutura obrigatória de uma skill

Cada skill é **uma pasta própria** (não um arquivo `.md` solto):

```
.agents/skills/<nome-skill-kebab-case>/
└── SKILL.md                  ← arquivo principal, SEMPRE com este nome
                                 (frontmatter obrigatório, ≤300 linhas)
```

Quando (e somente quando) surgir conteúdo complementar — snippets de
código, checklists, templates, referências ou exemplos reais — crie a
subpasta `assets/` no mesmo nível, com a organização que fizer sentido:

```
.agents/skills/<nome-skill-kebab-case>/
├── SKILL.md
└── assets/                   ← OPCIONAL. Cria só se tiver conteúdo real.
    ├── checklists/…
    ├── snippets/…
    ├── examples/…
    ├── templates/…
    └── refs/…
```

Arquivos dentro de `assets/` NÃO contam no limite de 300 linhas
(regra `12b` do setup-inicial).

### Requisitos mínimos de uma skill

1. Frontmatter com `name`, `description`, `document_type`, `role`,
2. Responsabilidade única declarada em uma frase.
3. Máximo de 300 linhas (apenas no `SKILL.md`; arquivos em `assets/` são livres).
4. Roteiro verificável, critério de veredito e antipadrões.
5. Fronteira explícita: o que ela **não** decide.
