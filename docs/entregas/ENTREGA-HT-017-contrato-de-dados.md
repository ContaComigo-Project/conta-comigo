---
name: entrega-ht-017
description: Documento de entrega do contrato de dados web↔API — pacote compartilhado com esquemas zod, faixa calculada no domínio, origem falsa na web e prova de equivalência com os mocks.
document_type: delivery
story_key: HT-017
version: v0.11.0
max_lines: 300
---

# ENTREGA — `HT-017` — Contrato de dados entre a web e a API

- **Data:** 2026-09-07
- **Tipo:** Técnica (fronteira apresentação↔domínio)
- **Versão:** `v0.11.0`
- **Commit:** `1e011e4`
- **Tag:** `v0.11.0` → `1e011e4`

## O que foi entregue

A fronteira que não existia. Web e API passam a compartilhar um contrato
explícito — `@contacomigo/contrato` — com tipos de transporte, esquemas `zod`
que **rejeitam** campo de apresentação, e um envelope `Resultado<T>` em que erro
e "dados insuficientes" são estados de primeira classe. A faixa do orçamento
vem calculada do domínio (`RN-001`, primeira regra do contexto `orcamento`). Na
web, uma origem falsa entrega o contrato a partir da massa dos mocks, e um teste
prova que `mapeadores(OrigemFalsa)` produz **o mesmo objeto** que os mocks —
logo a UI renderiza igual sem que nenhum componente tenha sido tocado.

| Artefato | Papel |
| --- | --- |
| `packages/contrato/src/*` | `LancamentoDTO`, `ResumoDoMesDTO`, `CategoriaDeOrcamentoDTO`, `BancoConectadoDTO`, `CategoriaDeGastoDTO`, `Resultado<T>`; centavos inteiros, ISO com fuso, tudo `strict()` |
| `backend/src/orcamento/domain/faixa-do-semaforo.ts` | `RN-001`/`RN-002` em inteiros, sem arredondamento intermediário |
| `backend/.../http/lancamento.dto.ts`, `GET /lancamentos` | Entidade→DTO na borda; resposta validada pelo esquema no teste HTTP |
| `frontend/src/dados/{origem-de-dados,origem-falsa,mapeadores,apresentacao}.ts` | Porta, origem falsa, formatação e cor/ícone na borda da web |
| `tooling/fronteiras/regras.cjs` + fixture `faixa-contrato.ts` | Regra `dominio-nao-conhece-transporte`; fim da exceção a `import type` no domínio |

Executada pelo **loop autônomo** em 11 voltas, uma ação por volta.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-020` | O contrato é a porta entre UI e origem; trocar a origem não toca componente | `*-test-unitario-verde-equivalencia.txt` |
| `RNF-005` | `Resultado` modela `erro` e `dados-insuficientes` (`RN-020`, `RN-021`) | `*-test-unitario-verde-contrato.txt` |
| `RN-001`, `RN-002` | Faixa no domínio, 9 casos de borda do catálogo | `*-coverage-verde-rn001.txt` |
| `RN-006` | Centavos inteiros no transporte; formatação só na web | esquema rejeita `-34.9` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Cada estrutura da UI tem tipo de transporte documentado | Aprovado | 5 DTOs + envelope, comentados no pacote |
| Nenhum campo só visual no contrato | Aprovado | esquemas `strict()` rejeitam `formattedAmount`, `bankColor`, `barClass`, `color`, `initials` |
| Faixa calculada no domínio e transportada pronta | Aprovado | `faixaDoSemaforo` + `CategoriaDeOrcamentoDTO.faixa` obrigatório |
| Erro e "dados insuficientes" cobertos | Aprovado | `resultadoDe()` com 3 estados; estado desconhecido rejeitado |
| Componentes compilam sem mudança visual | Aprovado | `build` verde; nenhum arquivo em `components/`/`pages/` alterado; equivalência campo a campo |
| Origem falsa satisfaz o contrato | Aprovado | todos os itens da `OrigemFalsa` passam no esquema |
| Falha esperada: transporte em `domain/` quebra o lint | Aprovado — **após correção** | `*-lint-contrato-no-dominio-2.txt` |

## Evidência de testes

Vermelhos antes do código, por asserção, em cada frente:

```
      Tests  12 failed | 35 passed (47)
      Tests  7 failed | 49 passed (56)
      Tests  4 failed | 56 passed (60)
      Tests  1 failed | 60 passed (61)
