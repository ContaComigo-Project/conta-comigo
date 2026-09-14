---
name: task-ht-013
description: Recorte executável de HT-013 — porta de conselho de IA com adaptador Gemini, teto diário por pessoa, cache obrigatório e degradação graciosa.
document_type: task
applies_when:
  - executar a história HT-013
max_lines: 300
---

# TASK — `HT-013`

- **História:** `docs/backlog/historias-tecnicas/HT-013-adaptador-gemini.md`
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

O sistema fala com um modelo de IA através de uma porta do domínio, e as três
restrições que tornam isso viável na PoC — teto por pessoa, cache e degradação —
valem para qualquer provedor, porque vivem em decoradores da porta.

## Critérios de aceite copiados da história

- [ ] Porta `AiAdvisor` no domínio, sem framework, SDK ou `fetch`
- [ ] `GeminiAdvisor` monta a requisição com `fetch` injetável; teste sem rede
- [ ] Sem `GEMINI_API_KEY` o adaptador recusa operar e o módulo usa o falso
- [ ] Teto diário por titular (`AI_DAILY_LIMIT`, padrão 20) com recusa educada e zero chamada ao provedor
- [ ] Segunda pergunta igual sobre os mesmos dados: exatamente uma chamada ao provedor
- [ ] Cache invalidado quando os dados mudam (a chave inclui a impressão dos dados)
- [ ] Limite de espera ≤ 10 s, até 2 novas tentativas, só para falha transitória
- [ ] Provedor indisponível devolve falha tratada, nunca exceção
- [ ] O texto enviado ao provedor não leva identidade da pessoa
- [ ] `lint:boundaries`, `test:unit` e `test:integration` verdes

## Escopo desta task

**Dentro:** contexto `backend/src/intelligence` (porta, modelo de pedido e
resposta, chave de cache, contador de uso), adaptadores Gemini e falso, os três
decoradores, persistência do contador e do cache, módulo, `ADR-006` e testes.

**Fora:** validação de coerência da saída (`HT-014`), qualquer endpoint ou tela
de IA, escolha de modelo por tarefa, streaming.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/intelligence/domain/model/advice.ts` | criar | Pedido e resposta de conselho, puros |
| `backend/src/intelligence/domain/model/advice-key.ts` | criar | Chave de cache: pergunta + impressão dos dados |
| `backend/src/intelligence/domain/model/ai-result.ts` | criar | Resultado tratado: `ok` ou falha com motivo |
| `backend/src/intelligence/domain/model/daily-quota.ts` | criar | Regra do teto diário, pura |
| `backend/src/intelligence/domain/port/driven/ai-advisor.ts` | criar | A porta |
| `backend/src/intelligence/domain/port/driven/advice-cache.ts` | criar | Porta do cache |
| `backend/src/intelligence/domain/port/driven/usage-counter.ts` | criar | Porta do contador de uso |
| `backend/src/intelligence/domain/port/driven/tokens.ts` | criar | Tokens de injeção |
| `backend/src/intelligence/infrastructure/ai/gemini-advisor.ts` | criar | Adaptador real, `fetch` sem SDK |
| `backend/src/intelligence/infrastructure/ai/fake-advisor.ts` | criar | Adaptador determinístico para local e teste |
| `backend/src/intelligence/infrastructure/ai/resilient-advisor.ts` | criar | `RNF-006` como decorador |
| `backend/src/intelligence/infrastructure/ai/capped-advisor.ts` | criar | `RNF-009` como decorador |
| `backend/src/intelligence/infrastructure/ai/cached-advisor.ts` | criar | `RNF-010` como decorador |
| `backend/src/intelligence/infrastructure/persistence/*` | criar | Contador e cache em memória e em Prisma |
| `backend/src/intelligence/intelligence.module.ts` | criar | Liga porta a adaptador e empilha decoradores |
| `backend/prisma/schema.prisma` + migration | alterar | Tabelas de uso diário e de cache |
| `backend/src/app.module.ts` | alterar | Registra o contexto novo |
| `docs/adr/ADR-006-sem-sdk-de-ia.md` | criar | Decisão de não usar LangChain nem SDK |
| `.env.example` | alterar | `AI_DAILY_LIMIT` documentado |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-009` — esqueleto hexagonal | Done | Não |
| `HT-010` — persistência e migrações | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
