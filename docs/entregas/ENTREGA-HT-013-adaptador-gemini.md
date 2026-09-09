---
name: entrega-ht-013
description: Documento de entrega da porta de conselho de IA do ContaComigo — adaptador Gemini por fetch, teto diário por pessoa, cache obrigatório e degradação graciosa.
document_type: delivery
story_key: HT-013
version: v0.21.0
max_lines: 300
---

# ENTREGA — `HT-013` — Adaptador Gemini com teto de custo e cache

- **Data:** 2026-09-08
- **Tipo:** Técnica
- **Versão:** `v0.21.0`
- **Commit:** `c862ac5`
- **Tag:** `v0.21.0` → `c862ac5`

## O que foi entregue

- **Contexto `intelligence`** no formato do `ADR-001`, abrindo a Fase 4.
- **Porta `AiAdvisor`** (`domain/port/driven/ai-advisor.ts`), que devolve
  resultado tratado — `ok` ou falha com motivo — e nunca lança exceção.
- **`domain/model/`** puro: `advice.ts` (pedido sem identidade da pessoa),
  `ai-result.ts`, `advice-key.ts` (chave de cache com impressão dos dados) e
  `daily-quota.ts` (teto diário e virada em UTC).
- **`GeminiAdvisor`** — adaptador real por `fetch`, sem SDK, com `AbortSignal`,
  chave no cabeçalho `x-goog-api-key` e tradução de status HTTP em motivo.
- **`FakeAdvisor`** — determinístico, sem rede e sem citar valores (`RN-019`).
- **Três decoradores da porta**, empilhados no módulo como
  `Capped -> Cached -> Resilient -> (Gemini | Falso)`:
  - `CappedAdvisor` — teto diário por titular (`AI_DAILY_LIMIT`, padrão 20) com
    recusa educada e zero chamada ao provedor;
  - `CachedAdvisor` — não paga duas vezes pela mesma pergunta sobre os mesmos
    dados, e não guarda falha;
  - `ResilientAdvisor` — limite de espera de 10 s, até 2 novas tentativas, só
    para falha transitória.
- **Persistência** do contador e do cache em Prisma (`ai_daily_usage`,
  `ai_advice_cache`, com migração) e em memória para teste.
- **`ADR-006`** — decisão de não usar LangChain nem SDK, com as alternativas.
- `AI_DAILY_LIMIT` documentado no `.env.example`; `app.module.ts` registra o
  contexto novo.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-009` — o uso de IA cabe no free tier | Teto por titular e por dia, verificado antes de qualquer chamada | `capped-advisor.test.ts` (4 cenários) |
| `RNF-010` — resposta equivalente não é paga duas vezes | Cache com chave de titular + tipo + pergunta + impressão dos dados | `cached-advisor.test.ts`, `advice-key.test.ts` |
| `RNF-005` / `RN-021` — provedor fora degrada, não derruba | Falha é valor de retorno; nem exceção nem timeout atravessam a porta | `resilient-advisor.test.ts` |
| `RNF-006` — limite de espera e tentativa controlada | 10 s, 2 novas tentativas, espera crescente, só para transitória | `resilient-advisor.test.ts` |
| `RNF-015` — dado pessoal não sai do sistema | O prompt leva números e categorias, nunca o titular | `gemini-advisor.test.ts` |
| `RNF-012` — segredo fora do repositório | Sem chave o adaptador recusa construir; a chave vai no cabeçalho, não na URL | `gemini-advisor.test.ts` |
| `RNF-020` — integração substituível | Porta no domínio; `depcruise` verde em 245 módulos | `lint:boundaries` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Porta no domínio sem framework, SDK ou `fetch` | Aprovado | `lint:boundaries` verde |
| `GeminiAdvisor` com `fetch` injetável, testado sem rede | Aprovado | 6 cenários em `gemini-advisor.test.ts` |
| Sem `GEMINI_API_KEY`, o falso assume e o app sobe | Aprovado | `intelligence.module.ts`; teste de recusa do adaptador real |
| Teto diário por titular com recusa educada | Aprovado | 21º pedido recusado; provedor não é chamado |
| Segunda pergunta igual: uma chamada ao provedor | Aprovado | Contador de chamadas no teste do cache |
| Cache invalidado quando o dado muda | Aprovado | Impressão dos dados na chave |
| Limite de espera e tentativas | Aprovado | Provedor travado devolve falha em 20 ms no teste |
| Falha tratada, nunca exceção | Aprovado | Adaptador que lança vira falha |
| Prompt sem identidade | Aprovado | Corpo enviado não contém o titular |
| Suítes verdes | Aprovado | 207 unitários, 13 de integração, 3 funcionais |

## Evidência de testes

Saída de `scripts/harness.sh gates`, em
`docs/tasks/HT-013/evidencia/20260908-213936-gates-verde.txt`:

```
 Test Files  38 passed (38)
      Tests  207 passed (207)
 Test Files  3 passed (3)
      Tests  13 passed (13)
  3 passed (6.1s)
