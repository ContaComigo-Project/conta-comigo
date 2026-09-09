---
name: task-ht-014
description: Recorte executável de HT-014 — guarda de saída da IA com validação de formato, coerência numérica e fronteira de aconselhamento.
document_type: task
applies_when:
  - executar a história HT-014
max_lines: 300
---

# TASK — `HT-014`

- **História:** `docs/backlog/historias-tecnicas/HT-014-guarda-de-saida-da-ia.md`
- **Iniciada em:** 2026-09-08
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Nenhum texto do modelo chega ao chamador sem passar por três exames — formato,
coerência numérica contra o dado consolidado e fronteira de aconselhamento — e
reprovar é uma falha tratada, não uma exceção.

## Critérios de aceite copiados da história

- [ ] Regras puras em `intelligence/domain/model/output-guard.ts`, sem framework
- [ ] `GuardedAdvisor` na pilha antes do cache: resposta bloqueada nunca é guardada
- [ ] Valor monetário citado que não existe nos dados bloqueia (`RN-019`)
- [ ] Formatos `1.284,32`, `R$ 1284,32` e `1284.32` são o mesmo valor
- [ ] Contagem, mês e porcentagem não bloqueiam — decisão documentada
- [ ] Recomendação de produto financeiro bloqueia, com variação de caixa e acento (`RN-017`)
- [ ] Resposta vazia, gigante ou com bloco de código bloqueia (`RNF-017`)
- [ ] O motivo do bloqueio é registrável sem despejar o texto inteiro
- [ ] Bloqueio devolve falha `resposta-bloqueada`, nunca exceção
- [ ] `lint:boundaries`, `test:unit` e `test:integration` verdes

## Escopo desta task

**Dentro:** regras de guarda no domínio do contexto `intelligence`, o decorador
`GuardedAdvisor`, o motivo de falha novo, a posição na pilha do módulo e testes.

**Fora:** aviso de não aconselhamento na tela (`RN-018`), reescrita ou nova
tentativa da resposta bloqueada, classificação da pergunta antes do envio.

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/intelligence/domain/model/output-guard.ts` | criar | As três regras, puras |
| `backend/src/intelligence/domain/model/output-guard.test.ts` | criar | Prova de `RN-017`, `RN-019` e `RNF-017` |
| `backend/src/intelligence/domain/model/ai-result.ts` | alterar | Motivo `resposta-bloqueada` |
| `backend/src/intelligence/infrastructure/ai/guarded-advisor.ts` | criar | O decorador |
| `backend/src/intelligence/infrastructure/ai/guarded-advisor.test.ts` | criar | Prova na pilha, com provedor adulterado |
| `backend/src/intelligence/intelligence.module.ts` | alterar | Posição na pilha |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-013` — porta de IA e decoradores | Done | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
