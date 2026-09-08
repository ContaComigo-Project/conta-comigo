# Conventional Commit Templates and Examples

This file complements the `commit-crafter-agent` skill, providing quick templates for structuring semantic commits in compliance with ContaComigo rules.

---

## Fundamental Rules Recalled

1. **Message 100% in ENGLISH** (type, scope, imperative subject, body and footer keys).
2. **Story key mandatory in deliveries** (`(HT-XXX)` or `(HN-XXX)`).
3. **AI footer mandatory** whenever there is any AI intervention: `Generated-by-AI: <exact-model>`.

---

## 1. Business Feature (HN)

```gitcommit
feat(billing): add split bill calculation by consumption (HN-001)

Implement consumption-based split calculation in the billing domain
service. Handles unequal shares and tip distribution according to
business rules RN-003 and RN-004.

Refs: docs/tasks/HN-001/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```

---

## 2. Technical or Infrastructure Feature (HT)

```gitcommit
feat(auth): configure jwt token issuance and validation (HT-006)

Add JWT authentication provider implementing the TokenService port.
Includes asymmetric key pair loading, token expiration handling,
and bearer extraction middleware.

Refs: docs/tasks/HT-006/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```

---

## 3. Bug Fix (fix)

```gitcommit
fix(dashboard): correct total balance currency rounding error (HN-003)

Prevent floating point precision issues when summing decimal values
by converting amounts to cents before division.

Refs: docs/tasks/HN-003/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```

---

## 4. Governance, Documentation or Maintenance (docs / chore)

*Only for governance or technical maintenance tasks that do not constitute a product story on the Kanban:*

```gitcommit
docs(governance): add automated pre-commit hook and repository audit

Introduce .githooks/pre-commit and scripts/auditar-repositorio.{sh,ps1}
to automatically enforce line limits, secret absence, and link integrity
across the codebase.

Generated-by-AI: Gemini 3.8 Flash
```

---

## 5. Refactoring without behavior change (refactor)

```gitcommit
refactor(core): extract transaction validation to domain policy (HT-005)

Move validation logic out of the use case orchestrator into a
dedicated TransactionPolicy domain entity to improve testability.

Refs: docs/tasks/HT-005/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```