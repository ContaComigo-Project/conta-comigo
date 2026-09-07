---
name: task-ht-017
description: Recorte executável do contrato de dados web↔API — pacote compartilhado de tipos de transporte, origem falsa e prova de que a troca de origem não muda a tela.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-017`

- **História:** [`docs/backlog/historias-tecnicas/HT-017-contrato-de-dados.md`](../../backlog/historias-tecnicas/HT-017-contrato-de-dados.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent` (loop autônomo)

## Objetivo em uma frase

Existe um contrato explícito entre web e API — tipos de transporte com
significado documentado, erro e "dados insuficientes" modelados — e uma origem
falsa que o satisfaz, provando que a UI renderiza igual quando a origem muda.

## Critérios de aceite copiados da história

- [x] Cada estrutura consumida pela UI tem tipo de transporte definido e documentado
- [x] Nenhum campo do contrato existe só para conveniência visual (classe, ícone, rótulo)
- [x] Campo derivado de regra (faixa do semáforo) é calculado no domínio e transportado pronto
- [x] Contrato cobre erro e "dados insuficientes" (`RN-020`, `RN-021`)
- [x] Componentes atuais compilam contra o novo contrato sem mudança visual
- [x] Origem falsa satisfaz o contrato, usada em teste e no ambiente local

## Escopo desta task

**Dentro:** pacote `packages/contrato` (`@contacomigo/contrato`): esquemas `zod`
e tipos para `Lancamento`, `ResumoDoMes`, `CategoriaDeOrcamento` (com `faixa`),
`BancoConectado`, `CategoriaDeGasto`, mais o envelope `Resultado<T>` com os
estados `ok` / `erro` / `dados-insuficientes`; `RN-001` (`faixaDoSemaforo`) no
domínio do backend (nasce o contexto `orcamento`, só com essa regra); controller
`GET /lancamentos` devolvendo o contrato; na web, `src/dados/`: porta
`OrigemDeDados`, `OrigemFalsa` (adapta os mocks ao contrato) e mapeadores
contrato→apresentação que reproduzem os formatos que os componentes consomem
hoje (`formattedAmount`, `bankColor`…); teste que prova que mock e
`OrigemFalsa`+mapeador produzem o mesmo objeto de apresentação.

**Fora:** remover mocks ou trocar imports dos componentes (`HT-018`); endpoints
além de `GET /lancamentos`; tela nova; regras além de `RN-001` e `RN-003`.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `pnpm-workspace.yaml`, `packages/contrato/package.json`, `tsconfig.json` | criar/alterar | Pacote compartilhado |
| `packages/contrato/src/{resultado,lancamento,orcamento,banco,categoria,index}.ts` | criar | Contrato |
| `packages/contrato/src/*.test.ts` | criar | Esquemas validam exemplos e rejeitam campo visual |
| `backend/src/orcamento/domain/faixa-do-semaforo.ts` + teste | criar | `RN-001` no domínio |
| `backend/src/lancamentos/infrastructure/http/lancamentos.controller.ts` | alterar | `GET /lancamentos` no contrato |
| `frontend/src/dados/{origem-de-dados,origem-falsa,mapeadores}.ts` + testes | criar | Porta, origem falsa, formatação na borda |
| `tooling/fronteiras/regras.cjs` | alterar | `@contacomigo/contrato` permitido em `infrastructure/`, proibido em `domain/` |
| `vitest.config.ts` | alterar | Incluir `packages/**` e `frontend/src/dados/**` |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-016` inventário (o que é requisito vs acidente) | Done | Não |
| `HT-009` contexto `lancamentos` | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
