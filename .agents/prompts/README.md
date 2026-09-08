---
name: prompts-indice
description: Index of reusable prompts of the agentic workflow.
document_type: index
applies_when:
  - locating the prompt of a process stage
max_lines: 300
---

# Prompts

| Prompt | Use |
| --- | --- |
| [ralph-loop](./ralph-loop/PROMPT.md) | Perceive → Orient → Decide → Act → Record cycle per story |
| [initial-setup](./initial-setup/PROMPT.md) | Foundation prompt of the agentic workflow (bootstrap of a new project) |

## Source of truth

- `.agents/prompts/*` is the **official source of truth**, versioned in git. Every
  assistant, team member and process must read and edit ONLY here.
- Convenience copies for bootstrapping specific IDEs are the LOCAL responsibility
  of each person's installation; they are never versioned and never serve as a
  shared reference. In any conflict, `.agents/*` wins.

## Mandatory structure of a prompt

Each prompt is **its own folder** (not a loose `.md` file):

```
.agents/prompts/<prompt-name-kebab-case>/
└── PROMPT.md                  ← main file, ALWAYS with this name
                                   (mandatory frontmatter, ≤300 lines)
```

When (and only when) complementary content emerges — usage examples, attached
templates or documentary references — create the `assets/` subfolder at the
same level:

```
.agents/prompts/<prompt-name-kebab-case>/
├── PROMPT.md
└── assets/                    ← OPTIONAL. Create it only if it has real content.
    ├── templates/…
    ├── examples/…
    └── refs/…
```

Files in `assets/` do NOT count against the 300-line limit (rule `12b`
of initial-setup).

## Convention

- Mandatory frontmatter, single responsibility, maximum of 300 lines in the main
  `PROMPT.md` file.
- A prompt describes a **procedure**; a rule describes a **constraint**; a skill
  describes a **role**. When a prompt starts imposing a constraint, extract a rule.
