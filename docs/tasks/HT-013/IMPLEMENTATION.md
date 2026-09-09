---
name: implementation-ht-013
description: Plano técnico de HT-013 — porta de IA com adaptador Gemini por fetch e políticas de teto, cache e resiliência como decoradores.
document_type: implementation_plan
applies_when:
  - implementar a história HT-013
max_lines: 300
---

# IMPLEMENTATION — `HT-013`

- **Requisitos ligados:** `RNF-005`, `RNF-006`, `RNF-009`, `RNF-010`, `RNF-015`, `RNF-020`, `RN-021`
- **Versão prevista:** `v0.21.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Repetir o desenho que `HT-011` provou no agregador. A porta `AiAdvisor` vive no
domínio do contexto `intelligence` e devolve um resultado tratado (`ok` ou falha
com motivo), nunca uma exceção — é o que permite a tela degradar em vez de sumir
(`RNF-005`, `RN-021`).

As três políticas são **decoradores da porta**, empilhados no módulo:

```
CappedAdvisor(teto)  ->  CachedAdvisor(cache)  ->  ResilientAdvisor(espera)  ->  Gemini | Falso
```

A ordem é a regra, não estética: o teto vem primeiro para que uma pessoa acima
da cota não consuma nem cache nem rede; o cache vem antes da resiliência para
que um acerto de cache não pague espera nenhuma.

O adaptador do Gemini usa `fetch` nativo com `AbortSignal`, sem SDK e sem
LangChain — mesma razão de `HT-011`, registrada em `ADR-006`. Sem
`GEMINI_API_KEY` o adaptador recusa construir e o módulo escolhe o falso, para
que o ambiente local suba sem cadastro em provedor.

O contador de uso e o cache são portas com dois adaptadores cada: em memória
(teste e ambiente sem banco) e Prisma (produção da PoC).

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| LangChain | Camada de abstração inteira para uma chamada HTTP; superfície nova para auditar (`RNF-012`) e peso sem contrapartida nesta PoC |
| SDK oficial do Gemini | Mesma razão; `fetch` já dá conta e o adaptador é o único ponto que conhece o formato |
| Teto global em vez de por pessoa | `RNF-009` fala de teto por pessoa por dia; um teto global deixaria uma pessoa consumir a cota de todas |
| Cache só pela pergunta | Serviria resposta velha quando o dado muda; a chave precisa da impressão dos dados |
| Cache em memória do processo | Perde-se a cada reinício e não vale entre instâncias; o custo evitado é justamente o que sobrevive ao deploy |
| Política dentro do adaptador Gemini | O adaptador falso ficaria sem ela, e cada história da Fase 4 reinventaria o teto |

## 3. Fronteiras e design

- Módulos tocados: `intelligence` (novo), `app.module.ts`, schema do Prisma
- Contratos novos ou alterados: nenhum endpoint; a porta é interna
- Dependências que entram: nenhuma

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenário do cache: duas perguntas iguais, uma chamada | Vermelho antes do código |
| 2 | Porta, adaptador falso e decoradores mínimos | Verde |
| 3 | Refatoração dos decoradores para composição única | Continua verde |
| 4 | Unitários: teto, invalidação de cache, resiliência, prompt sem identidade | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Duas perguntas iguais, uma chamada ao provedor | `RNF-010` | `cached-advisor.test.ts` |
| Dado diferente gera chave diferente | `RNF-010` | `advice-key.test.ts` |
| 21º pedido do dia é recusado sem chamar o provedor | `RNF-009` | `capped-advisor.test.ts` |
| Contagem é por titular e por dia | `RNF-009` | `daily-quota.test.ts` |
| Provedor lento estoura o limite e devolve falha | `RNF-006`, `RNF-005` | `resilient-advisor.test.ts` |
| Falha permanente não é repetida | `RNF-006` | `resilient-advisor.test.ts` |
| Corpo enviado ao Gemini não leva identidade | `RNF-015` | `gemini-advisor.test.ts` |
| Sem chave, o adaptador recusa operar | `RNF-012` | `gemini-advisor.test.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `scripts/harness.sh gates` |
| SRE | Sim | Teto e degradação são operação; evidência do teto atingido |
| Segurança | Sim | Chave fora do repositório; prompt sem identidade |
| Arquitetura | Sim | `lint:boundaries` e `ADR-006` |
| Revisão final | Sim | `scripts/verificar-fechamento.sh v0.21.0` |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Cache servir resposta de outra pessoa | Baixa | A chave inclui o titular; teste cobre dois titulares com a mesma pergunta |
| Teto contado em fuso errado vira teto duplo | Média | O dia é derivado do `Clock` injetado, em UTC, e testado na virada |
| Falha do provedor derrubar caso de uso | Média | A porta devolve resultado tratado; nenhum `throw` atravessa |

## 7. Plano de reversão

Remover o `IntelligenceModule` do `app.module.ts`. Nenhuma tela consome a porta
ainda (a primeira será `HN-004`), então a reversão não tem efeito visível. As
tabelas novas ficam vazias e podem ser removidas por migração.

## 8. Fechamento

- Mensagem de commit prevista: `feat(intelligence): AI advisor port with daily cap and cache (HT-013)`
- Tag prevista: `v0.21.0` apontando para o commit de fechamento
