---
name: task-ht-012
description: Recorte executável de HT-012 — observabilidade mínima com log estruturado, correlação de requisição e redação de dado sensível.
document_type: task
applies_when:
  - executar a história HT-012
max_lines: 300
---

# TASK — `HT-012`

- **História:** `docs/backlog/historias-tecnicas/HT-012-observabilidade-minima.md`
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Toda requisição da API sai com um identificador de correlação e vira uma linha
de log JSON sem nenhum dado pessoal ou financeiro, e toda falha é rastreável até
a operação por esse mesmo identificador.

## Critérios de aceite copiados da história

- [ ] `x-request-id` na resposta, preservando o recebido quando existe
- [ ] Uma linha JSON por requisição com `level`, `timestamp`, `requestId`, `method`, `route`, `status`, `durationMs`
- [ ] Falha não tratada: linha `error` com o mesmo `requestId`, a operação e a mensagem; a resposta devolve o `requestId`
- [ ] Redação recursiva prova que senha, e-mail, token e valor não aparecem no log (`RNF-015`)
- [ ] Redação vive no domínio, pura e testada sem Nest
- [ ] `lint:boundaries`, `test:unit` e `test:integration` verdes

## Escopo desta task

**Dentro:** contexto `backend/src/observability` (domínio de redação e entrada de
log, porta de saída, middleware de correlação, interceptor de requisição, filtro
de exceção, sink JSON em `stdout`), registro no `app.module.ts` e no `main.ts`,
testes de unidade e de fronteira HTTP.

**Fora:** exportação para serviço externo, métrica, tracing distribuído, alerta,
log do frontend e qualquer alteração nos casos de uso existentes.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/observability/domain/model/log-entry.ts` | criar | Entrada de log e redação, puras |
| `backend/src/observability/domain/model/log-entry.test.ts` | criar | Prova de `RNF-015` sem framework |
| `backend/src/observability/domain/model/request-id.ts` | criar | Correlação como valor do domínio |
| `backend/src/observability/domain/port/driven/log-sink.ts` | criar | Porta de saída do log |
| `backend/src/observability/domain/port/driven/tokens.ts` | criar | Tokens de injeção do contexto |
| `backend/src/observability/infrastructure/logging/json-log-sink.ts` | criar | Sink que escreve JSON em `stdout` |
| `backend/src/observability/infrastructure/logging/memory-log-sink.ts` | criar | Sink de teste |
| `backend/src/observability/infrastructure/http/correlation.middleware.ts` | criar | Gera ou aproveita `x-request-id` |
| `backend/src/observability/infrastructure/http/request-log.interceptor.ts` | criar | Linha por requisição com duração |
| `backend/src/observability/infrastructure/http/traceable-error.filter.ts` | criar | Erro rastreável; resposta com `requestId` |
| `backend/src/observability/infrastructure/http/observability.test.ts` | criar | Prova de correlação e de erro na fronteira |
| `backend/src/observability/observability.module.ts` | criar | Liga porta a adaptador |
| `backend/src/app.module.ts` | alterar | Registra o contexto novo |
| `backend/src/main.ts` | alterar | Troca `console.log` pelo log estruturado |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-009` — esqueleto hexagonal | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
