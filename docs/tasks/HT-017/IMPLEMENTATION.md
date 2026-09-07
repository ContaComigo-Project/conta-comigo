---
name: implementation-ht-017
description: Plano técnico do contrato de dados — pacote compartilhado com zod, envelope de resultado, faixa calculada no domínio, origem falsa na web e prova de equivalência com os mocks.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-017`

- **Requisitos ligados:** `RNF-020`, `RNF-005`; `RN-001`, `RN-006`, `RN-020`, `RN-021`
- **Versão prevista:** `v0.11.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

**Onde o contrato vive.** `packages/contrato` no workspace pnpm. É código de
transporte: web e API o importam, `domain/` **nunca** — o dependency-cruiser já
proíbe pacote em `domain/`, e a regra ganha um comentário dizendo isso de
propósito. `zod` (já dependência da web) dá esquema + tipo inferido de uma vez,
e validação na borda HTTP dos dois lados.

**O que entra e o que fica de fora.** Entra o que é dado ou regra: valores
como **inteiro em centavos** (`RN-006`; o mock traz `-34.90` e
`formattedAmount`), datas ISO, ids, categoria como **id + nome**, e a **faixa**
do orçamento já resolvida (`verde`/`amarela`/`vermelha`/`sem-limite`, `RN-001`
e `RN-002`). Fica de fora tudo que o inventário marcou como acidente visual:
`categoryIcon`, `bankColor`, `initials`, `barClass`, `formattedAmount`,
`formattedDate`. Esses viram **mapeadores na web** (`frontend/src/dados/
mapeadores.ts`): a formatação acontece na borda, como o inventário pediu.

**Envelope.** `Resultado<T> = { estado: 'ok', dados: T } | { estado: 'erro',
codigo, mensagem } | { estado: 'dados-insuficientes', motivo }`. `RN-021`
(IA cai, painel fica) e `RN-020` (diagnóstico exige um mês fechado) viram
estados de primeira classe, não `null` ambíguo.

**Faixa no domínio.** `RN-001` nasce em `backend/src/orcamento/domain/
faixa-do-semaforo.ts` — primeiro arquivo do contexto `orcamento`, com só essa
regra e seu teste. O contrato transporta `faixa` pronta; a tela nunca recalcula.

**Prova de que a UI não muda.** A web ganha a porta `OrigemDeDados` e a
`OrigemFalsa`, que entrega o contrato a partir da massa dos mocks. O teste de
equivalência aplica `mapeadores(OrigemFalsa)` e compara com o objeto que o mock
exporta hoje, campo a campo — se forem iguais, o componente que recebe um ou
outro renderiza igual sem ser tocado. Trocar os imports é `HT-018`.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Tipos duplicados em `frontend/` e `backend/` | Divergem em semanas; o contrato deixa de ser contrato |
| Gerar o contrato do Prisma/OpenAPI | Amarra o transporte ao modelo de persistência (`ADR-002` r.1 separa os dois) |
| Contrato com `formattedAmount` para não mexer em nada | Critério de aceite proíbe campo visual; `RN-006` exige número |
| Trocar imports dos componentes agora | É `HT-018`; aqui só se prova a equivalência |

## 3. Fronteiras e design

```
packages/contrato/src/
  resultado.ts      Resultado<T>: ok | erro | dados-insuficientes
  lancamento.ts     LancamentoDTO, ResumoDoMesDTO
  orcamento.ts      Faixa, CategoriaDeOrcamentoDTO
  banco.ts          BancoConectadoDTO (status: ativo | sincronizando | erro)
  categoria.ts      CategoriaDeGastoDTO
backend/src/orcamento/domain/faixa-do-semaforo.ts     RN-001 / RN-002
backend/src/lancamentos/infrastructure/http/          GET /lancamentos -> Resultado<LancamentoDTO[]>
frontend/src/dados/origem-de-dados.ts                 porta
frontend/src/dados/origem-falsa.ts                    mocks -> contrato
frontend/src/dados/mapeadores.ts                      contrato -> apresentacao (formatacao, cor, icone)
```

Regra de fronteira nova: `@contacomigo/contrato` é permitido em
`infrastructure/` e `application/`, proibido em `domain/` (já coberto pela
regra de pacotes; comentário explícito).

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Testes dos esquemas (aceita exemplo válido; rejeita `formattedAmount`; `Resultado` discrimina 3 estados) sobre esquemas stub | Vermelho por asserção |
| 2 | Esquemas reais | Verde |
| 3 | `RN-001` vermelho → verde no domínio | Cobertura do domínio continua ≥ 80% |
| 4 | Equivalência mock ≡ `mapeadores(OrigemFalsa)` vermelho → verde | Verde |
| 5 | Controller devolve `Resultado<LancamentoDTO[]>` validado pelo esquema | Verde |

| Cenário | Regra que prova | Arquivo |
| --- | --- | --- |
| 70% verde, 90% amarela, 90,01% vermelha, 0 verde, sem limite | `RN-001`, `RN-002` | `orcamento/domain/faixa-do-semaforo.test.ts` |
| Esquema rejeita campo visual | critério 2 | `packages/contrato/src/*.test.ts` |
| `Resultado` com 3 estados | `RN-020`, `RN-021` | `resultado.test.ts` |
| mock ≡ mapeado | critério 5 | `frontend/src/dados/equivalencia.test.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Vermelho registrado; equivalência campo a campo |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Sim | Contrato não expõe campo além do necessário; sem identidade real (`user.mock`) |
| Arquitetura | Sim | Contrato fora de `domain/`; faixa no domínio |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Mapeador reproduzir formatação `pt-BR` diferente do mock | Média | Teste de equivalência compara string a string |
| Cobertura do domínio cair com `orcamento` novo | Baixa | Regra nasce com teste |
| `zod` v4 no pacote vs web | Baixa | Mesma versão fixada (`4.3.6`) |

## 7. Plano de reversão

`git revert`; nada de componente foi alterado, então a UI não sente.

## 8. Fechamento

- Mensagem de commit prevista: `feat(contract): define the web-API data contract with a fake source (HT-017)`
- Tag prevista: `v0.11.0` — aguarda autorização humana
