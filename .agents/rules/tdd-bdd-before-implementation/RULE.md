---
name: tdd-bdd-before-implementation
description: Requires a functional/BDD scenario written and red before any production code when there is testable behavior.
document_type: rule
severity: blocking
applies_when:
  - starting the implementation of a story with observable behavior
  - reviewing whether the work order respected test before code
complements:
  - test-evidence-quality
complemented_by:
  - refactor-after-functional-green
  - main-push-quality-and-versioning
max_lines: 300
---

# Rule — Functional/BDD Test Before Implementation

## Intent

A test written first is executable specification. Written afterwards, it tends to
describe what the code does — including what it does wrong.

## Obligations

1. Every acceptance criterion with observable behavior becomes a functional/BDD
   scenario **before** the production code.
2. The scenario must be seen **failing for the right reason** before any
   implementation exists. Failure due to a syntax or import error does not count.
3. The evidence of the red is recorded in `docs/tasks/[KEY]/progress.txt`.
4. Only then does the minimal production code to pass enter.
5. The scenario uses domain language: `Dado/Quando/Então` speaking about the business,
   not about tables, endpoints or internal classes.

## When it does not apply

The rule requires testable behavior. Exempted:

- purely textual documentation changes;
- formatting adjustments without behavior change;
- disposable exploration (spike), provided the spike code is not
  promoted to production without redoing the cycle.

Exemption is declared in the story, not assumed.

## Code that already existed without a test

The repository was born with a web layer with no tests. The rule does not apply
retroactively — but it defines what happens when that code is touched:

| Situation | What the rule requires |
| --- | --- |
| Legacy code that **will be rewritten** | No tests over the legacy. Write the scenario of the desired behavior, see it red and implement from scratch. Testing code that will be deleted is wasted work |
| Legacy code that **will be preserved and integrated** | Before changing it, write the scenario that describes the behavior it must have after the change |
| Legacy code that **is only read** | Nothing to do |

Behavior currently implemented in a mock layer is not approved specification:
it is observation. It only becomes a requirement after being promoted to `RF` or `RN` in the
catalog — otherwise, the team ends up accidentally preserving a decision that
no one made.

## Expected format

```gherkin
Cenário: cliente não pode sacar acima do saldo disponível
  Dado uma conta com saldo de 100
  Quando o cliente solicita saque de 150
  Então o saque é recusado
  E o saldo permanece 100
```

## Signs of violation

| Symptom | Diagnosis |
| --- | --- |
| All tests were born green | They were written after the code |
| Scenario cites a class name or route | Tests implementation, not behavior |
| `progress.txt` without the red record | The order was not respected or was not proven |
