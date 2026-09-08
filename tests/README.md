---
name: testes-indice
description: Index of the ContaComigo test suites — unit, integration, functional, boundaries and security, with command and scope of each.
document_type: index
applies_when:
  - running or understanding the workspace test suite
  - tracking where an RN is proven
max_lines: 300
---

# Tests — Workspace Suites

One suite per goal. Nothing here is "the backend test": the root Vitest covers
backend, contract, web data and governance in a single run (ADR-003).

## Suites

| Suite | Command | What it proves | Where it lives |
| --- | --- | --- | --- |
| Unit | `pnpm run test:unitario` | Domain rules and edge cases; RN tracked by `RN-XXX` scenario name | `backend/src/**/*.test.ts`, `packages/contract/src/*.test.ts`, `frontend/src/data/*.test.ts`, `tests/fronteiras/*.test.ts`, `tests/seguranca/*.test.ts` |
| Integration | `pnpm run test:integracao` | Real persistence against the compose PostgreSQL | `backend/src/**/infrastructure/persistence/*.integration.test.ts` |
| Functional/BDD | `pnpm run test:funcional` | One scenario per acceptance criterion, in a real browser (Playwright) | `tests/funcional/*.spec.ts` |
| Boundaries | `pnpm run lint:fronteiras` | `ADR-001` (hexagonal) and `ADR-002` (Prisma confined) over `backend` and `frontend/src` | via `.dependency-cruiser.cjs` + `tooling/fronteiras/` |
| Security | `pnpm run security` + `tests/seguranca/` | Secret scan (gitleaks) and allowlist guard | `.gitleaks.toml`, `tests/seguranca/allowlist.test.ts` |

## Rules

- **Boundaries block:** an `@nestjs/*` import inside `domain/` makes `lint` fail
  (`RNF-021`). The boundary gate runs over the real tree and over fixtures
  (`tooling/fronteiras/`).
- **Every RN is proven:** each business rule has a test that would go red if the
  rule were inverted (`RNF-018`); the QA gate tracks it by scenario name.
- **No retry in functional:** repeating until green hides flakiness
  (`playwright.config.ts` has `retries: 0`).
- **Run:** always through the harness, same command locally and in CI
  (`RNF-007`).

## Relation to the test strategy

Mandatory order per story: functional/BDD scenario **red** → minimal code →
refactoring → unit edge cases. Tooling decision:
[`ADR-003`](../adr/ADR-003-testes-vitest-playwright.md).