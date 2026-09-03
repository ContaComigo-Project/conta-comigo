---
name: prompts-indice
description: Índice dos prompts reutilizáveis do workflow agêntico.
document_type: index
applies_when:
  - localizar o prompt de uma etapa do processo
max_lines: 300
---

# Prompts

| Prompt | Uso |
| --- | --- |
| [ralph-loop](./ralph-loop/PROMPT.md) | Ciclo Perceber → Orientar → Decidir → Agir → Registrar por história |
| [setup-inicial](./setup-inicial/PROMPT.md) | Prompt de fundação do workflow agentico (bootstrap de projeto novo) |

## Fonte da verdade

- `.agents/prompts/*` é a **fonte da verdade** oficial e versionada no git.
- Arquivos dentro de `.claude/prompts/` são propriedade da IDE (configuração
  local por instalação); não servem de referência para a equipe. Qualquer regra
  definitiva deve ser copiada para `.agents/`.

## Estrutura obrigatória de um prompt

Cada prompt é **uma pasta própria** (não um arquivo `.md` solto):

```
.agents/prompts/<nome-prompt-kebab-case>/
└── PROMPT.md                  ← arquivo principal, SEMPRE com este nome
                                   (frontmatter obrigatório, ≤300 linhas)
```

Quando (e somente quando) surgir conteúdo complementar — exemplos de uso,
templates anexos ou referências documentais — crie a subpasta `assets/`
no mesmo nível:

```
.agents/prompts/<nome-prompt-kebab-case>/
├── PROMPT.md
└── assets/                    ← OPCIONAL. Cria só se tiver conteúdo real.
    ├── templates/…
    ├── examples/…
    └── refs/…
```

Arquivos em `assets/` NÃO contam no limite de 300 linhas (regra `12b`
do setup-inicial).

## Convenção

- Frontmatter obrigatório, responsabilidade única, máximo de 300 linhas no arquivo
  principal `PROMPT.md`.
- Prompt descreve **procedimento**; rule descreve **restrição**; skill descreve
  **papel**. Quando um prompt começa a impor restrição, extraia uma rule.
