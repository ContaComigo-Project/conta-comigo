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
| [ralph-loop](./ralph-loop.md) | Ciclo Perceber → Orientar → Decidir → Agir → Registrar por história |
| [`.claude/prompt/prompt-setup-inicial-projeto-agentico.md`](../../.claude/prompt/prompt-setup-inicial-projeto-agentico.md) | Prompt de bootstrap que originou esta estrutura |

## Convenção

- Frontmatter obrigatório, responsabilidade única, máximo de 300 linhas.
- Prompt descreve **procedimento**; rule descreve **restrição**; skill descreve
  **papel**. Quando um prompt começa a impor restrição, extraia uma rule.
