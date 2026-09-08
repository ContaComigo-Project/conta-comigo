---
name: rules-indice
description: Index of the agentic workflow rules, with severity and complement relationships among them.
document_type: index
applies_when:
  - discovering which rule applies to a stage of the work
  - creating a new rule
max_lines: 300
---

# Rules

A Rule is a non-negotiable constraint of the process. It states what must **not**
happen and how to prove it did not happen. Skill executes; rule limits.

| Rule | Severity | Applies to |
| --- | --- | --- |
| [spec-to-execution-plan](./spec-to-execution-plan/RULE.md) | Blocking | Choosing the next demand and entering execution |
| [tdd-bdd-before-implementation](./tdd-bdd-before-implementation/RULE.md) | Blocking | Order between test and code |
| [test-evidence-quality](./test-evidence-quality/RULE.md) | Blocking | Quality of proof and evidence |
| [refactor-after-functional-green](./refactor-after-functional-green/RULE.md) | Blocking | Post-green cleanup stage |
| [clean-code-readable-names](./clean-code-readable-names/RULE.md) | Strongly recommended | Names and readability |
| [architecture-boundaries-and-solid](./architecture-boundaries-and-solid/RULE.md) | Blocking | Boundaries, SOLID, ports/adapters |
| [main-push-quality-and-versioning](./main-push-quality-and-versioning/RULE.md) | Blocking | Closing, commit, tag and push |

## Complement map

```
spec-to-execution-plan
  └─ tdd-bdd-before-implementation
       ├─ test-evidence-quality
       └─ refactor-after-functional-green
            ├─ clean-code-readable-names
            └─ architecture-boundaries-and-solid
                 └─ main-push-quality-and-versioning
```

A rule may complement another rule and complement skills; it never
contradicts them. Conflict between rules is resolved by the most restrictive one and recorded
as a decision in the delivery.

## Mandatory structure of a rule

Each rule is **its own folder** (not a loose `.md` file):

```
.agents/rules/<rule-name-kebab-case>/
└── RULE.md                    ← main file, ALWAYS with this name
                                   (mandatory frontmatter, ≤300 lines)
```

When (and only when) complementary content arises — violation example
snippets, compliance checklists or normative references —
create the `assets/` subfolder at the same level:

```
.agents/rules/<rule-name-kebab-case>/
├── RULE.md
└── assets/                    ← OPTIONAL. Create only if it has real content.
    ├── checklists/…
    ├── examples/…
    └── refs/…
```

Files in `assets/` do NOT count toward the 300-line limit (rule `12b`
of initial-setup).

## How to create a rule

1. Mandatory frontmatter: `name`, `description`, `document_type`, `severity`,
   `applies_when`, `complements`, `complemented_by`, `max_lines`.
2. Single responsibility: one rule, one constraint.
3. Maximum of 300 lines (only in `RULE.md`; files in `assets/` are free).
4. Must contain: intent, obligations, how to verify and signs of violation.
5. A rule that cannot be verified is not a rule — it is advice, and goes to a skill.
