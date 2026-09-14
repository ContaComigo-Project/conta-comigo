---
name: ht-013-adaptador-gemini
description: História técnica para colocar o provedor de IA atrás de uma porta do domínio, com teto de chamadas por pessoa por dia, cache obrigatório e degradação graciosa quando o provedor falha.
document_type: story
story_key: HT-013
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-013` — Adaptador Gemini atrás da porta de conselho, com teto de custo e cache

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Ready — próxima demanda (ordem 21)**
- **Requisitos:** `RNF-009` (teto no free tier), `RNF-010` (cache obrigatório), `RNF-005` e `RNF-006` (degradação e limite de espera), `RNF-020` (integração substituível), `RN-021` (falha da IA não esvazia a tela)
- **Depende de:** `HT-009` — concluída
- **Versão prevista:** `v0.21.0`

## Problema técnico

A Fase 4 inteira (`HT-014`, `HN-004`, `HN-005`, `HN-009`, `HN-010`) depende de
falar com um modelo, e nenhuma dessas histórias pode começar enquanto a porta
não existir. Pior: as três restrições que tornam essa integração viável numa PoC
sem orçamento — **teto por pessoa**, **cache** e **degradação** — não são
detalhe do provedor. Se ficarem dentro do adaptador do Gemini, o adaptador falso
não as terá, e cada uma das histórias seguintes vai reinventá-las, ou esquecê-las
e estourar o free tier no primeiro dia de uso.

`HT-011` já resolveu esse mesmo problema para o agregador, e o desenho de lá é o
ponto de partida daqui: política como **decorador da porta**, não como código
dentro do provedor.

## Resultado esperado

Existe a porta `AiAdvisor` no domínio do contexto `intelligence`, com um
adaptador real para o Gemini (via `fetch`, sem SDK) e um falso determinístico.
Três decoradores, aplicáveis a qualquer adaptador, implementam as políticas: um
**teto diário por pessoa** que recusa educadamente ao ser ultrapassado
(`RNF-009`), um **cache** que não paga duas vezes pela mesma pergunta sobre os
mesmos dados (`RNF-010`) e uma **política de resiliência** com limite de espera
e nova tentativa controlada (`RNF-006`), que devolve falha em vez de exceção
para que a tela degrade em vez de sumir (`RNF-005`, `RN-021`).

Sem `GEMINI_API_KEY`, o sistema usa o adaptador falso e sobe normalmente — como
em `HT-011` com o Pluggy. O ambiente local não depende de cadastro em provedor.

## Critérios de aceite

- [ ] `intelligence/domain/port/driven/ai-advisor.ts` define a porta, e nenhum
      arquivo de `domain/` importa framework, SDK ou `fetch`
- [ ] Adaptador `GeminiAdvisor` monta a requisição do Gemini com `fetch`
      injetável; teste prova o corpo enviado sem tocar a rede
- [ ] Sem `GEMINI_API_KEY` o adaptador **recusa operar** (erro explícito), e o
      módulo escolhe o falso — o app sobe sem a chave
- [ ] `RNF-009`: o teto diário por pessoa é explícito (`AI_DAILY_LIMIT`, padrão
      **20**), contado por titular e por dia; ao ultrapassar, a resposta é uma
      recusa educada, não uma exceção, e **nenhuma** chamada ao provedor acontece
- [ ] `RNF-010`: a segunda pergunta igual sobre os mesmos dados é servida do
      cache; teste conta as chamadas ao provedor e exige exatamente uma
- [ ] O cache é invalidado quando os dados mudam — a chave inclui a impressão
      dos dados, não só a pergunta
- [ ] `RNF-006`: limite de espera ≤ 10 s e no máximo 2 novas tentativas, com
      espera crescente, e só para falha transitória
- [ ] `RNF-005` / `RN-021`: provedor indisponível devolve falha tratada; nenhum
      caso de uso lança exceção por causa disso
- [ ] `RNF-015`: o texto enviado ao provedor não leva identificador de pessoa,
      e-mail nem nome; teste prova o que sai
- [ ] `pnpm run lint:boundaries`, `test:unit` e `test:integration` verdes

```gherkin
Cenário: a mesma pergunta sobre os mesmos dados não é paga duas vezes
  Dado um titular dentro do teto diário
  Quando ele pede o mesmo conselho duas vezes sobre os mesmos dados
  Então o provedor é chamado uma única vez
  E a segunda resposta vem do cache, idêntica à primeira
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-009` | Teto por pessoa por dia | Decorador de teto com contador por titular; teste do 21º pedido |
| `RNF-010` | Cache obrigatório | Teste conta chamadas ao provedor: 2 pedidos iguais, 1 chamada |
| `RNF-005` | Degradação graciosa | Provedor indisponível devolve falha, e o painel numérico não depende dela |
| `RNF-006` | Limite de espera e tentativas | Teste com provedor lento e clock controlado |
| `RNF-020` | Integração substituível | Porta no domínio; `lint:boundaries` prova o isolamento |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | Contexto `intelligence` novo, no formato de `ADR-001` |
| Dependências externas | Não | `fetch` nativo; **sem LangChain e sem SDK** — decisão registrada em `ADR-006` |
| Contratos públicos | Não | Nenhum endpoint nesta história; ela entrega a porta |
| Dados e migração | Sim | Contador de uso diário e cache de conselho persistidos (Prisma) |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Estourar o free tier | Teto diário por pessoa, com padrão conservador | Baixar `AI_DAILY_LIMIT` |
| Cache servir resposta velha | A chave inclui a impressão dos dados; dado novo, chave nova | Limpar a tabela de cache |
| Prompt levar dado pessoal | Teste sobre o texto enviado; o prompt recebe números, não identidade | Ajustar o montador de prompt |
| Provedor mudar o formato da resposta | Um único adaptador conhece o formato | Trocar o adaptador |

## Fora de escopo

- Validação de coerência da saída do modelo — é `HT-014` (`RNF-017`)
- Qualquer tela ou endpoint que use a IA (`HN-004` em diante)
- Escolha de modelo por tarefa e ajuste fino de prompt
- Streaming de resposta

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Teto, cache e resiliência são comportamento testável |
| SRE | Sim | Custo e degradação são operação |
| Segurança | Sim | Chave de provedor e dado que sai no prompt |
| Arquitetura | Sim | Contexto novo e ADR de dependência |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Testes de teto, cache, resiliência e prompt verdes
- [ ] `ADR-006` registrando a recusa de LangChain/SDK
- [ ] `lint:boundaries` verde com o contexto novo
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HT-013-adaptador-gemini.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-013` e tag `v0.21.0` no mesmo hash
