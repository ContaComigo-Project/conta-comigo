---
name: tooling-boundaries-indice
description: Boundary-checking tool — executable ADR-001 and ADR-002 rules for dependency-cruiser, reused between the production tree and the test fixtures.
document_type: index
applies_when:
  - changing the ADR-001/ADR-002 import rules
  - understanding how the boundary gate is configured
max_lines: 300
---

# Tooling — Boundary Check

Executable dependency-cruiser configuration that turns the import rules of
`ADR-001` (hexagonal) and `ADR-002` (Prisma confined) into a blocking gate
(`RNF-021`).

## Components

| File | Role |
| --- | --- |
| `boundaries/regras.cjs` | `createRules(root)` factory with the 7 rules: domain imports domain only; domain/application avoid transport and framework; application avoids infra; Prisma only in `infrastructure/persistence/`; no cycles; no unresolvable import |
| `boundaries/fixtures.cjs` | Cruiser config for the `tests/boundaries/fixtures/` trees — uses the same factory, root inferred from the target |
| `.dependency-cruiser.cjs` (root) | Applies the factory to the production tree: `depcruise backend frontend/src` |

## Why it exists

One rule list runs over two different targets:

1. **Production** (`backend/src` and `frontend/src`) — becomes
   `pnpm run lint:boundaries`, blocking in the harness and in CI.
2. **Fixtures** (`tests/boundaries/fixtures/{limpo,violacao}`) — the test
   `tests/boundaries/` proves that **each rule rejects what it should** (the
   `violacao` tree fails, the `limpo` tree passes).

If a rule changes, it changes in one place and the behavior proof keeps covering
both trees. History of closed gate gaps is in `docs/tasks/HT-009/evidencia/` and
`docs/tasks/HT-017/evidencia/`.