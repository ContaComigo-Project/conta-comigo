---
name: test-evidence-quality
description: Ensures tests prove a real business rule and that the recorded evidence is verifiable, not decorative.
document_type: rule
severity: blocking
applies_when:
  - reviewing a test suite at the QA gate
  - recording evidence in a delivery document
complements:
  - tdd-bdd-before-implementation
complemented_by:
  - main-push-quality-and-versioning
max_lines: 300
---

# Rule — Quality of Test Evidence

## Intent

High coverage with weak assertion is worse than honest low coverage: it produces
confidence without a basis. A test exists to prove a rule, not to paint the pipeline
green.

## Obligations

1. **Every RN cited by the story has at least one test that would fail if the
   rule were broken.** This is the central criterion.
2. **Specific assertion.** Verify the expected value, not merely "did not throw
   an exception" or "responded 200".
3. **Edge cases present:** empty, lower bound, upper bound,
   duplicate, invalid and concurrent when applicable.
4. **Evidence is real output.** The delivery document contains the command output,
   copied, not rewritten by hand nor summarized as "everything passed".
5. **A test that cannot fail is debt.** If no plausible mutation of the
   code breaks it, it proves nothing.

## Anti-reward-hacking

Forbidden, even if it turns the gate green:

| Practice | Why it is forbidden |
| --- | --- |
| Adjusting the assertion to the value the code produced | Inverts the direction of the proof |
| Marking a test as skip to unblock a delivery | Hides regression |
| Mocking the very object under test | Tests the mock, not the system |
| Testing only the happy path | Leaves the rule defenseless |
| Inflating coverage with accessor tests | Increases the number without increasing safety |
| Loosening the coverage threshold to pass | Moves the bar instead of the work |

## Verification at the gate

Choose an RN and ask: *which test breaks if I invert this rule?*
Without an answer with a file path and test name, the gate fails.
