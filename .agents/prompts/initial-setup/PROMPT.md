---
name: initial-setup
description: Skeleton prompt to start any project with an agentic workflow based on official kanban, epics, stories, rules, skills, harness, spec-driven-development, Ralph Loop and semantic versioning.
document_type: reusable_prompt
applies_when:
  - starting a new project
  - standardizing the agentic workflow
  - creating a backlog with epic, business stories and technical stories
  - configuring AI-assisted delivery governance
max_lines: 300
---

# Initial Agentic Project Setup Prompt

Use this prompt to start a new project with the same agentic execution standard when it comes to AI-assisted development, regardless of the chosen technology.

Copy the block below and fill in the fields between brackets.

```text
You are a software engineering agent responsible for structuring a new project called ContaComigo.

Product objective:
Offer a Proof of Concept (PoC) of a responsive web application that consolidates, in a single environment, the banking data a person has spread across several institutions — via Open Finance regulated by BACEN — and uses generative Artificial Intelligence as an active engine for financial advisory and education, turning raw statements into practical knowledge.

Capabilities that define the product:
- consolidation of accounts and cards from multiple institutions into a single dashboard;
- traffic-light budget per category: green up to 70% of the limit, yellow between 70% and 90%, red above 90%;
- semantic cleaning of invoice descriptions, decoding abbreviations the person does not recognize as their own spending;
- automatic financial health diagnosis, with alerts, opportunities and goals;
- educational chatbot that guides budget goals;
- history of previous months and export of reports for tracking over time.

The product is educational and preventive: it explains to the person their own money. It does not recommend investments, does not intermediate credit and does not replace a certified professional — the "no advice" boundary is part of the product, not a decorative legal notice.

Target audience:
Primary user: Brazilian adult, banked, with little or no formal financial education, who currently manages the budget mentally, through spreadsheets, or does not manage it at all.

Traits that characterize this user:
- has accounts and cards in more than one institution and never sees the real total;
- does not recognize part of their own transactions because of abbreviations and opaque descriptions;
- is exposed to unfavorable credit decisions and to the risk of over-indebtedness;
- abandons finance apps that require manual entry or that assume financial literacy they do not have;
- uses mainly the mobile phone.

Stakeholders who are not users: MOCITEC evaluation board, advising professor and the development team itself.

Problem it solves:
The absence of financial education works as an invisible barrier that deepens inequality and limits the rise of Brazilian families. On top of that basis, four concrete pains:

1. Fragmentation: the data is scattered across institutions, and manually consolidating it costs too much time to be done as often as needed.
2. Opacity: statements and invoices use abbreviations and codes that prevent the person from recognizing their own spending — you cannot control what you do not understand.
3. Lack of diagnosis: even seeing the numbers, the person cannot tell whether they are doing well or badly, nor what to do about it.
4. Inadequate tools: the alternatives require manual entry discipline or financial vocabulary that the target audience does not master, and that is why they are abandoned.

Open Finance solves fragmentation with consent; generative AI solves opacity and the lack of diagnosis. The combination of the two is the project's bet.

Expected initial stack:
Already exists and is implemented (web layer, in the repository):
- React 19 + TypeScript 6, with Vite 8 as build and development server;
- TailwindCSS 4 with tokens via @theme inline, no configuration file;
- React Router 7 for nested routes and private route protection;
- Zod 4 + React Hook Form 7 for form validation;
- Radix Toast, Lucide React, class-variance-authority, clsx and tailwind-merge;
- ESLint 9 with typescript-eslint, react-hooks and react-refresh;
- Node 22 or higher and pnpm 9 or higher.

Already decided, not yet implemented (server layer):
- NestJS in TypeScript for business rules and API;
- Pluggy API in Sandbox environment as Open Finance aggregator;
- Google Gemini orchestrated by LangChain.js for context and prompts;
- PostgreSQL for persistence;
- Docker and docker compose for a reproducible environment.

Open — decide with explicit trade-offs before implementing:
- ORM: Prisma (productivity and strong typing, less control over SQL) against TypeORM (native integration with NestJS, less predictable migrations) against Drizzle (explicit SQL, smaller ecosystem).
- Tests: Vitest (fast, same ecosystem as Vite) against Jest (NestJS standard, slower); Playwright against Cypress for end-to-end; Cucumber only if the team really writes Gherkin together with someone who understands the business.
- CI/CD: GitHub Actions (free on the public repository, integrated) — alternative only if there is a concrete reason.
- Hosting: Vercel or Netlify for the web; Render, Fly.io or Railway for the API; free tier everywhere, with hibernation limit to be assessed.
- Observability: structured logging with Pino plus Sentry on the free tier, against logging only to a file — decide by the cost of diagnosing an error reported by a third party.
- Authentication: today it is local and simulated; production requires a decision between your own JWT and a managed provider.
- AI cache and cost: define a response caching strategy and a token limit per user before any non-simulated use.

Important constraints:
Scope and maturity:
- It is an academic PoC presented at MOCITEC of IFSul Campus Charqueadas, not a product in production.
- Responsive web is the only platform in scope. Native mobile app is a declared future vision and is out of scope.
- Today only the web layer exists in the repository; it operates with simulated data.

Data and compliance:
- Only Pluggy Sandbox. No real personal banking data enters the system at this stage.
- Operating with real data would require compliance and accreditation in the Open Finance ecosystem regulated by BACEN — that is not in scope.
- LGPD: personal financial data requires explicit consent, minimization, defined retention, revocation and deletion.
- No advice: the product cannot issue investment or credit recommendations reserved for agents regulated by CVM and BACEN. The notice is permanent in the interface and the restriction also applies to the AI model output.

Security:
- Pluggy and Gemini credentials never in the repository, never in logs, never in the web bundle.
- No banking data, even simulated, in debug logs.
- The current authentication is local and simulated; it must become real authentication with authorization verified on the server before any integration with real data.
- Generative model output is untrusted input: it must be validated before it becomes a number displayed as if it were a statement.

Cost and deadline:
- Team of three students and one advising professor, part-time, with no budget.
- Everything must fit in free tier: Pluggy Sandbox, Gemini, hosting and CI.
- AI calls are the main cost risk — every feature that calls the model must declare a limit and a caching strategy.
- Small and closed deliveries, because the team's availability is intermittent.

Infrastructure and publishing:
- Local environment reproducible with Docker and docker compose, with pinned versions.
- Public repository on GitHub; work on develop, integration into main.
- No push to main with a broken test.

I want the project to be born with a complete agentic workflow, independent of the stack, containing:

1. Spec-driven-development as the initial foundation of understanding.
2. Business epic with vision, personas, flows, functional requirements and business rules.
3. Technical epic with non-functional requirements, architecture, security, observability, tests, CI/CD and operations.
4. Single official kanban as the source of truth for chronological execution.
5. Business stories separated from technical stories.
6. Chronological documentation of each completed delivery.
7. Execution plan per story before implementing.
8. Functional/BDD tests before production code when there is testable behavior.
9. Mandatory refactoring after the functional tests are green.
10. Unit tests after the functional tests are green to maximize coverage.
11. QA, SRE, Security, Architecture and Final Review gates.
12. Skills and rules with frontmatter, single responsibility and at most 300 lines.
12a. MANDATORY DIRECTORY STRUCTURE (1 artifact = 1 folder):
    - Skills: do NOT create a loose <name>.md file. Always create:
      `.agents/skills/<skill-name-kebab-case>/SKILL.md`
      The main file is ALWAYS named `SKILL.md` inside the folder.
    - Rules: `.agents/rules/<rule-name-kebab-case>/RULE.md`
    - Prompts: `.agents/prompts/<prompt-name-kebab-case>/PROMPT.md`
13. Skills being able to complement other skills.
14. Rules being able to complement skills and other rules.
15. Local harness for reproducible commands, preferably via Docker when it makes sense.
16. Semantic versioning per delivery.
17. Semantic commit with the name or identifier of the delivered story.
18. Semantic tag pointing to the same commit as the delivery.

Create or propose the following initial structure:

- docs/spec-driven-development/
- docs/requisitos/
- docs/backlog/
- docs/backlog/historias/
- docs/backlog/historias-tecnicas/
- docs/tasks/
- docs/entregas/
- .agents/rules/
- .agents/skills/
- .agents/prompts/
- scripts/
- artifacts/ only if there are necessary local artifacts

Central workflow rules:

- The KANBAN-OFICIAL.md will be the only official source of the next demand.
- The initial spec-driven-development will not be a parallel queue; it will be broken down into epic, stories and quality standards.
- Each story must have verifiable acceptance criteria.
- Each story must cite related functional requirements, business rules or non-functional requirements.
- Technical stories must exist when there is infrastructure, quality, security, CI/CD, operations, publishing, observability or governance.
- Business stories must exist when there is behavior perceived by the user, operator, administrator or client.
- Every completed delivery must generate a document in docs/entregas/.
- No story should go to Done without validation evidence.
- No push to main should happen with breaking tests.
- No delivery commit should mix files from another story.
- No semantic tag should point to a commit different from the closing commit.

Mandatory rules:

- main-push-quality-and-versioning: blocks push to main without green tests/gates, semantic commit and tag on the same hash.
- tdd-bdd-before-implementation: requires a functional/BDD scenario before production code when there is testable behavior.
- test-evidence-quality: ensures tests prove a business rule and not only the pipeline.
- refactor-after-functional-green: requires cleanup and refactoring after the functional tests pass.
- clean-code-readable-names: imposes clear names, domain language and the absence of technical labels.
- architecture-boundaries-and-solid: protects SOLID, boundaries, ports/adapters and pragmatic design.
- spec-to-execution-plan: records that execution follows the KANBAN-OFICIAL and that SDD complements the official story.

Recommended skills:

- product-manager: guards business, scope, backlog, kanban and delivery documentation.
- executor-agent: implements with TDD, respecting rules and the story plan.
- qa-agent: validates tests, coverage, evidence and anti-reward hacking.
- sre-agent: validates environment, CI/CD, Docker, observability and operations.
- security-specialist-agent: validates authentication, authorization, privacy and data protection.
- architect-reviewer-agent: validates architecture, SOLID, patterns and maintainability.
- final-reviewer-agent: cross-checks acceptance criteria, code, tests, documentation and versioning.
- git-operator: performs selective staging, semantic commit and semantic tag.
- additional specialists should be created according to the project domain.

Ralph Loop:

Use the Perceive, Orient, Decide, Act and Record cycle.

For each story:

1. Perceive: read KANBAN-OFICIAL.md, the official story and related deliveries.
2. Orient: compare acceptance criteria, rules, risks and dependencies.
3. Decide: choose a subagent or the next action.
4. Act: implement, test, review or document.
5. Record: update plan, progress, kanban, delivery, commit and tag.

Before implementing any story:

- Create docs/tasks/[KEY]/TASK.md when applicable.
- Create docs/tasks/[KEY]/IMPLEMENTATION.md with frontmatter.
- Create docs/tasks/[KEY]/progress.txt.
- Record acceptance criteria, testing strategy, gates and risks.

When finishing any story:

- Run the applicable tests and gates.
- Refactor after the functional tests are green.
- Record evidence.
- Create a document in docs/entregas/.
- Update KANBAN-OFICIAL.md.
- Create a semantic commit.
- Create a semantic tag.
- Validate that commit and tag point to the same hash.

Expected first delivery:

1. Create the business epic.
2. Create the technical epic.
3. Create the initial KANBAN-OFICIAL.md.
4. Create templates of business story, technical story, task, implementation plan, progress and delivery.
5. Create the base rules with frontmatter and at most 300 lines.
6. Create the base skills with frontmatter and at most 300 lines.
7. Create an operational README explaining how to start the first story.
8. Do not implement the product yet, unless I explicitly ask.

Success criteria of this stage:

- There is an initial backlog in chronological order.
- The project has a business epic and a technical epic.
- The execution workflow is documented.
- Rules and skills have frontmatter, single responsibility and complementary references.
- The next executable step is clear in the KANBAN-OFICIAL.md.
```

## How to Use

1. Paste the prompt into a new conversation or project.
2. Fill in the fields between brackets.
3. Ask first for the creation of the governance artifacts.
4. Only then ask for the execution of the first story.

## Adaptation By Technology

The workflow does not assume a stack.

When choosing technology, create specific technical stories for:

- local environment;
- build;
- tests;
- lint;
- static analysis;
- security;
- CI/CD;
- publishing;
- observability;
- costs and operations.

## Golden Rule

The product changes according to the domain. The workflow does not change: official kanban, small story, test first, refactoring, gates, documented delivery, semantic commit and tag on the same hash.
