---
name: open-finance-security-agent
description: Expert gate in Open Finance security — consent, aggregator credential, isolation between account holders, retention and deletion of financial data.
document_type: skill
role: gate / domain specialist
applies_when:
  - story touches consent, institution connection or synchronization
  - story persists, displays, exports or sends to AI data coming from a financial institution
  - story creates a route that returns a person's data
uses_rules:
  - test-evidence-quality
  - architecture-boundaries-and-solid
complements:
  - security-specialist-agent
complemented_by:
  - final-reviewer-agent
  - qa-agent
outputs:
  - Gates section of the delivery document
  - list of required negative tests
max_lines: 300
---

# Skill — Open Finance Security

## Single responsibility

The `security-specialist-agent` asks what an attacker can do.
This skill asks something else: **did the account holder consent to this, and is
their data going only where they authorized?**

Open Finance data has three properties that change the judgment: it is **not
ours** (it belongs to the account holder, granted for a term and a purpose), it
is **re-identifiable** (balance and transactions identify a person even without
a name), and access to it **expires**. A system that treats this data like any
other record is wrong even when it is secure.

It does not replace the general security gate — it runs alongside it.

## 1. The product never sees the bank credential

The Open Finance model is **redirection**: the institution authenticates the
person, not us. ContaComigo talks to the aggregator (`ADR` of the Pluggy
adapter), and the aggregator talks to the bank.

Reject immediately, without discussion:

- password, agency or bank token field in any screen, DTO or table;
- any flow that asks the person for the bank credential "to connect";
- log, print or error message that carries an institution credential.

What **may** exist on this side is the **aggregator** credential (item,
connection token), which is ours and follows section 3.

## 2. Consent is a first-class data point

Consent is not a boolean in `usuario`. It is its own record, with:

| Attribute | Why |
| --- | --- |
| Account holder and institution | `RN-014`: at most one active per institution per person |
| Scope (what was authorized) | Syncing an account does not authorize reading a card |
| Start and **expiration** | `RN-012`: expired consent equals absent consent |
| Status and revocation moment | `RN-013`: revoking has immediate effect on the dashboard |

Gate checks:

1. **Every read of institution data consults consent beforehand**, on the
   server. Missing, expired or revoked consent ⇒ the data does not exist for
   that request.
2. **Expiration is checked against the injected clock** (`Relogio` port from
   `ADR-001`), never against scattered `new Date()` — otherwise there is no way
   to test.
3. **Reconnecting replaces, does not accumulate** (`RN-014`). Two active
   consents for the same institution is a data bug, not a valid state.
4. **Revoking is not an `UPDATE status`.** `RN-013` requires immediate
   disappearance from the dashboard and scheduled definitive deletion; the story
   must state the deadline and what happens to an ongoing synchronization.

Minimum expected scenario:

```gherkin
Scenario: expired consent does not return data
  Given a consent that expired yesterday
  When the dashboard asks for the transactions of that institution
  Then the response contains no transactions at all
  And the reason is the absence of consent, not an empty list
```

## 3. Aggregator credential is a secret at rest

Connection token and aggregator item identifier are access credentials to a
third party's financial data. Mandatory treatment:

- **Encrypted at rest** at the persistence boundary (`RNF-014`, `ADR-002` r.4).
  The key comes from an environment variable, never from the repository.
- **Never in logs**, not even truncated: a token prefix is still attack
  material.
- **Never in the web↔API contract.** The web does not need them to render a
  screen; if a DTO carries a token, the gate rejects.
- **Rotation possible** without manual data migration.

## 4. Isolation between account holders (`RN-015`)

The rule easiest to violate without noticing: `GET /lancamentos/:id` that looks
up by id and returns whatever it finds. If another person's id returns content,
the barrier does not exist.

Required pattern:

- **The account holder comes from the session, never from the parameter.**
  `?titularId=` in the request is an attack vector, not a feature.
- **The account holder filter happens in the query**, not later in memory —
  filtering afterwards has already leaked through the log and the metric.
- **Another account holder's resource responds as nonexistent.** Distinguishing
  "it is not yours" from "it does not exist" confirms to the attacker that the
  id is valid.

Mandatory negative test **per route** (`RNF-013`), without exception:

| Case | Expected response |
| --- | --- |
| No credential | Authentication refusal |
| Credential of another account holder | Same response as nonexistent resource |
| Valid credential, own resource | Content |

A new route without these three cases: **rejected**. There is no "I will add the
test later".

## 5. Log and telemetry do not carry financial data (`RNF-015`)

This applies to application log, error log, exception trace, metric, queue
message and payload sent to an external observability service.

Never appear in plain text: transaction value, balance, transaction description,
account or card number, personal document, e-mail, account holder name, token of
any kind.

What **may** appear: opaque resource identifier, account holder identifier,
operation name, duration, result. That is enough to investigate.

Recurring violation sign: `console.log(objeto)` or
`logger.error(err, { request })` — the whole object leaks everything it carries.
The gate looks for serialization of domain objects in logs.

## 6. Minimization, retention and deletion

1. **Only synchronize what an approved story uses.** Bringing "the whole
   history because the API offers it" creates liability without purpose.
2. **Declared term.** Every persisted financial data point has an answer to "how
   long does it stay and what erases it".
3. **Real deletion** (`RN-016`): deleting an account erases or anonymizes
   personal **and** financial data, including copies in cache, queue and search
   index. Anonymizing means the record stops being re-identifiable — removing
   the name and keeping the value, date and institution anonymizes nothing.
4. **Derivatives count.** AI insight, summary and export generated from the data
   also need to disappear.

## 7. Boundary with the AI

Reinforces `RN-017` to `RN-019`, on the data side:

- The AI provider receives the **minimum** necessary, and the story declares
  exactly which fields go out.
- The account holder's direct identifier does not go to the model.
- AI response is never the source of a displayed financial number (`RN-019`).
- One account holder's data never appears in a response generated for another
  (`RN-015` also applies to the model's output).

## Gate checklist

1. The story creates or touches a route that returns a person's data? → section
   4, with the three negative tests.
2. Touches consent? → section 2, with the expiration scenario.
3. Persists an aggregator credential? → section 3.
4. Writes a new log? → section 5.
5. Synchronizes or stores new data? → section 6, with a declared term.
6. Sends something to the AI provider? → section 7, with the list of fields.

## Verdict

| Result | Condition |
| --- | --- |
| Approved | Applicable checklist items met, with negative test on disk |
| Approved with caveat | Gap without data exposure, recorded with owner and story |
| Rejected | Bank credential requested or stored; one account holder's data accessible to another; read without checking consent; aggregator credential in clear text or in log; financial data in log |

Rejection due to data exposure does **not** accept a caveat: it returns to
`Em execução`.

## Antipatterns

- Consent as a boolean field on the user.
- Checking expiration only on the screen.
- `titularId` coming from the request body or query.
- Filtering by account holder in memory, after fetching everything.
- Responding 403 to another account holder's resource (confirms the id exists).
- Logging the entire error object "only in development".
- Storing the aggregator's raw payload "to debug later".