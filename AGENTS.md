---
name: agents-root-entrypoint
description: Entry point for LLM assistants (Trae, Claude Code, Cursor, Copilot) into the ContaComigo repository. Pointers to the source of truth, non-negotiable rules and the next demand. This file does NOT duplicate content.
document_type: agents_manifest
applies_when:
  - an agent opens the repository for the first time
  - an agent needs to know where the official rules live
max_lines: 200
---

# AGENTS.md — Entry Point for LLM Assistants

> **The source of truth LIVES in `.agents/*`, versioned in git.**
> Here there are ONLY pointers in the right order and the executive summary of
> what MUST NOT be broken. Any conflict between this file and `.agents/` is
> resolved by `.agents/`.

---

## 1. Mandatory reading — 4 files, in this order, BEFORE any action

| # | File | What you learn there |
|---|---|---|
| 1 | [`.agents/prompts/initial-setup/PROMPT.md`](.agents/prompts/initial-setup/PROMPT.md) | Master rules 01..12b — kanban, WIP, Ralph Loop, gates, language, artifact structure |
| 2 | [`docs/WORKFLOW-AGENTICO.md`](docs/WORKFLOW-AGENTICO.md) | The 10-step operational cycle of a story: how to start, close and which gates apply |
| 3 | [`docs/backlog/KANBAN-OFICIAL.md`](docs/backlog/KANBAN-OFICIAL.md) | **Single source of the next demand.** `Ordem` column is sovereign. `WIP = 1`. |
| 4 | [`.agents/skills/commit-conventions/SKILL.md`](.agents/skills/commit-conventions/SKILL.md) | Commits in ENGLISH + `Generated-by-AI: <exact model>` footer when AI-assisted. |

Read these 4? You know 95 % of what it takes to work here without breaking anything.

---

## 2. Official index of artifacts and documentation

| Artifact | Path (source of truth) |
|---|---|
| Skills / gate ports / roles | [`.agents/skills/README.md`](.agents/skills/README.md) |
| Rules / blocking invariants | [`.agents/rules/README.md`](.agents/rules/README.md) |
| Master prompts | [`.agents/prompts/README.md`](.agents/prompts/README.md) |
| Ralph Loop (Perceive → Record) | [`.agents/prompts/ralph-loop/PROMPT.md`](.agents/prompts/ralph-loop/PROMPT.md) |
| Business epic (product, personas) | [`docs/backlog/EPICO-NEGOCIO.md`](docs/backlog/EPICO-NEGOCIO.md) |
| Technical epic (architecture, security, NFRs) | [`docs/backlog/EPICO-TECNICO.md`](docs/backlog/EPICO-TECNICO.md) |
| Stable requirements RF / RN / RNF | [`docs/requisitos/README.md`](docs/requisitos/README.md) |
| ADRs — why this project is this way | [`docs/adr/README.md`](docs/adr/README.md) |
| Spec-Driven Development (SDD-001) | [`docs/spec-driven-development/README.md`](docs/spec-driven-development/README.md) |
| Delivery timeline (tag + hash) | [`docs/entregas/README.md`](docs/entregas/README.md) |
| Per-story execution plans | [`docs/tasks/README.md`](docs/tasks/README.md) |
| Utility scripts | [`scripts/README.md`](scripts/README.md) |
| Workspace test suites | [`tests/README.md`](tests/README.md) |
| Boundary-checking tooling | [`tooling/README.md`](tooling/README.md) |
| Frontend (React + Vite) | [`frontend/README.md`](frontend/README.md) |
| Inventory and architecture of the existing frontend | [`docs/backlog/inventario-frontend.md`](docs/backlog/inventario-frontend.md) |

---

## 3. Non-negotiable rules — DO NOT BREAK THEM

1.  **WIP = 1.** Always pull the `Ready` item with the **lowest `Ordem`**. The HT/HN key is not the order.
2.  **Commit in ENGLISH.** Type, scope, description, body and footers. Only HT/HN keys, people names and already-existing pt paths remain.
3.  **`Generated-by-AI: <exact model>` footer is mandatory** if a model suggests, writes, refines, reviews or validates **any piece** of the commit or the diff. 1 model per line. Absent line = formal guarantee of 100 % human authorship.
4.  **Selective staging, always.** `git add -A` and `git commit -am` are **forbidden** in the delivery commit.
5.  **Amend forbidden on published commits.** `HEAD` that already reached `origin/*` never receives `--amend`.
6.  **Push, tag and release ONLY with explicit human authorization in this conversation.** None of them automatic.
7.  **Agentic artifact structure is 1 folder = 1 artifact:**
    ```
    Skills  →  .agents/skills/<name>/SKILL.md
    Rules   →  .agents/rules/<name>/RULE.md
    Prompts →  .agents/prompts/<name>/PROMPT.md
    ```
    `assets/` inside each folder is OPTIONAL and only exists with real content.
8.  **No `Refs:`, `Depends on:` or delivery link points to LOCAL paths of a particular IDE.** Those directories are private to each person's install and never versioned. Everything shared with the team lives MANDATORILY in `.agents/*` or `docs/*`.

---

## 4. Next demand today

In `docs/backlog/KANBAN-OFICIAL.md`, the `Ready` column is **empty**: `HT-012`
(Ordem 18, minimum observability) was delivered as `v0.20.0`. Nothing can be
pulled right now without breaking the state flow — the next item has to be
groomed first.

Two candidates, and the choice belongs to the team:

> **`HT-013` — Gemini/LangChain adapter with a cost ceiling and cache**
> (Ordem 21, `Backlog`). Opens Phase 4; depends only on `HT-009`, done.

> **`HT-007` — CI pipeline with blocking gates** (Ordem 8, postponed). Comes
> back the moment the team decides to push `develop`.

By the grooming rule, the story file is created when the item enters `Ready`.

### CI note (`HT-007`, Ordem 8, postponed)

`HT-007` returns to `Ready` when the team decides to push `develop` and
configure branch protection on GitHub. Until then, `RNF-021` is satisfied only
locally (documented in the kanban).

## 5. Repository languages

| Subject | Language |
|---|---|
| Specs, design docs, ADRs, `.agents/*`, tests, code, commits, CI, infra, pipelines | ENGLISH |
| Public-facing README, React UI strings, RESUMO-MOCITEC.md, cards, banners, chatbot screen | **PT-BR** |
| End-user communication (you in this chat) | **PT-BR** |

---

## 6. Quick recipe for working here

| Situation | What to do |
|---|---|
| Start a story | `scripts/nova-historia.sh HT-XXX`; move the kanban to *Em execução* **before** coding. |
| Close a story | Order: QA / SRE / Security / Architecture gates → **final-reviewer** → **git-operator** (commit + tag, only with human OK). |
| New skill / rule / prompt | 1 folder per artifact + fixed name. If attachments are needed, create `assets/` right away. |
| Doubt about commit format | Read `commit-conventions/SKILL.md` in full. |
| Doubt about why a decision | Look for the ADR. No ADR = create an ADR during the story that consumes the decision. |

---

*Conflict between instructions? Always apply in this order:*
`.agents/prompts/initial-setup/PROMPT.md` → blocking `RULEs` → `KANBAN-OFICIAL.md` → this `AGENTS.md`.