---
name: implementation-ht-006
description: Plano técnico da infraestrutura de testes — Vitest, Playwright, dependency-cruiser e a prova executável de que a fronteira de ADR-001 bloqueia.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-006`

- **Requisitos ligados:** `RNF-018`, `RNF-019`, `RNF-021`
- **Versão prevista:** `v0.8.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Instalar as três ferramentas de `ADR-003` **na raiz do workspace**, porque o
gate é do repositório inteiro: o dependency-cruiser precisa enxergar `backend/`
e `frontend/src` na mesma passada, e `HT-007` chamará um comando só.

O ponto central é a **prova de que o gate bloqueia sem backend**. As quatro
regras de `ADR-001` viram uma fábrica `criarRegras(raiz)` reutilizada por duas
configs: a de produção (`backend/src`) e a de fixtures
(`tests/fronteiras/fixtures/*`). Um teste Vitest roda o dependency-cruiser por
API sobre a árvore ilegal e afirma que ele reporta **a regra certa no arquivo
certo**, e sobre a árvore legal afirma zero violações. Asserir só `status ≠ 0`
não bastaria: config quebrada ou import irresolvível também falham, e o teste
passaria pelo motivo errado.

Cobertura: `include` restrito a `backend/src/**/domain/**` com `all: true`.
Hoje é vacuamente verde — e o limiar de 80% **arma sozinho** quando `HT-009`
criar o primeiro arquivo de domínio, sem ninguém lembrar de ligar nada.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Instalar por pacote (`frontend/`, `backend/`) | Duas configs para manter; o gate de fronteiras cruza pacotes |
| Teste-canário descartável no lugar das fixtures | Fixtures são permanentes: continuam provando a regra depois que o backend existir |
| Asserir só o código de saída do depcruise | Passa pelo motivo errado quando o config ou o import quebra |
| jsdom para o funcional | Rejeitado em `ADR-003`: navegador real |
| Cobertura ≥ 80% aplicada à web agora | `ADR-003` adia para `HT-017`; exigiria reescrever a UI |

## 3. Fronteiras e design

```
.dependency-cruiser.cjs          produção: backend/src, exclui fixtures
tooling/fronteiras/regras.cjs    criarRegras(raiz) — as 4 regras de ADR-001 + Prisma (ADR-002)
tooling/fronteiras/fixtures.cjs  mesma fábrica sobre tests/fronteiras/fixtures
tests/fronteiras/
  fixtures/violacao/orcamento/{domain,application,infrastructure}/...
  fixtures/limpo/orcamento/{domain,application,infrastructure}/..., orcamento.module.ts
  fronteiras.test.ts
tests/funcional/fumaca.spec.ts   Playwright sobre a web real
```

`@nestjs/common` e `@prisma/client` entram como **devDependencies da raiz**
apenas para as fixtures resolverem. Sem isso o depcruise reportaria
`not-to-unresolvable` em vez da regra que se quer provar. Migram para
`backend/package.json` em `HT-009`/`HT-010`.

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | `fronteiras.test.ts` escrito; `harness test-unitario` via evidência com `--esperar-falha` | Vermelho: sem config, o depcruise não tem regras |
| 2 | `regras.cjs`, `.dependency-cruiser.cjs`, fixtures | Teste verde |
| 3 | Refatoração: fábrica única entre produção e fixtures | Continua verde |
| 4 | Fumaça Playwright, cobertura, `harness.env` completo | `gates` verde |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| `@nestjs/common` em `domain/` reprova | `ADR-001` / `RNF-021` | `tests/fronteiras/fronteiras.test.ts` |
| `@prisma/client` em `domain/` reprova | `ADR-002` | idem |
| `application/` importando `infrastructure/` reprova | `ADR-001` | idem |
| `@prisma/client` fora de `persistence/` reprova | `ADR-002` | idem |
| Árvore limpa passa; `.module.ts` pode tudo | `ADR-001` | idem |
| Web responde na rota inicial | fumaça | `tests/funcional/fumaca.spec.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Vermelho antes do código; asserção nomeia regra e arquivo; caso de controle |
| SRE | Sim | `gates` de ponta a ponta; Chromium no `setup` |
| Segurança | Não | — |
| Arquitetura | Sim | Regras batem com a tabela de `ADR-001:93-98` |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Fixtures ilegais pegas pelo lint de produção | Alta se esquecido | `exclude` explícito + teste de controle |
| `tsc -b` do frontend tentar compilar as fixtures | Baixa | tsconfig da raiz separado; frontend tem o seu |
| Playwright sem libs no Linux do CI | Média | `HT-007` usa `ubuntu-latest`, que as tem para Chromium |
| ADR-001 ambíguo sobre `domain/` de contextos diferentes | — | Decisão registrada: permitido (leitura literal "outros arquivos de domain/") |

## 7. Plano de reversão

`git revert` do commit de fechamento: as quatro variáveis voltam a vazias e o
harness volta a falhar explicitamente em `test`. Nenhum código de produto é
tocado.

## 8. Fechamento

- Mensagem de commit prevista: `test(harness): install the test stack and prove the boundary gate blocks (HT-006)`
- Tag prevista: `v0.8.0` apontando para o commit de fechamento