Statements   : 98.05% ( 101/103 )
Branches     : 88.88% ( 48/54 )
  [OK]    nenhum segredo detectado
  [OK]    nenhuma vulnerabilidade conhecida
harness: gates concluídos
EXIT_CODE=0
```

Na ordem: unitário (38 arquivos, 207 testes — 30 novos nesta história),
integração contra o PostgreSQL do compose (13 testes, 5 novos), funcional em
Chromium, cobertura de `domain/` e as duas varreduras de segurança.

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unit` | 207 testes verdes | +30 desta história |
| Integração | `pnpm run test:integration` | 13 testes verdes | teto e cache no banco real |
| Funcional | `pnpm run test:functional` | 3 testes verdes | web real |
| Fronteiras | `pnpm run lint:boundaries` | verde | 245 módulos, 685 dependências |
| Segurança | `pnpm run security` | aprovada | gitleaks + osv-scanner |

## Refatoração feita após os funcionais verdes

O contador e o cache ganharam `limparTudo()` e `encerrar()` só para o teste de
integração, seguindo o que `HT-010` já fazia no repositório de lançamentos —
sem isso, cada execução herdaria a contagem da anterior e o teste do teto
passaria a depender da ordem.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 30 testes novos; teto, cache e resiliência provados sem rede |
| SRE | `sre-agent` | Aprovado | Custo tem teto explícito e padrão conservador; provedor fora não derruba a API |
| Segurança | `security-specialist-agent` | Aprovado | Chave fora do repositório e fora da URL; prompt sem identidade |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Contexto novo sob `ADR-001`; dependência recusada e registrada em `ADR-006` |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.21.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Sem LangChain e sem SDK | É uma chamada HTTP; `RNF-012` pesa contra a árvore transitiva | `ADR-006`; revisitar se surgir orquestração real |
| Políticas como decoradores | Dentro do adaptador, o falso não as teria e cada história da Fase 4 as reinventaria | Vale para qualquer provedor futuro |
| Ordem `Capped -> Cached -> Resilient` | Quem está acima da cota não consome cache nem rede; acerto de cache não paga espera | Ordem documentada no módulo |
| Uso só é contado quando o provedor responde | Cobrar cota por falha puniria a pessoa por problema que não é dela | — |
| Falha não entra no cache | Guardaria uma indisponibilidade de segundos como resposta permanente | — |
| Teto em UTC | Fuso local moveria a virada de máquina para máquina | Testado na virada do dia |
| Teto inválido cai no padrão | `AI_DAILY_LIMIT=abacaxi` não pode virar "sem teto" | Testado |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Saída do modelo ainda não validada | É o escopo de `HT-014` (`RNF-017`) | História `HT-014` |
| Nenhuma tela consome a porta | A primeira será `HN-004` | Kanban, Fase 4 |
| Cache sem expiração | A chave já invalida por dado; expiração por tempo só faria sentido com custo de armazenamento real | Revisitar em `HT-015` |
| Teto não é configurável por pessoa | A PoC tem um teto só, igual para todos | `HN-009` se precisar diferenciar |

## Verificação de fechamento

- [x] Testes e gates aplicáveis verdes
- [x] Commit semântico contém a chave `HT-013`
- [x] Commit não contém arquivos de outra história
- [x] Tag `v0.21.0` aponta para o mesmo hash do commit
- [x] `KANBAN-OFICIAL.md` atualizado
