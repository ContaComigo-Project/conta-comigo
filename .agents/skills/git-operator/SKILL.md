---
name: git-operator
description: Executes the git closure — selective staging per story, semantic commit with the key and semantic tag on the same hash.
document_type: skill
role: execution
applies_when:
  - final-reviewer-agent approved the delivery
  - creating a closing commit, tag or push
uses_rules:
  - main-push-quality-and-versioning
  - commit-conventions
complements:
  - final-reviewer-agent
  - commit-conventions
complemented_by:
  - product-manager
outputs:
  - delivery commit
  - semantic tag
max_lines: 300
---

# Skill — Git Operator

## Single responsibility

Record the delivery in history so that it can be found, explained and reverted.
It does not decide whether the delivery is ready — that is the
`final-reviewer-agent`'s job.

## Preconditions

Refuses to execute without: final gate approval, document in `docs/entregas/`,
updated kanban and a green test suite on the current tree.

## Procedure

1. **Inspect** what changed before any `add`:
   ```
   git status --short
   git diff --stat
   ```
2. **Selective staging.** Add by path, file by file or folder by folder.
   `git add -A` is forbidden in the delivery commit: it is the mechanism by
   which scope from another story leaks.
3. **Check the staged** before committing:
   ```
   git diff --cached --stat
   ```
   A file that does not belong to the story leaves the staging area.
4. **Semantic commit:**
   ```
   type(scope): imperative description (KEY)
   ```
   Optional body with the why; footer with `Refs: docs/entregas/...`.
5. **Tag on the same hash:**
   ```
   git tag -a vX.Y.Z -m "CHAVE — título da entrega"
   ```
6. **Verify** that commit and tag match:
   ```
   scripts/verificar-fechamento.sh vX.Y.Z
   ```
7. **Push** only with everything green: `git push origin <branch> --follow-tags`.

## Conventions

| Type | Use |
| --- | --- |
| `feat` | New capability perceivable by a user or stakeholder |
| `fix` | Wrong behavior correction |
| `refactor` | Internal change without changing external behavior |
| `test` | Tests only, no production code change |
| `docs` | Documentation only |
| `chore` | Maintenance with no product impact |
| `perf` | Performance improvement |
| `build` / `ci` | Packaging, bundler, binary, pipeline |

Commit language, message template, story key, and `Generated-by-AI:` footer rules are defined and enforced exclusively by the `commit-conventions` skill. Consult it before writing any message.

## Antipatterns

- `git add -A` or `git commit -am` in the delivery commit.
- Amend on an already published commit.
- Tag created after new commits.
- Push with `--force` on a shared branch.
- Message that describes the changed file instead of the delivery.
