---
name: skills-indice
description: Index of the agentic workflow skills, with role, trigger moment and complement relationship.
document_type: index
applies_when:
  - choosing which skill triggers the next action
  - creating a new skill for a specific domain
max_lines: 300
---

# Skills

A skill is a role with its own procedure. It executes; the rule limits.
A skill can complement another, never replace the verdict of someone else's gate.

| Skill | Role | Triggers when |
| --- | --- | --- |
| [product-manager](./product-manager/SKILL.md) | Product | Define scope, requirements, stories, kanban and delivery |
| [executor-agent](./executor-agent/SKILL.md) | Execution | Implement the pulled story |
| [qa-agent](./qa-agent/SKILL.md) | Gate | Validate tests, coverage and evidence |
| [sre-agent](./sre-agent/SKILL.md) | Gate | Validate environment, harness, CI/CD, observability |
| [security-specialist-agent](./security-specialist-agent/SKILL.md) | Gate | Validate authentication, authorization, data and secrets |
| [architect-reviewer-agent](./architect-reviewer-agent/SKILL.md) | Gate | Validate boundaries, SOLID and maintainability |
| [open-finance-security-agent](./open-finance-security-agent/SKILL.md) | Gate / specialist | Validate consent, aggregator credential, isolation between account holders and retention of financial data |
| [code-reviewer-agent](./code-reviewer-agent/SKILL.md) | Review / analysis | Inspect diffs, bugs, secrets and patterns before the commit |
| [final-reviewer-agent](./final-reviewer-agent/SKILL.md) | Gate | Cross everything and authorize the closure |
| [commit-crafter-agent](./commit-crafter-agent/SKILL.md) | Execution | Prepare selective staging and draft a semantic commit in English |
| [git-operator](./git-operator/SKILL.md) | Execution | Semantic commit and tag on the same hash |
| [commit-conventions](./commit-conventions/SKILL.md) | Execution / gate | Validates commit format and metadata, including the Generated-by-AI footer with model |

## Typical order in a story

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
                                          product-manager (closes kanban)
```

Intermediate gates are triggered according to the marking in the story; the final
gate is always mandatory.

## Additional specialists

Create specific skills when the domain requires judgment that the current ones do
not cover — for example `data-specialist-agent`, `ux-writer-agent`,
`performance-agent`, `compliance-agent`. Every new skill needs:
## Mandatory structure of a skill

Each skill is **its own folder** (not a loose `.md` file):

```
.agents/skills/<skill-name-kebab-case>/
└── SKILL.md                  ← main file, ALWAYS with this name
                                 (mandatory frontmatter, ≤300 lines)
```

When (and only when) complementary content arises — code snippets, checklists,
templates, references or real examples — create the `assets/` subfolder at the
same level, with whatever organization makes sense:

```
.agents/skills/<skill-name-kebab-case>/
├── SKILL.md
└── assets/                   ← OPTIONAL. Create only if it has real content.
    ├── checklists/…
    ├── snippets/…
    ├── examples/…
    ├── templates/…
    └── refs/…
```

Files inside `assets/` do NOT count toward the 300-line limit
(rule `12b` of initial-setup).

### Minimum requirements of a skill

1. Frontmatter with `name`, `description`, `document_type`, `role`,
2. Single responsibility declared in one sentence.
3. Maximum of 300 lines (only in the `SKILL.md`; files in `assets/` are free).
4. Verifiable checklist, verdict criteria and antipatterns.
5. Explicit boundary: what it does **not** decide.