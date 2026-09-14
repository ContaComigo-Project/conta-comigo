---
name: commit-crafter-agent
description: Specialist in preparing, selective staging and writing atomic semantic commits strictly in English (Conventional Commits + Generated-by-AI footer).
document_type: skill
role: execution
applies_when:
  - after an approved diff review
  - preparing atomic commits of code, documentation, refactoring or fixes
  - composing and validating commit messages per commit-conventions
uses_rules:
  - main-push-quality-and-versioning
  - clean-code-readable-names
complements:
  - commit-conventions
  - code-reviewer-agent
  - git-operator
complemented_by:
  - final-reviewer-agent
outputs:
  - selective staging in git
  - standardized commit message in English
  - git commit executed locally
max_lines: 300
---

# Skill — Commit Preparer and Executor (Commit Crafter)

## Unique responsibility

Orchestrate the selective staging of files and the creation of atomic semantic commits with strictly English messages, in full compliance with the Conventional Commits standard and auditable authorship/AI traceability.

This skill does not decide the official closing of stories on the kanban nor issue release tags without final approval (responsibility of the `final-reviewer-agent` and `git-operator`).

---

## Non-Negotiable Commit Rules

1. **Strictly ENGLISH message:** Type, scope, imperative description, body and footer keys must be 100% in English. Only story keys (`HT-XXX`/`HN-XXX`), file paths already in Portuguese and author names remain unchanged.
2. **Selective staging mandatory:** `git add -A` and `git commit -am` are **strictly forbidden**. Each file or folder must be added individually and consciously.
3. **`Generated-by-AI` footer mandatory:** Whenever there is AI intervention or assistance (generation, refactoring, review or validation), include mandatorily:
   ```gitcommit
   Generated-by-AI: <exact-model-name>
   ```
4. **Amend forbidden on published commits:** Never use `git commit --amend` on commits that have already been pushed to the remote branch.
5. **Confirmation before committing:** The commit message and the staging must be validated and presented clearly before executing the commit.

---

## Execution Procedure

### Step 1: Inspect the repository status
Before any staging command:
```bash
git status --short
```
Identify the modified files and group only the changes that represent a logical and atomic unit.

### Step 2: Run selective staging
Explicitly add the target files of that specific change:
```bash
git add path/to/file1
git add path/to/file2
```
Immediately confirm what is staged:
```bash
git diff --cached --stat
```
If any unrelated file was included by mistake, remove it from staging with `git restore --staged <file>`.

### Step 3: Compose the commit message
Structure the message following the pattern accepted by the repository:

```gitcommit
<type>(<scope>): <imperative description in english> (<KEY>)

<Body explaining what changed and why, written in English.
Keep paragraphs concise and focused on rationale.>

Refs: <path/to/doc/or/issue>
Generated-by-AI: <Exact-Model-Name>
```

**Valid types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `ci`.

**Accepted examples:**
```gitcommit
docs(agents): add code review and commit crafter skills

Introduce code-reviewer-agent and commit-crafter-agent skills under
.agents/skills to standardize diff inspection, selective staging,
and conventional commit message composition.

Generated-by-AI: Gemini-3.8-Flash
```

```gitcommit
feat(auth): add password hashing with argon2 (HT-007)

Implements Argon2id password hashing adapter conforming to the
Domain PasswordHasher port, ensuring secure credential storage.

Refs: docs/tasks/HT-007/TASK.md
Generated-by-AI: Gemini-3.8-Flash
```

### Step 4: Execute the commit
Submit the message to git via command line or temporary file:
```bash
git commit -m "<subject>" -m "<body>" -m "<footers>"
```

### Step 5: Verify the result
Confirm the commit was recorded in the local history:
```bash
git log -n 1 --stat
```

---

## Anti-patterns that Block Execution

1. **Indiscriminate staging:** Running `git add .` or `git add -A`.
2. **Portuguese messages:** Any Portuguese word in the commit subject, body or header (except pre-existing file paths and `HT-XXX`/`HN-XXX` keys).
3. **Giant / omnibus commit:** Mixing unrelated documentation changes, features and fixes in a single commit.
4. **Omission of AI authorship:** Omitting `Generated-by-AI` when an LLM model suggested or generated the code or the commit.