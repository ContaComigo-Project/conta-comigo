# Templates e Exemplos de Commits Convencionais

Este arquivo complementa a skill `commit-crafter-agent`, fornecendo modelos rápidos para estruturação de commits semânticos em conformidade com as regras do ContaComigo.

---

## Regras Fundamentais Relembradas

1. **Mensagem 100% em INGLÊS** (tipo, escopo, assunto imperativo, corpo e chaves do rodapé).
2. **Chave de história obrigatória em entregas** (`(HT-XXX)` ou `(HN-XXX)`).
3. **Rodapé de IA obrigatório** quando houver qualquer intervenção de IA: `Generated-by-AI: <modelo-exato>`.

---

## 1. Feature de Negócio (HN)

```gitcommit
feat(billing): add split bill calculation by consumption (HN-001)

Implement consumption-based split calculation in the billing domain
service. Handles unequal shares and tip distribution according to
business rules RN-003 and RN-004.

Refs: docs/tasks/HN-001/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```

---

## 2. Feature Técnica ou Infraestrutura (HT)

```gitcommit
feat(auth): configure jwt token issuance and validation (HT-006)

Add JWT authentication provider implementing the TokenService port.
Includes asymmetric key pair loading, token expiration handling,
and bearer extraction middleware.

Refs: docs/tasks/HT-006/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```

---

## 3. Correção de Bug (fix)

```gitcommit
fix(dashboard): correct total balance currency rounding error (HN-003)

Prevent floating point precision issues when summing decimal values
by converting amounts to cents before division.

Refs: docs/tasks/HN-003/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```

---

## 4. Governança, Documentação ou Manutenção (docs / chore)

*Apenas para tarefas de governança ou manutenção técnica que não configuram história de produto no Kanban:*

```gitcommit
docs(governance): add automated pre-commit hook and repository audit

Introduce .githooks/pre-commit and scripts/auditar-repositorio.{sh,ps1}
to automatically enforce line limits, secret absence, and link integrity
across the codebase.

Generated-by-AI: Gemini 3.8 Flash
```

---

## 5. Refatoração sem alteração de comportamento (refactor)

```gitcommit
refactor(core): extract transaction validation to domain policy (HT-005)

Move validation logic out of the use case orchestrator into a
dedicated TransactionPolicy domain entity to improve testability.

Refs: docs/tasks/HT-005/TASK.md
Generated-by-AI: Gemini 3.8 Flash
```