```

Gate de fronteiras bloqueando transporte no domínio, com regra e arquivo:

```
  error dominio-nao-conhece-transporte: backend/src/lancamentos/domain/model/usa-contrato-proposital.ts → packages/contrato/src/index.ts
```

Gates finais:

```
✔ no dependency violations found (117 modules, 216 dependencies cruised)
      Tests  62 passed (62)
      Tests  3 passed (3)
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `harness test-unitario` | 62 passed (17 contrato, 9 RN-001, 4 equivalência, 1 HTTP novo) | — |
| Integração | `harness test-integracao` | 3 passed | — |
| Funcional | `harness test-funcional` | 2 passed | — |
| Cobertura (domínio) | `harness coverage` | 100% (12/12) — dois contextos | — |
| Estático | `harness lint` | 117 módulos, 0 violações | — |
| Build | `harness build` | web + typecheck da API | — |

## Refatoração feita após os funcionais verdes

1. **Duas correções no gate de fronteiras**, expostas pela falha esperada
   (`VERDE INESPERADO` registrado em `*-lint-contrato-no-dominio.txt`): a regra
   `dominio-so-importa-dominio` tolerava `import type` — exceção que `ADR-001`
   só dá a `application/`; e pacote de workspace resolve por symlink para
   `packages/…`, invisível à regra de "npm". Nova regra
   `dominio-nao-conhece-transporte` cobre domínio **e** aplicação; fixture
   permanente `faixa-contrato.ts` no teste de fronteiras.
2. `OrigemFalsa` com campo explícito no construtor (`erasableSyntaxOnly` da
   web) e `semData` sem variável descartada (ESLint).

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Quatro vermelhos por asserção; equivalência compara objeto inteiro (menos `date`, ver Decisões); casos de borda de `RN-001` copiados do catálogo |
| SRE | `sre-agent` | Não aplicável | — |
| Segurança | `security-specialist-agent` | Aprovado | Contrato não expõe campo além do necessário; identidade real de `user.mock` não entra (fica para `HT-018`) |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Transporte fora de `domain/` e `application/`, agora **verificado**; faixa no domínio; entidade→DTO só na borda HTTP |
| Revisão final | `final-reviewer-agent` | Aprovado | Escopo contido: nenhum componente alterado, nenhum mock removido |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| Contrato em `packages/contrato`, não duplicado por lado | Tipo duplicado diverge; pacote único é o contrato |
| `zod` `strict()` em tudo | É o que torna "sem campo visual" verificável, não combinado |
| Percentual **não** viaja; a web deriva dos totais | Número derivado no transporte pode divergir do original; o teste prova que dá os mesmos 28,7 / 19,0 / 9,5 |
| `date` excluído da equivalência de lançamentos | O mock traz `date` relativo a `Date.now()` **e** um rótulo literal (`"Hoje, 10:02"`) que não deriva dele; o rótulo é o que a tela mostra, então é ele que a origem falsa reproduz. Inconsistência do mock, registrada para `HT-018` |
| Ids legados (`cat_food`, `bank_nubank`) e cores/ícones em `apresentacao.ts` | Preservam a UI hoje; `HT-018` decide se mantém |
| `categoria: null`, `instituicao: desconhecida` no DTO da API | A entidade ainda não tem os dois; dizer explicitamente é melhor que inventar |
| `orcamento` nasce com uma regra só | Contexto criado porque a história exigiu, não por antecipação |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| Componentes ainda importam de `src/mocks` | Por desenho: trocar imports é `HT-018` | `HT-018` |
| `GET /lancamentos` sem filtro de período | `RF-009` | `HN-003` |
| Inconsistências do mock preservadas (cor do Inter, ícone de Alimentação, `formattedDate`) | Equivalência exige reproduzir; corrigir é decisão de produto | `HT-018` |
| `CategoriaDeOrcamentoDTO` sem endpoint ainda | Faixa calculada; exposição é `HN-006`/`HN-007` | `HN-007` |

## Verificação de fechamento

- [x] `scripts/verificar-fechamento.sh v0.11.0` verde
- [x] Tag `v0.11.0` aponta para o mesmo hash do commit
- [x] Evidência presente em `docs/tasks/HT-017/evidencia/` (12 arquivos)
