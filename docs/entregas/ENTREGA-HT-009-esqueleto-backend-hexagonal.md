---
name: entrega-ht-009
description: Documento de entrega do esqueleto hexagonal do backend — contexto lancamentos atravessando todas as camadas, ligado por token, com RN-003 como primeira regra testável sem infraestrutura.
document_type: delivery
story_key: HT-009
version: v0.9.0
max_lines: 300
---

# ENTREGA — `HT-009` — Esqueleto do backend hexagonal

- **Data:** 2026-09-07
- **Tipo:** Técnica (arquitetura)
- **Versão:** `v0.9.0`
- **Commit:** `b7f2945`
- **Tag:** `v0.9.0` → `b7f2945`

## O que foi entregue

`backend/` deixou de ser um README. Existe um contexto — `lancamentos` —
atravessando as camadas de `ADR-001` de ponta a ponta, executável (`pnpm run
start:api` sobe a API; `GET /lancamentos/resumo-do-mes` responde) e com a
primeira regra de domínio real: `RN-003`, mês de referência no fuso de São
Paulo.

```
backend/src/lancamentos/
  domain/model/lancamento.ts                 entidade sem decorator
  domain/mes-de-referencia.ts                RN-003 (Intl, sem biblioteca)
  domain/port/entrada/consultar-resumo-do-mes.ts
  domain/port/saida/{repositorio-de-lancamentos,relogio,tokens}.ts
  application/consultar-resumo-do-mes.ts     caso de uso, sem @Injectable
  infrastructure/http/lancamentos.controller.ts
  infrastructure/persistence/repositorio-em-memoria.ts   adaptador falso
  infrastructure/relogio/{relogio-do-sistema,relogio-fixo}.ts
  lancamentos.module.ts                      porta -> adaptador por token
```

A porta `Relogio` existe com implementação real e fixa, como `ADR-001` exige —
e é ela que torna `RN-003` provável: o teste fixa 31/01 23:59 em São Paulo e o
domínio enxerga janeiro.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-020` | Adaptadores atrás de porta; o caso de uso só conhece interfaces | `application/consultar-resumo-do-mes.test.ts` roda com fakes inline |
| `RNF-021` | Gate de fronteiras **provado sobre código real**, depois de corrigido | `*-lint-violacao-real-2.txt` |
| `RNF-018` | Primeira RN com teste; cobertura do domínio medida de verdade: 100% | `*-coverage-verde.txt` |
| `RN-003` | Quatro casos de borda de fuso, inclusive virada de ano | `domain/mes-de-referencia.test.ts` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Estrutura de `ADR-001` com um contexto atravessando as camadas | Aprovado | árvore acima; `lint:fronteiras` 91 módulos sem violação |
| Entidade, porta de entrada, porta de saída, caso de uso, controller, adaptador falso | Aprovado | 10 arquivos em `backend/src/lancamentos/` |
| Módulo liga por **token**, não por classe | Aprovado | `TOKENS.*` com `Symbol.for`; `useFactory`; teste HTTP troca adaptador pelo token |
| Nenhuma entidade de domínio com decorator | Aprovado | `sem-decorator-no-dominio.test.ts`; plantar decorator deixa vermelho (`*-decorator-real.txt`) |
| Porta `Relogio` real e fixa | Aprovado | `RelogioDoSistema`, `RelogioFixo` |
| Fronteiras rodam em `harness lint` | Aprovado | `*-lint-verde-2.txt` |
| A checagem **bloqueia** com teste que prova | Aprovado — **após correção** | ver Refatoração |
| Caso de uso testado sem banco, HTTP ou framework, < 1 s | Aprovado | asserção de duração no próprio teste |

## Evidência de testes

Vermelho antes do código — 7 falhas por asserção sobre stubs, nenhuma por import:

```
      Tests  7 failed | 12 passed (19)
```

Gates de ponta a ponta com o backend real:

```
      Tests  23 passed (23)
Lines        : 100% ( 7/7 )
seguranca: aprovada
harness: gates concluídos
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Funcional | `harness test-funcional` + teste HTTP no Vitest | 2 + 1 passed | — |
| Unitário | `harness test-unitario` | 23 passed | — |
| Cobertura (domínio) | `harness coverage` | Verde | **100% (7/7 linhas)** — primeiro número real |
| Estático | `harness lint` | Verde, 91 módulos | — |

## Refatoração feita após os funcionais verdes

1. **Fakes do teste de aplicação construídos a partir das portas.** A primeira
   versão importava `RelogioFixo` e o repositório em memória de
   `infrastructure/` — e o gate reprovou: `application/` não conhece
   `infrastructure/`, nem em teste. A correção reforça o desenho: o caso de uso
   precisa só de quem cumpra o contrato.
2. **`exclude` de `node_modules` removido do dependency-cruiser.** O critério
   "falha esperada em código real" expôs um furo grave: com `node_modules` em
   `exclude`, o pacote sai do grafo e a aresta `domain/ → @nestjs/common`
   desaparece antes de a regra rodar. **Plantei um import real e o gate ficou
   verde** (`*-lint-violacao-real.txt`, `VERDE INESPERADO`, mantido como
   registro). As fixtures de `HT-006` não pegaram porque não usavam o mesmo
   `exclude`. Agora as opções são compartilhadas, `node_modules` fica só em
   `doNotFollow`, e `config-de-producao.test.ts` impede a regressão.
3. `moduleResolution: Bundler` no backend — `NodeNext` exigia `.js` nos
   imports relativos, que `tsx` e Vitest não pedem.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Vermelho por asserção registrado; casos de borda de fuso; teste de duração; cobertura do domínio 100% |
| SRE | `sre-agent` | Aprovado | `gates` verde; API sobe com `tsx` e responde; typecheck do backend entrou no `build` |
| Segurança | `security-specialist-agent` | Não aplicável | — |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Estrutura idêntica a `ADR-001`; token via `Symbol.for`; sem decorator no domínio; sem `@Injectable` no caso de uso; controller não passa request ao caso de uso |
| Revisão final | `final-reviewer-agent` | Aprovado | Escopo contido a um contexto; MINOR |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| Contexto `lancamentos` e `RN-003` como exemplo | Exercita a porta `Relogio` obrigatória; `RN-001` já vive nas fixtures |
| Tokens em `domain/port/saida/tokens.ts` com `Symbol.for` | Identidade da porta é do domínio; TypeScript puro, sem framework |
| `useFactory` em vez de `@Injectable` no caso de uso | Sem `emitDecoratorMetadata` (esbuild não emite); e é a regra 3 de `ADR-001` |
| `Intl.DateTimeFormat` para o fuso | Zero dependência em `domain/`; Node 24 tem ICU completo |
| Valores em centavos (inteiro) | Soma sem erro de ponto flutuante |
| Teste de aplicação não importa `infrastructure/` | Decisão forçada pelo gate; registrada porque muda como se escrevem testes de caso de uso daqui em diante |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| `scripts/*.mjs` sem teste unitário (herdada) | Executor existe; falta extrair funções | próxima `HT` de tooling |
| Persistência é falsa | Por desenho; Prisma chega em `HT-010` | `HT-010` |
| `HARNESS_RUN` sobe só a web | `start:api` existe, mas não há orquestração dos dois | `HT-017` |

## Verificação de fechamento

- [x] `scripts/verificar-fechamento.sh v0.9.0` verde
- [x] Tag `v0.9.0` aponta para o mesmo hash do commit
- [x] Evidência presente em `docs/tasks/HT-009/evidencia/` (11 arquivos)
