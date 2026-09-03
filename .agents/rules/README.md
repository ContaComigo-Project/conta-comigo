---
name: rules-indice
description: Índice das rules do workflow agêntico, com severidade e relação de complemento entre elas.
document_type: index
applies_when:
  - descobrir qual rule se aplica a uma etapa do trabalho
  - criar uma rule nova
max_lines: 300
---

# Rules

Rule é uma restrição inegociável do processo. Ela diz o que **não** pode
acontecer e como provar que não aconteceu. Skill executa; rule limita.

| Rule | Severidade | Aplica-se a |
| --- | --- | --- |
| [spec-to-execution-plan](./spec-to-execution-plan/RULE.md) | Bloqueante | Escolha da próxima demanda e entrada em execução |
| [tdd-bdd-before-implementation](./tdd-bdd-before-implementation/RULE.md) | Bloqueante | Ordem entre teste e código |
| [test-evidence-quality](./test-evidence-quality/RULE.md) | Bloqueante | Qualidade da prova e evidência |
| [refactor-after-functional-green](./refactor-after-functional-green/RULE.md) | Bloqueante | Etapa de limpeza pós-verde |
| [clean-code-readable-names](./clean-code-readable-names/RULE.md) | Recomendada forte | Nomes e legibilidade |
| [architecture-boundaries-and-solid](./architecture-boundaries-and-solid/RULE.md) | Bloqueante | Fronteiras, SOLID, ports/adapters |
| [main-push-quality-and-versioning](./main-push-quality-and-versioning/RULE.md) | Bloqueante | Fechamento, commit, tag e push |

## Mapa de complemento

```
spec-to-execution-plan
  └─ tdd-bdd-before-implementation
       ├─ test-evidence-quality
       └─ refactor-after-functional-green
            ├─ clean-code-readable-names
            └─ architecture-boundaries-and-solid
                 └─ main-push-quality-and-versioning
```

Uma rule pode complementar outra rule e complementar skills; ela nunca as
contradiz. Conflito entre rules é resolvido pela mais restritiva e registrado
como decisão na entrega.

## Estrutura obrigatória de uma rule

Cada rule é **uma pasta própria** (não um arquivo `.md` solto):

```
.agents/rules/<nome-rule-kebab-case>/
└── RULE.md                    ← arquivo principal, SEMPRE com este nome
                                   (frontmatter obrigatório, ≤300 linhas)
```

Quando (e somente quando) surgir conteúdo complementar — snippets de
exemplo de violação, checklists de conformidade ou referências normativas —
crie a subpasta `assets/` no mesmo nível:

```
.agents/rules/<nome-rule-kebab-case>/
├── RULE.md
└── assets/                    ← OPCIONAL. Cria só se tiver conteúdo real.
    ├── checklists/…
    ├── examples/…
    └── refs/…
```

Arquivos em `assets/` NÃO contam no limite de 300 linhas (regra `12b`
do setup-inicial).

## Como criar uma rule

1. Frontmatter obrigatório: `name`, `description`, `document_type`, `severity`,
   `applies_when`, `complements`, `complemented_by`, `max_lines`.
2. Responsabilidade única: uma rule, uma restrição.
3. Máximo de 300 linhas (apenas no `RULE.md`; arquivos em `assets/` são livres).
4. Precisa conter: intenção, obrigações, como verificar e sinais de violação.
5. Rule que não pode ser verificada não é rule — é conselho, e vai para uma skill.
