---
name: implementation-ht-009
description: Plano técnico do esqueleto hexagonal — contexto lancamentos atravessando domínio, aplicação e infraestrutura, ligado por token, com RN-003 como primeira regra testável sem infraestrutura.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-009`

- **Requisitos ligados:** `RNF-020`, `RNF-021`, `RNF-018`; `RN-003`
- **Versão prevista:** `v0.9.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Um contexto só — `lancamentos` — atravessando as camadas de `ADR-001` de ponta
a ponta, com **uma** regra real de domínio para o esqueleto não ser cerimônia:
`RN-003` (mês de referência é o mês civil da data de competência no fuso de São
Paulo). Ela é a regra certa porque exige a porta `Relogio` que `ADR-001` declara
obrigatória, e o cenário da história ("31/01 às 23h59 é janeiro") a prova.

O caso de uso `ConsultarResumoDoMes` recebe `RepositorioDeLancamentos` e
`Relogio` por construtor, soma os lançamentos cujo mês de referência é o mês
atual do relógio. Sem `@Injectable` no caso de uso: a injeção por token acontece
no `lancamentos.module.ts` via `useFactory`, e o domínio nunca vê o NestJS.

O fuso é resolvido com `Intl.DateTimeFormat('pt-BR', { timeZone:
'America/Sao_Paulo' })` — TypeScript puro, sem biblioteca, o que mantém
`domain/` sem dependência externa.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| `@Injectable()` no caso de uso com injeção por tipo | Exige `emitDecoratorMetadata`, que o esbuild do Vitest não emite; e viola a regra 3 de `ADR-001` (token, não classe) |
| Biblioteca de datas (`date-fns-tz`, `luxon`) no domínio | Dependência externa em `domain/` quebra o gate; `Intl` basta para ano e mês |
| Contexto `orcamento` com `RN-001` como exemplo | `RN-001` já está nas fixtures de `HT-006`; `RN-003` exercita a porta `Relogio`, que é o que a história pede |
| Teste HTTP via Playwright | O funcional aqui é a fronteira do controller; `@nestjs/testing` + `fetch` roda sem navegador e sem porta fixa |

## 3. Fronteiras e design

```
backend/src/
  main.ts                                bootstrap (porta 3000)
  app.module.ts
  lancamentos/
    domain/
      model/lancamento.ts                entidade sem decorator
      mes-de-referencia.ts               RN-003
      port/entrada/consultar-resumo-do-mes.ts
      port/saida/repositorio-de-lancamentos.ts
      port/saida/relogio.ts
      port/saida/tokens.ts               Symbol() por porta — TS puro
    application/consultar-resumo-do-mes.ts
    infrastructure/
      http/lancamentos.controller.ts     GET /lancamentos/resumo-do-mes
      persistence/repositorio-em-memoria.ts
      relogio/relogio-do-sistema.ts
      relogio/relogio-fixo.ts
    lancamentos.module.ts                token -> adaptador (useFactory)
```

Tokens vivem em `domain/port/saida/tokens.ts` como `Symbol.for(...)`: são
identidade da porta, não detalhe de framework, e o módulo os importa de lá.

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Testes de domínio, caso de uso e HTTP escritos sobre stubs que devolvem valor errado | Vermelho pelo motivo certo (asserção), não por import |
| 2 | Implementação mínima | Verde |
| 3 | Refatoração | Verde mantido |
| 4 | Teste "sem decorator em domain/" e cobertura ≥ 80% no domínio | Verde; limiar real pela primeira vez |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| 31/01 23:59 SP → janeiro; 01/02 00:01 → fevereiro; instante UTC que cruza o dia em SP | `RN-003` | `domain/mes-de-referencia.test.ts` |
| Resumo soma só o mês do relógio fixo; < 1 s; sem I/O | `RN-003`, `RNF-018` | `application/consultar-resumo-do-mes.test.ts` |
| `GET /lancamentos/resumo-do-mes` responde com o total | fronteira HTTP | `infrastructure/http/lancamentos.controller.test.ts` |
| Nenhum arquivo em `domain/` contém decorator | `ADR-001` regra adicional 1 | `tests/fronteiras/sem-decorator-no-dominio.test.ts` |
| `@nestjs/common` em `domain/` quebra o lint | `ADR-001` | `tests/fronteiras/fronteiras.test.ts` (`HT-006`) + evidência sobre código real |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Vermelho registrado; casos de borda de `RN-003`; cobertura do domínio |
| SRE | Sim | `harness gates` verde; `backend` compila e sobe |
| Segurança | Não | — |
| Arquitetura | Sim | Estrutura bate com `ADR-001`; token, não classe; sem decorator no domínio |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Cobertura do domínio abaixo de 80% pela primeira vez | Média | Portas são só tipos (0 statements); `tokens.ts` e regra cobertos pelos testes |
| Decorators do Nest não compilarem no Vitest | Baixa | `experimentalDecorators` no tsconfig do backend; injeção por token dispensa metadata |
| `Intl` com fuso divergir entre Node local e CI | Baixa | Node 24 embute ICU completo; teste fixa instantes UTC explícitos |

## 7. Plano de reversão

`git revert` do fechamento remove `backend/src/` inteiro; o stub de
`backend/package.json` volta. Nenhum dado, nenhum contrato externo.

## 8. Fechamento

- Mensagem de commit prevista: `feat(backend): scaffold the hexagonal skeleton with the lancamentos context (HT-009)`
- Tag prevista: `v0.9.0`
