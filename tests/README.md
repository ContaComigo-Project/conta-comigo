---
name: testes-indice
description: Índice das suítes de teste do ContaComigo — unitário, integração, funcional, fronteiras e segurança, com comando e escopo de cada uma.
document_type: index
applies_when:
  - rodar ou entender a suíte de testes do workspace
  - rastrear onde uma RN é provada
max_lines: 300
---

# Testes — Suítes do Workspace

Uma suíte por objetivo. Nada aqui é "o teste do backend": o Vitest da raiz cobre
backend, contrato, dados da web e governança na mesma execução (`ADR-003`).

## Suítes

| Suíte | Comando | O que prova | Onde vive |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unitario` | Regras de domínio e casos de borda; RN rastreada por cenário `RN-XXX` | `backend/src/**/*.test.ts`, `packages/contrato/src/*.test.ts`, `frontend/src/dados/*.test.ts`, `tests/fronteiras/*.test.ts`, `tests/seguranca/*.test.ts` |
| Integração | `pnpm run test:integracao` | Persistência real contra o PostgreSQL do compose | `backend/src/**/infrastructure/persistence/*.integracao.test.ts` |
| Funcional/BDD | `pnpm run test:funcional` | Um cenário por critério de aceite, em navegador real (Playwright) | `tests/funcional/*.spec.ts` |
| Fronteiras | `pnpm run lint:fronteiras` | `ADR-001` (hexagonal) e `ADR-002` (Prisma confinado) sobre `backend` e `frontend/src` | via `.dependency-cruiser.cjs` + `tooling/fronteiras/` |
| Segurança | `pnpm run security` + `tests/seguranca/` | Varredura de segredo (gitleaks) e guarda da allowlist | `.gitleaks.toml`, `tests/seguranca/allowlist.test.ts` |

## Regras

- **Fronteiras bloqueiam:** um `import` de `@nestjs/*` dentro de `domain/` faz o
  `lint` falhar (`RNF-021`). O gate de fronteiras roda sobre a árvore real e
  sobre fixtures (`tooling/fronteiras/`).
- **RN sempre provada:** cada regra de negócio tem um teste que ficaria vermelho
  se a regra fosse invertida (`RNF-018`); o gate de QA rastreia pelo nome do
  cenário.
- **Sem retry no funcional:** repetir até passar esconde flakiness
  (`playwright.config.ts` tem `retries: 0`).
- **Rodar:** sempre pelo harness, o mesmo comando local e no CI (`RNF-007`).

## Relação com a estratégia de testes

Ordem obrigatória por história: cenário funcional/BDD **vermelho** → código
mínimo → refatoração → unitários de borda. Decisão de ferramental:
[`ADR-003`](../adr/ADR-003-testes-vitest-playwright.md).