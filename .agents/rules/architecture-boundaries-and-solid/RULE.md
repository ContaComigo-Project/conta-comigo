---
name: architecture-boundaries-and-solid
description: Protects module boundaries, SOLID and ports/adapters, requiring pragmatic and justified design instead of speculative abstraction.
document_type: rule
severity: blocking
applies_when:
  - introducing a module, external dependency or new contract
  - reviewing architectural impact at the architecture gate
complements:
  - clean-code-readable-names
  - refactor-after-functional-green
complemented_by:
  - spec-to-execution-plan
max_lines: 300
---

# Rule — Architectural Boundaries and SOLID

## Intent

Architecture here has a practical goal: keep it cheap to change your mind. Every
rule below exists to reduce the cost of the next story, not to satisfy
a diagram.

## Obligations

1. **Dependencies point inward.** The domain does not know the framework, database,
   HTTP, queue or external provider. The reverse is allowed.
2. **Every external integration enters through an explicit port.** HTTP client,
   third-party SDK and database driver stay behind a domain interface, with
   adapter at the edge.
3. **One reason to change per unit (SRP).** If two changes of different
   reasons touch the same file frequently, the unit is wrong.
4. **Open for extension, closed for modification (OCP)** where there is real
   and recurring variation — not where someone imagines there might be.
5. **Substitution without surprise (LSP).** An alternative implementation must not
   break the contract's expectation nor throw "not supported".
6. **Lean interface (ISP).** Dependents must not be forced to know
   methods they do not use.
7. **Depend on abstraction (DIP)** at likely swap points; depending on the
   concrete is acceptable where swap is unlikely and the cost of indirection is real.

## Mandatory pragmatism

| Situation | Expected decision |
| --- | --- |
| One implementation, unlikely swap | No interface. Speculative abstraction is cost without revenue |
| Business rule | Domain, always — never in the controller nor the repository |
| Duplication with 2 occurrences | Wait. Duplication is cheaper than wrong abstraction |
| Duplication with 3+ occurrences and same reason to change | Extract |

## Decision record

Every relevant structural choice becomes an ADR with: context, alternatives,
decision and consequence. A decision without a declared consequence is not a decision, it is
preference.

## Decisions already made in this project

The rules above are generic. What they mean concretely here lives in
[`docs/adr/`](../../docs/adr/):

| ADR | What it fixes |
| --- | --- |
| `ADR-001` | Hexagonal backend: folder structure, which layers can import what, and the check that breaks the build on violation |

Conflict between this rule and an ADR is resolved by the ADR — it is the specific
decision, and declares the assumed consequence.

## Signs of violation

- `import` of framework inside the domain.
- Domain entity with ORM annotation or transport serialization.
- Use case receiving an HTTP request object.
- Interface with a single implementation created "by default", with no planned swap.
