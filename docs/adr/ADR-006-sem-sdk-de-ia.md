---
name: adr-006-sem-sdk-de-ia
description: Decisão de falar com o provedor de IA por fetch, sem LangChain e sem SDK oficial, mantendo as políticas de teto, cache e resiliência como decoradores da porta.
document_type: adr
adr_key: ADR-006
status: Aceita
applies_when:
  - integrar um provedor de modelo de linguagem
  - avaliar a entrada de LangChain ou de um SDK de IA no repositório
max_lines: 300
---

# ADR-006 — Provedor de IA por `fetch`, sem LangChain e sem SDK

- **Status:** Aceita
- **Data:** 2026-09-08
- **História:** `HT-013`
- **Decidido por:** time do ContaComigo

## Contexto

O item do kanban chamava-se "Adaptador Gemini/**LangChain**", herdando a
suposição de que uma camada de orquestração de LLM entraria junto com o
provedor. A Fase 4 inteira depende dessa integração, então a decisão vale para
cinco histórias, não só para uma.

Três fatos do próprio repositório pesam aqui:

1. **`HT-011` já enfrentou isso.** O adaptador do Pluggy começou com `axios`, o
   gate de segurança reprovou a dependência e ela saiu: `fetch` nativo resolveu
   as duas chamadas. A integração com o Gemini tem a mesma forma — uma chamada
   HTTP com corpo JSON.
2. **O que essa história entrega não é a chamada.** É o teto por pessoa
   (`RNF-009`), o cache (`RNF-010`) e a degradação com limite de espera
   (`RNF-005`, `RNF-006`). Nada disso é função de biblioteca de LLM; tudo isso é
   política do projeto sobre a porta.
3. **`RNF-012` obriga a auditar o que entra.** LangChain traz uma árvore de
   dependências transitivas grande para uma PoC cujo uso de IA é uma requisição
   por conselho.

## Decisão

O adaptador do Gemini fala com o provedor por **`fetch` nativo**, com
`AbortSignal` para o limite de espera e a chave no cabeçalho `x-goog-api-key`.

**Não entram no repositório** LangChain, `@google/generative-ai` nem qualquer
SDK equivalente enquanto a integração continuar sendo uma chamada por conselho.

As políticas ficam em **decoradores da porta `AiAdvisor`**, empilhados no módulo:

```
CappedAdvisor -> CachedAdvisor -> ResilientAdvisor -> (GeminiAdvisor | FakeAdvisor)
```

Assim elas valem para o provedor real e para o falso, e nenhuma história da
Fase 4 precisa reimplementá-las.

## Alternativas consideradas

### A — LangChain

| | |
| --- | --- |
| A favor | Abstrai provedores; traz cadeia, memória e ferramentas prontas |
| Contra | Superfície grande para auditar (`RNF-012`); a abstração de provedor é justamente o que a porta do `ADR-001` já dá; nenhuma das primitivas dela é usada nesta PoC |

### B — SDK oficial do Gemini

| | |
| --- | --- |
| A favor | Tipos prontos; menos código no adaptador |
| Contra | Uma dependência para montar um JSON e ler outro; o adaptador já é o único ponto que conhece o formato, então o ganho de tipagem não sai daquele arquivo |

### C — `fetch` nativo (**escolhida**) |

| | |
| --- | --- |
| A favor | Zero dependência nova; mesmo caminho já validado em `HT-011`; teste sem rede injetando `fetch` |
| Contra | O formato da requisição e da resposta fica escrito à mão — se o provedor mudar, o adaptador muda |

## Consequências

- Trocar de provedor de IA é escrever um adaptador novo, não migrar de framework.
- As políticas de custo e resiliência são testáveis sem rede e sem chave.
- Se alguma história futura precisar de orquestração real — cadeia com várias
  chamadas, ferramentas, RAG — esta decisão é revisitada em um ADR novo, com o
  caso concreto na mão em vez da suposição.
- O `package.json` do backend continua sem dependência de IA; o gate de
  segurança segue varrendo uma árvore pequena.
