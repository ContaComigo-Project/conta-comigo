# Diff and Working Tree Inspection Checklist

This checklist serves as a practical and exhaustive guide for executing the `code-reviewer-agent` skill before release to gates and commit.

---

## 1. File Triage and Hygiene

- [ ] **No credentials or secrets:**
  - No `.env`, `.env.local`, `.pem`, `.key`, token, password or sensitive hash.
- [ ] **No build artifacts or runtime junk:**
  - No files in `node_modules/`, `dist/`, `.next/`, `build/`, `.tmp/`, `*.log`.
- [ ] **No OS or personal IDE files:**
  - No `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `.cursor/`.
- [ ] **Atomic and cohesive scope:**
  - All modifications in the diff belong to the same goal.
  - No accidental changes to files unrelated to the current context.

---

## 2. Code and Logic Quality

- [ ] **Correctness:**
  - There are no race conditions, infinite loops or off-by-one errors.
  - `null`, `undefined` or missing data cases are handled defensively.
- [ ] **Error Handling:**
  - There are no empty `catch` blocks ("swallowing errors").
  - Error messages are explanatory and describe the root cause.
- [ ] **No debug residue:**
  - No `console.log`, `print()`, `debugger`, `pdb.set_trace()` or hardcoded test flags.
- [ ] **Clean Code and Readability:**
  - Variables and functions have clear, self-explanatory names in English.
  - Functions are concise and respect single responsibility.
  - There are no outdated comments or commented-out code snippets ("zombie code").

---

## 3. Architecture and Boundaries

- [ ] **Layer Isolation:**
  - The domain layer does not import UI, database or infrastructure details.
- [ ] **SOLID and Coupling:**
  - Classes and modules are not excessively coupled to concrete implementations.
  - Abstract interfaces and ports are used at architectural boundaries.

---

## 4. Tests and Regression

- [ ] **Coverage of new flows:**
  - Success, error and edge cases added in this delivery have corresponding tests.
- [ ] **Intact suite:**
  - All functional and unit tests run and pass green.
  - No test was disabled, ignored (`.skip`) or deleted to force success.