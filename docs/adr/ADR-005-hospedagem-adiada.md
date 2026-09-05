---
name: adr-005-hospedagem-adiada
description: Decisão de adiar a escolha de hospedagem de homologação/produção e focar o ambiente de desenvolvimento local reprodutível primeiro.
document_type: adr
adr_key: ADR-005
status: Aceita
applies_when:
  - decidir onde publicar a PoC
  - preparar ambiente de desenvolvimento
max_lines: 300
---

# ADR-005 — Hospedagem adiada: dev local primeiro

- **Status:** Aceita
- **Data:** 2026-09-05
- **História:** `HT-004` (registro) · decisão de provedores em `HT-015`
- **Decidido por:** time do ContaComigo

## Contexto

O kanban elencava a hospedagem entre as decisões de `HT-004`. O time decidiu
**não escolher provedores de homologação/produção agora** e concentrar o esforço
no **ambiente de desenvolvimento local reproduzível** (`HT-005`): um comando por
tarefa, o mesmo na máquina de todo mundo e depois no CI (`RNF-007`).

Motivos objetivos:

1. **Nada existe para hospedar ainda.** Não há backend, banco nem contrato;
   publicar antes de `HT-009`/`HT-010` seria jogar infra no vazio.
2. **O free tier muda.** Os termos de Render/Neon/Vercel já mudaram uma vez na
   vida deste projeto; fixar provedor em ADR agora é comprometer uma decisão com
   validade de meses para uma data que ainda não existe.
3. **Homologação/produção só faz sentido depois do contrato (`HT-017`) e da
   fronteira fechada (`HT-018`).** Até lá, qualquer endereço público seria
   apenas um espelho do frontend com mocks.

## Alternativas consideradas

### A — Vercel + Render + Neon

| | |
| --- | --- |
| Como funciona | Web estática na Vercel (free), API NestJS na Render (free, hiberna em idle), Postgres serverless no Neon (free tier) |
| A favor | Custo zero real; cada peça é líder no seu nicho |
| Contra | Três provedores para operar; free tiers sujeitos a mudança; Render hiberna (cold start) |

### B — Railway (tudo-em-um)

| | |
| --- | --- |
| Como funciona | Um provedor para web, API e banco |
| A favor | Um painel só |
| Contra | Free tier com limite de horas mensais; risco de `RNF-011` (R$ 0 recorrente) em uso contínuo |

### C — Netlify + Fly.io

| | |
| --- | --- |
| Como funciona | Web na Netlify, API e Postgres no Fly.io com free allowance |
| A favor | Bom custo em volume baixo |
| Contra | Mais peças para operar; allowance do Fly.io exige monitoramento de consumo |

### D — Adiar a decisão — **escolhida**

Nenhuma das alternativas acima é escolhida **agora**. `HT-015` revisita as três
opções com dados reais: volume esperado da validação simulada, termos vigentes
de free tier na data e tamanho do artefato de publicação. O critério imutável
fica registrado aqui: **R$ 0 recorrente** (`RNF-011`).

## Decisão

A escolha de hospedagem de homologação/produção é **adiada para `HT-015`**.
O foco atual é o ambiente de desenvolvimento local reprodutível (`HT-005`), que
sobe PostgreSQL por docker compose e roda todos os gates no harness.

Regras concretas que derivam da escolha:

1. **`HT-015` é o ponto de decisão dos provedores**, com o critério fixo de
   custo zero recorrente (`RNF-011`) e reavaliação dos free tiers vigentes.
2. **Até `HT-015`, nenhuma infraestrutura de homologação/produção é contratada.**
   Nenhuma credencial de provedor entra no repositório (inclusive nas fases
   iniciais, já vale a regra de `RNF-012`).
3. **O ambiente de dev é o contrato mínimo de reprodutibilidade** (`RNF-007`):
   o que roda localmente roda no CI. O CI nasce em `HT-007` apontando para o
   mesmo harness.
4. **A web continua rodando só com mocks** até `HT-017`, sem pretensão de
   endereço público.

## Consequências

**O que ganhamos:**

- Foco no que destrava a fila: dev local primeiro, CI depois (`HT-007`).
- Decisão de provedor tomada com dados válidos na data (`HT-015`), não com
  termos de hoje.
- `RNF-011` preservado por construção: nada contratado, nada a estourar.

**O que perdemos:**

- Um endereço de homologação público durante o desenvolvimento — a validação
  simulada só tem como rodar local, até `HT-015`.

**O que passa a ser obrigatório:**

- `HT-015` decide os provedores explicitamente, comparando as três alternativas
  com termos vigentes.
- Enquanto isso, todo gate de operação (`sre-agent`) valida contra o ambiente
  local e o CI, não contra servidor de homologação.

## Como verificar que a decisão está sendo respeitada

```
scripts/harness.sh setup   # sobe ambiente local; nenhum provedor de prod envolvido
# Nenhuma credencial de Vercel/Render/Neon/Fly/Railway existe no repositório (RNF-012)
```

## Como reverter

Se o time precisar de um endereço de homologação antes de `HT-015`, abre uma
história nova (não escopo extra) que contrata a infra mínima da alternativa A
com reavaliação de custo. O ADR permanece válido até `HT-015` decidir.

## Requisitos relacionados

`RNF-007`, `RNF-011`, `RNF-012`