---
name: clean-code-readable-names
description: Enforces clear names in domain language and forbids technical labels, opaque abbreviations and generic suffixes.
document_type: rule
severity: strongly-recommended
applies_when:
  - writing or reviewing production code, tests and documentation
  - refactoring after functional green
complements:
  - refactor-after-functional-green
complemented_by:
  - architecture-boundaries-and-solid
max_lines: 300
---

# Rule — Readable Names in Domain Language

## Intent

The name is the only documentation that never becomes outdated relative to the code
it names. Whoever reads the code should recognize the business in it, without translation.

## Obligations

1. **Domain language.** The name the team uses in conversation is the name that
   appears in the code. If the team says "fatura", the code does not say `bill`, `doc` nor
   `registro`.
2. **No empty technical label.** Avoid generic `Manager`, `Helper`, `Util`, `Handler`,
   `Data`, `Info`, `Service`. If the name only makes sense with the suffix,
   the responsibility has not yet been understood.
3. **No opaque abbreviation.** `qtdTrsAtv` saves nothing relevant.
   Abbreviation only when it is the domain term (`CPF`, `IBAN`, `SLA`).
4. **Boolean asserts.** `estaAtivo`, `podeSacar` — not `flag`, `status2`, `notX`.
5. **Function is a verb, thing is a noun.** The name says what the function does, not
   how it does it.
6. **Test name describes the rule**, not the tested method:
   `recusa_saque_acima_do_saldo` instead of `testSaque2`.
7. **Comment explains the why.** A comment that explains the "what" is a sign of a
   bad name; fix the name and delete the comment.

## Consistency

One concept, one name, across the whole project: code, tests, documents, commit
messages and stories. Scattered synonym (`cliente`, `usuário`, `pessoa` for the
same entity) is communication debt.

## Language

The project chooses **one** language for the domain and keeps it. Established
technical term of the language or framework remains in the original.
