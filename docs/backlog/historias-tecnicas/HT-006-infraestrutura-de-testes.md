---
name: ht-006-infraestrutura-de-testes
description: Infraestrutura de testes — Vitest, Playwright e dependency-cruiser instalados no harness, com o teste que prova que a checagem de fronteiras de ADR-001 bloqueia.
document_type: story
story_key: HT-006
story_type: tecnica
epic: EPIC-TEC-001
status: Done
max_lines: 300
---

# `HT-006` — Infraestrutura de testes funcional/BDD e unitário

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Done (ordem 7) — `v0.8.0`
- **Decisão que a rege:** [`ADR-003`](../../adr/ADR-003-testes-vitest-playwright.md), [`ADR-001`](../../adr/ADR-001-arquitetura-hexagonal-no-backend.md)
- **Requisitos:** `RNF-018`, `RNF-019`; habilita `RNF-021`
- **Depende de:** `HT-005` (harness) — concluída em `v0.7.0`
- **Versão prevista:** `v0.8.0`

## Problema técnico

`HARNESS_TEST_FUNCTIONAL`, `HARNESS_TEST_UNIT`, `HARNESS_TEST` e
`HARNESS_COVERAGE` estão vazios. `scripts/harness.sh gates` para em `test` com
"comando não configurado" — o ciclo Ralph ainda não tem um passo 3 executável.

Não existe um único teste no repositório. `ADR-003` decidiu Vitest, Playwright
e dependency-cruiser; nenhum está instalado. `ADR-001` exige que "um `import`
de `@nestjs/common` dentro de `domain/` faça o gate falhar, **e que exista um
teste provando que ele falha**" — e esse teste é o que torna `HT-009` seguro.

## Resultado esperado

`scripts/harness.sh gates` fecha verde de ponta a ponta: lint (com fronteiras),
teste funcional, teste unitário, cobertura e segurança. A checagem de fronteiras
é **provada** por um teste permanente que roda o dependency-cruiser sobre
fixtures ilegais e afirma que ele reprova — sem depender do backend, que só
nasce em `HT-009`.

## Critérios de aceite

Critério técnico também é verificável. Prefira comando reprodutível a descrição.

- [x] `scripts/harness.sh gates` retorna sucesso de ponta a ponta
- [x] `scripts/harness.sh lint` executa o dependency-cruiser sobre `backend/`
      e `frontend/src`
- [x] `scripts/harness.sh test-unitario` executa o Vitest e lista os cenários
      de `tests/fronteiras/`
- [x] `scripts/harness.sh test-funcional` executa o Playwright em Chromium
      contra a web real, com ao menos um cenário de fumaça
- [x] `scripts/harness.sh coverage` emite relatório com o domínio como alvo
- [x] Falha esperada é detectada: dependency-cruiser sobre a fixture
      `tests/fronteiras/fixtures/violacao` sai diferente de zero e **nomeia a
      regra** violada e o arquivo
- [x] Falha esperada é detectada: enfraquecer uma regra para `info` deixa o
      teste de fronteiras **vermelho** — o teste guarda a regra, não a ferramenta
- [x] Vermelho registrado antes do código: o teste de fronteiras existe e falha
      antes de `.dependency-cruiser.cjs` existir
- [x] Toda evidência registrada por `scripts/registrar-evidencia.sh`

```gherkin
Cenário: import de framework no domínio quebra o gate
  Dado um arquivo em domain/ que importa @nestjs/common
  Quando a checagem de fronteiras roda sobre ele
  Então ela reprova nomeando a regra e o arquivo
  E o código de saída é diferente de zero

Cenário: árvore que respeita ADR-001 passa
  Dado um contexto com domain, application e infrastructure sem import cruzado proibido
  Quando a checagem de fronteiras roda sobre ele
  Então nenhuma violação é reportada
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-018` | Toda RN com teste; cobertura ≥ 80% no domínio | Executor e medição de cobertura no harness, alvo `backend/src/**/domain/`; limiar arma sozinho quando `HT-009` criar o domínio |
| `RNF-019` | Cobertura sustenta mudança segura | `coverage` no harness e nos gates |
| `RNF-021` | Gates bloqueiam de fato | Fronteiras no `lint`; teste prova a reprovação |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | As quatro regras de `ADR-001` viram configuração executável |
| Dependências externas | Sim | Vitest, Playwright, dependency-cruiser; `@nestjs/common` e `@prisma/client` como devDependencies só para as fixtures resolverem |
| Contratos públicos | Não | — |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Fixtures ilegais entrarem no lint ou no build | Excluídas por caminho no dependency-cruiser e no tsconfig | Remover `tests/fronteiras/` |
| Limiar de cobertura vacuamente verde sem domínio | `include` restrito ao domínio e `all: true`: o primeiro arquivo em `domain/` entra na medição sozinho | Ajustar limiar em `vitest.config.ts` |
| Playwright exigir libs de sistema no Linux | Chromium só; libs ficam com o runner em `HT-007` | Marcar `test-funcional` como pendente de ambiente |

## Fora de escopo

- Qualquer código de backend ou caso de uso real — `HT-009`
- Cenários `RN-XXX` — pertencem às histórias de negócio
- Pipeline de CI — `HT-007`
- Cobertura da camada web — a partir de `HT-017` (`ADR-003`)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Há comportamento testável: o gate de fronteiras |
| SRE | Sim | Novas tarefas no harness; Chromium no `setup` |
| Segurança | Não | Sem dado sensível nem integração |
| Arquitetura | Sim | Regras de `ADR-001` viram código |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Comportamento testável coberto por cenário funcional antes do código
- [x] Refatoração feita após os funcionais verdes
- [ ] Testes unitários onde houver lógica — **parcial**: a lógica desta história (regras de fronteira) está coberta pelos 8 cenários de `fronteiras.test.ts`; os `scripts/*.mjs` herdados de `HT-005` seguem sem teste. Dívida registrada na entrega
- [x] Gates marcados acima executados com evidência
- [x] Documentação operacional atualizada
- [x] `docs/entregas/` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [x] Commit semântico citando `HT-006` e tag no mesmo hash
