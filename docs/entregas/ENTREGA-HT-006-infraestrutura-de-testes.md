---
name: entrega-ht-006
description: Documento de entrega da infraestrutura de testes — Vitest, Playwright e dependency-cruiser no harness, com a prova executável de que a fronteira de ADR-001 bloqueia.
document_type: delivery
story_key: HT-006
version: v0.8.0
max_lines: 300
---

# ENTREGA — `HT-006` — Infraestrutura de testes funcional/BDD e unitário

- **Data:** 2026-09-07
- **Tipo:** Técnica (qualidade)
- **Versão:** `v0.8.0`
- **Commit:** a preencher no fechamento
- **Tag:** `v0.8.0` no mesmo hash

## O que foi entregue

`scripts/harness.sh gates` fecha **verde de ponta a ponta** pela primeira vez:
lint com fronteiras, teste unitário, teste funcional, cobertura e segurança. O
ciclo Ralph ganhou um passo 3 executável.

| Artefato | Papel |
| --- | --- |
| `tooling/fronteiras/regras.cjs` | As quatro regras de `ADR-001` e a de `ADR-002` como fábrica `criarRegras(raiz)`, reutilizada por produção e fixtures |
| `.dependency-cruiser.cjs` | Config de produção sobre `backend/src`; exclui as fixtures |
| `tests/fronteiras/fixtures/{violacao,limpo}` | Árvores que violam cada regra e que respeitam todas — permanentes |
| `tests/fronteiras/fronteiras.test.ts` | 8 cenários: cada violação é nomeada por **regra e arquivo**; árvore limpa passa |
| `vitest.config.ts` | Executor unitário; cobertura com alvo `backend/src/**/domain/**`, limiar 80% |
| `playwright.config.ts`, `tests/funcional/fumaca.spec.ts` | Chromium contra a web real via Vite |
| `scripts/harness.env` | As quatro tarefas de teste preenchidas; `lint` inclui `lint:fronteiras` |

`@nestjs/common` e `@prisma/client` entram como devDependencies da raiz **só
para as fixtures resolverem**: sem isso o dependency-cruiser reportaria
`not-to-unresolvable` em vez da regra que se quer provar.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-018` | Executor unitário e cobertura no harness; alvo restrito ao domínio; limiar **provado** armando no primeiro arquivo sem teste | `*-coverage-limiar-arma.txt` |
| `RNF-019` | `coverage` roda nos gates | `*-gates-verde.txt` |
| `RNF-021` | Fronteiras no `lint`; teste prova que reprovam e que enfraquecer uma regra é detectado | `*-test-unitario-verde.txt`, `*-test-unitario-mutacao.txt` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `gates` verde de ponta a ponta | Aprovado | `*-gates-verde.txt` |
| `lint` roda o dependency-cruiser sobre `backend/` e `frontend/src` | Aprovado | 66 módulos cruzados, `*-lint-verde.txt` |
| `test-unitario` lista os cenários de fronteira | Aprovado | 8 passed |
| `test-funcional` em Chromium contra a web real | Aprovado | 2 passed |
| `coverage` com o domínio como alvo | Aprovado | relatório emitido; 0/0 hoje |
| Falha esperada: fixture ilegal reprova nomeando regra e arquivo | Aprovado | 7 violações `error` na árvore `violacao` |
| Falha esperada: regra enfraquecida para `info` deixa o teste vermelho | Aprovado | `*-test-unitario-mutacao.txt` |
| Vermelho antes do código | Aprovado | `*-test-unitario-vermelho.txt`: 6 de 8 falhando sem config |
| Evidência por `registrar-evidencia.sh` | Aprovado | 8 arquivos |

## Evidência de testes

Gates de ponta a ponta:

```
harness: executando gates na ordem — falha no primeiro erro
harness: HARNESS_LINT -> pnpm run lint
harness: HARNESS_TEST -> pnpm run test
harness: HARNESS_COVERAGE -> pnpm run coverage
harness: HARNESS_SECURITY -> pnpm run security
harness: gates concluídos
```

Limiar de cobertura armando sozinho quando um arquivo de domínio sem teste
aparece — a prova de que 80% não é decorativo:

```
ERROR: Coverage for lines (0%) does not meet global threshold (80%)
ERROR: Coverage for functions (0%) does not meet global threshold (80%)
ERROR: Coverage for statements (0%) does not meet global threshold (80%)
ERROR: Coverage for branches (0%) does not meet global threshold (80%)
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Funcional/BDD | `harness test-funcional` | 2 passed | — |
| Unitário | `harness test-unitario` | 8 passed | — |
| Cobertura | `harness coverage` | Verde (vacuamente: domínio ainda não existe) | 0/0 |
| Estático | `harness lint` | Verde, 66 módulos | — |
| Segurança | `harness security` | Verde | — |

## Refatoração feita após os funcionais verdes

1. **`cruzar()` em duas passadas.** A primeira versão lia só o JSON, e o
   reporter `json` sai com 0 mesmo com violações — o teste "gate reprova" ficou
   vermelho após as regras existirem. Agora uma passada com o reporter `err`
   (o que o harness usa, e quem define o código de saída) e outra com `json`
   para o detalhe.
2. **Âncoras de `node_modules/`.** O pnpm resolve pacotes em
   `node_modules/.pnpm/<pkg>/node_modules/<pkg>`; regex ancorada em
   `^node_modules/` não casava e a regra do Prisma fora de `persistence/` não
   disparava. Detectado porque a fixture correspondente não gerou violação.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Vermelho registrado antes do código; asserções nomeiam regra e arquivo; caso de controle; mutação detectada |
| SRE | `sre-agent` | Aprovado | Chromium entra pelo `setup`; `gates` verde em máquina com Docker de pé |
| Segurança | `security-specialist-agent` | Não aplicável | — |
| Arquitetura | `architect-reviewer-agent` | Aprovado com ressalva | Regras batem com `ADR-001:93-98`. Ressalva: "entidade sem decorator de ORM" não é expressável por import — ver Dívida |
| Revisão final | `final-reviewer-agent` | Aprovado | Sem escopo extra; MINOR coerente |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| `domain/` de um contexto pode importar `domain/` de outro | Leitura literal de `ADR-001` ("outros arquivos de `domain/`"). Registrar no ADR se o time discordar |
| `@nestjs/*` type-only tolerado em `application/` | `ADR-001` prevê "exceto tipos puros"; implementado com `dependencyTypesNot: ['type-only']` |
| `retries: 0` no Playwright | Repetir até passar esconde flakiness — reward-hacking silencioso |
| Fixtures excluídas do lint, do Vitest e do `tsconfig` | Código deliberadamente ilegal nunca entra em produção nem em type-check |
| `ADR-003` passa a citar `test-unitario`, não `test-unit` | O harness é o contrato executável; o ADR é lido como comando |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| "Entidade de domínio sem decorator" não verificável por dependency-cruiser | É sintaxe, não import | `HT-009` — regra ESLint `no-restricted-syntax` no backend |
| `scripts/*.mjs` sem teste unitário (herdada de `HT-005`) | Executor existe agora; testar exige extrair funções dos scripts | `HT-009` |
| Verificador de cobertura `RN-XXX` → teste | Sem RN implementada ainda; vira bloqueante em `HN-001` | `HN-001` |

## Verificação de fechamento

- [ ] `scripts/verificar-fechamento.sh v0.8.0` verde
- [ ] Tag `v0.8.0` aponta para o mesmo hash do commit
- [ ] Evidência presente em `docs/tasks/HT-006/evidencia/`
