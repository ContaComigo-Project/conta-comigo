---
name: refactor-after-functional-green
description: Requires an explicit refactoring stage after the functional tests turn green and before closing the story.
document_type: rule
severity: blocking
applies_when:
  - completing the minimal implementation of a story
  - preparing the delivery for final review
complements:
  - clean-code-readable-names
  - architecture-boundaries-and-solid
complemented_by:
  - tdd-bdd-before-implementation
max_lines: 300
---

# Rule — Refactor After the Functional Green

## Intent

The code that makes the test pass is the first working version, not the version
that stays. Refactoring is the stage where the cost of the next story is decided.

## Obligations

1. Refactoring happens **after** the functional greens and **before** the
   unit tests that expand coverage.
2. Refactoring **does not change behavior**: the same functional tests
   remain green, without editing the tests.
3. If a test needed to change, it was not refactoring — it was a behavior
   change, and it goes back to the `tdd-bdd-before-implementation` cycle.
4. What was refactored is recorded in the delivery document. "Nothing was
   refactored" is only accepted with an explicit justification.

## Typical targets

| Target | Sign |
| --- | --- |
| Duplication | The same decision in two places |
| Long function | Does more than one thing at different abstraction levels |
| Provisional name | `data`, `handle`, `process`, `temp`, `aux` |
| Nested conditional | Three levels or more |
| Boundary leak | Domain knowing infrastructure detail |
| Comment explaining the "what" | The code should say it by itself |

## Limit

The refactoring is limited to the area touched by the story. Rewriting a neighboring module "since
I'm here" violates the commit isolation required by
`main-push-quality-and-versioning` and becomes its own story.
