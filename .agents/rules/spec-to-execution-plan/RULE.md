---
name: spec-to-execution-plan
description: Establishes KANBAN-OFICIAL as the only source of execution and spec-driven-development as a complementary input, never as a parallel queue.
document_type: rule
severity: blocking
applies_when:
  - choosing the next demand to execute
  - turning spec understanding into executable stories
complements:
  - main-push-quality-and-versioning
  - architecture-boundaries-and-solid
complemented_by:
  - tdd-bdd-before-implementation
max_lines: 300
---

# Rule — From Spec to Execution Plan

## Intent

Two competing queues produce orphaned work: someone executes the spec, another
executes the kanban, and no one knows what is delivered. There is only one queue.

## Obligations

1. **`docs/backlog/KANBAN-OFICIAL.md` is the only source of the next demand.**
   No execution starts from a spec, conversation, idea or item from another board.
2. **SDD is not a queue.** The spec feeds requirements, epics and stories. It
   complements the official story; never replaces it.
3. **A story only enters `Ready` with:** verifiable acceptance criteria,
   at least one `RF`, `RN` or `RNF` cited, and resolved dependencies.
4. **Before implementing**, `docs/tasks/[KEY]/` exists with `TASK.md`,
   `IMPLEMENTATION.md` and `progress.txt`.
5. **WIP limit: 1.** One story `Em execução` at a time. A block returns the
   story to `Ready` with the reason recorded, and does not open a second front.
6. **Discovery during execution does not become scope.** A relevant finding becomes a
   new story in `Backlog`, with the key recorded in `progress.txt`.
7. **Chronological order is respected.** Pulling an item out of order requires recording
   in the kanban why the order changed.

## Mandatory flow

```
SDD  ->  requisitos (RF/RNF/RN)  ->  épico  ->  história  ->  KANBAN (Ready)
                                                                  |
                                                       docs/tasks/[KEY]/
                                                                  |
                                             ciclo Ralph: Perceber .. Registrar
                                                                  |
                                              docs/entregas/ + commit + tag
```

## What fails

| Situation | Consequence |
| --- | --- |
| Code without a corresponding story in the kanban | Work is not accepted in the delivery |
| Story `Em execução` without a folder in `docs/tasks/` | Returns to `Ready` |
| Two stories in simultaneous execution | The second is returned |
| Non-verifiable acceptance criterion | Story does not leave `Backlog` |
