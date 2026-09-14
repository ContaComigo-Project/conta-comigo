---
name: main-push-quality-and-versioning
description: Blocks push to main without green tests and gates, semantic commit with the story key and semantic tag on the same hash.
document_type: rule
severity: blocking
applies_when:
  - closing a story
  - creating a delivery commit, tag or push to main
complements:
  - test-evidence-quality
  - spec-to-execution-plan
complemented_by:
  - refactor-after-functional-green
max_lines: 300
---

# Rule — Quality and Versioning on Push to Main

## Intent

`main` is the reliable timeline of the project. Every point of it must be
explainable: which story delivered, with which evidence, in which version.

## Obligations

1. **Green tests.** No push to `main` with a failing test, one skipped without
   a recorded justification, or a suite not executed.
2. **Applicable gates executed.** The gates marked on the story (QA, SRE,
   Security, Architecture, Final review) ran and are recorded in the delivery.
3. **Semantic commit with the key.** Format:
   `type(scope): description in the imperative (KEY)`
   Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
   Example: `feat(orcamento): registrar limite mensal por categoria (HN-004)`
4. **Isolated commit.** The delivery commit contains only files from that
   story. File from another story = new commit, another delivery.
5. **Semantic tag on the same hash.** `vMAJOR.MINOR.PATCH` pointing exactly
   to the closing commit.
6. **Delivery document exists** in `docs/entregas/` before the tag.
7. **Kanban updated** with the story in `Done` and the history filled in.

## Version choice

| Change | Increment |
| --- | --- |
| Breaks a contract perceived by the consumer | `MAJOR` |
| New compatible capability | `MINOR` |
| Fix or internal adjustment without changing the contract | `PATCH` |

## Verification

```
scripts/verificar-fechamento.sh vX.Y.Z
```

The script fails if the tag does not exist, if it points to a hash different from the
closing commit, or if the commit message does not cite a
`HN-`/`HT-` key.

## Common violations

| Symptom | Why it is a violation |
| --- | --- |
| Tag created after one more commit | The tag stops identifying the delivery |
| `chore: ajustes` | Does not say what it delivered nor which story |
| Commit with a fix "tagging along for the ride" | Mixes scopes and prevents clean rollback |
| Test disabled to unblock the push | Trades quality for speed without a recorded decision |
