---
name: commit-conventions
description: Commit convention rules (Conventional Commits + AI footer with model when applicable), pre-format validation, and official message template accepted by the ContaComigo final gate.
document_type: skill
role: execução / gate
applies_when:
  - before any git commit (manual or AI-assisted)
  - reviewing commit messages during the final gate
  - selective staging by git-operator
uses_rules:
  - main-push-quality-and-versioning
  - clean-code-readable-names
complements:
  - git-operator
  - final-reviewer-agent
complemented_by:
  - product-manager
outputs:
  - validated commit message
  - format evidence accepted by the repository
max_lines: 300
---

# Skill — Commit Conventions

## Unique responsibility

Ensure every entry in the commit history is **findable by key,
script-reproducible and auditable regarding authorship (human or AI-assisted), including the exact model used when the commit was generated, reviewed, refined, or written by an LLM.

This skill does not decide whether the delivery is ready (final-reviewer-agent) and does not decide scope (product-manager). It only validates **format, labels and commit metadata**.

## Pre-conditions

Refuses to validate if:

- the HT/HN key is missing or prefix is absent;
- the key does not match a Ready / In Progress row in KANBAN-OFICIAL;
- attempt to `git add -A` + commit everything together.

---

## MANDATORY RULE — COMMIT LANGUAGE = ENGLISH

**Every part of the commit message MUST be written in ENGLISH.** This is non-negotiable and enforced by the final gate.

Scope of the rule:

- `type(scope): description (key)` — type, scope, description — **all English**.
- Commit body paragraphs — English.
- Footer keys and values — English.
- Footer key names — English (e.g. `Refs:`, `Co-authored-by:`, `Generated-by-AI:`, `BREAKING CHANGE:`).
- Custom footer keys created by this project — English.

**What is exempt (and remains Portuguese):

- The story key identifiers `HT-XXX` / `HN-XXX` themselves (they are labels from the Portuguese kanban).
- File paths in `Refs:` pointing to Portuguese docs folder names when those already exist in Portuguese (e.g. `docs/RESUMO-MOCITEC.md).
- Names of people in `Co-authored-by:`.

Anti-pattern blocked by this rule: description in Portuguese. Example **REJECTED**:

```
feat(dashboard): adiciona widget de orçamento (HT-005)   ← REJEITADO — "adiciona widget de orçamento" is Portuguese
```

Accepted (description is a bit long but it's English, allowed:

```
feat(dashboard): add budget summary widget (HT-005)
```

---

## Official commit format (Conventional Commits + key + AI footer)

### 1. Subject line (mandatory, ≤ 72 columns)

```
type(scope): imperative description (HT-005)
```

Mandatory fields:

- **type** (one of 9 accepted values): see table below (feat, fix, refactor, test, docs, chore, perf, build, ci).
- **scope** (kebab-case): domain area or module, no abbreviations, optional for `docs`, `ci`, `build`.
- **description** (positive imperative mood): what the commit DOES, not what WAS done. E.g. *"add budget column to dashboard"* not "added" not "I added".
- **(HT-005)** or **(HN-001)** at the end. Stories without a key are REJECTED.

### 2. Body (optional, lines ≤ 72 columns)

Explain the WHY of the change. Do not repeat the description. If the commit body is long, split into paragraphs. Avoid bullet points (except in the footer).

### 3. Footer (1 or more lines, mandatory when applicable)

```
Refs: docs/deliveries/HT-005-budget-centralization.md
Co-authored-by: Miguel Leonardo <miguel@example.com>
Generated-by-AI: Claude 3.5 Sonnet (Build 20250829)
```

---

## Mandatory new rule — `Generated-by-AI: <model>` footer

### Applies WHENEVER ANY STAGE of the commit message OR the diff itself was suggested, written, adjusted, reviewed or validated by an AI model. Includes:

- assistant generated the entire commit message;
- human typed the diff and asked AI to *"improve the message"*;
- AI generated the code and the human only approved / tweaked;
- AI suggested the type/scope/key.

### Valid examples of `Generated-by-AI:`

```
Generated-by-AI: GLM-5.2
Generated-by-AI: Claude 3.5 Sonnet (Build 20250829)
Generated-by-AI: Gemini 2.5 Flash
Generated-by-AI: GPT-4o mini
Generated-by-AI: Claude 3 Opus
Generated-by-AI: Llama 3.1 70B Instruct via Ollama
Generated-by-AI: DeepSeek V3
```

### Field format rules:

1. **1 model per line.** If more than one model contributed, use MULTIPLE lines with `Generated-by-AI:`.
2. **If the commit is 100% human-written with NO AI intervention whatsoever, DO NOT USE the field.** Absence of the field is a formal guarantee of 100% human authorship.
3. **NEVER write a generic value such as "AI" or "LLM": always use the exact model name + version. Specificity matters for audit and suggestion reproducibility.

---

## Accepted types

| Type | When to use | Example |
| --- | --- | --- |
| `feat` | New capability perceivable by a user or stakeholder | `feat(dashboard): add budget summary widget (HT-005)` |
| `fix` | Wrong behavior correction | `fix(expenses): correct per-person split (HT-019)` |
| `refactor` | Internal change without changing external behavior | `refactor(governance): restructure .agents by folder (HT-004)` |
| `test` | Tests only, no production code change | `test(split): add BDD scenarios (HT-019)` |
| `docs` | Documentation only | `docs(frontend): document React architecture (HT-004)` |
| `chore` | Maintenance with no product impact | `chore(deps): bump vite to 5.4 (HT-004)` |
| `perf` | Performance improvement | `perf(core): reduce dashboard re-renders (HT-017)` |
| `build` | Packaging / bundler / binaries | `build(frontend): adjust Vercel output (HT-004)` |
| `ci` | Pipeline, Actions, automated checks | `ci: add lint step on PRs (HT-004)` |

## Validation procedure

1. Before the commit:
   - verify the key exists on the official KANBAN;
   - verify staged files belong to the same story.

2. Compose the message with the 3 blocks above.

3. Validate subject line size: ≤ 72 characters.

4. If **any** AI assistance exists, add the `Generated-by-AI: <model>` footer(s).

5. Only then execute the commit.

## Final verdict vs gate

- Rejected → go back to git-operator to fix the message.
- Approved → proceed to tag and push.

## Anti-patterns — blocked by this skill

1. No key in the subject: `feat: add budget widget` → **REJECTED**.
2. Past tense in the description: `feat: added column` → **REJECTED**.
3. **Portuguese / non-English description, scope, or body → **REJECTED**.
4. AI was used but footer is missing → **REJECTED** by the final gate.
5. `Generated-by-AI: AI` or other vague value → **REJECTED** (exact model required).
6. Multiple `Generated-by-AI` models jammed in the same line → **REJECTED** (1 per line).
7. More than one story in the same commit (staging leak) → **REJECTED**.
8. `git add -A` + commit everything → **REJECTED**.

## Full example — valid commit

```
feat(budget): centralize budget summary on dashboard (HT-005)

Unifies the budget widget with category data and 30-day projection,
replacing the two separate cards that were calculating values independently.

Refs: docs/deliveries/HT-005-budget-centralization.md
Co-authored-by: Miguel Leonardo <miguel@example.com>
Generated-by-AI: Claude 3.5 Sonnet (Build 20250829)
```
