---
name: hn-003-painel-consolidado
description: História de negócio — painel consolidado de saldos, cartões e lançamentos, com os dados sincronizados persistidos e regras financeiras no domínio.
document_type: story
story_key: HN-003
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-003` — Painel consolidado de saldos, cartões e lançamentos

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda**
- **Requisitos:** `RF-008`, `RF-009` · `RN-006`, `RN-007`, `RN-008`, `RN-009`, `RN-015`
- **Depende de:** `HN-002` (consentimento + sync), `HT-017` (contrato)
- **Versão prevista:** `v0.19.0`

## Narrativa

> Como **Marina**, pessoa sem educação financeira formal,
> quero **ver meu total real, meus cartões e meus lançamentos num só painel**
> para **saber quanto tenho e para onde o dinheiro foi**.

## Contexto

`HN-002` cria o consentimento e sincroniza com o agregador, mas os dados
buscados **ainda não são persistidos** (o sync devolve e descarta). Esta história
persiste contas e lançamentos sincronizados (com deduplicação) e entrega o
**resumo consolidado** que a UI (`MetricsCards`, `SpendingChart`,
`TransactionsListView`) vai consumir — a fronteira `data/` do frontend já está
pronta para receber a API real.

## Critérios de aceite

```gherkin
Cenário: a sincronização persiste lançamentos sem duplicar
  Dado um consentimento ativo com uma sincronização já feita
  Quando a sincronização roda de novo
  Então lançamentos com o mesmo identificador externo não duplicam (RN-008)
```

```gherkin
Cenário: lançamento estornado não conta no gasto
  Dado um lançamento e seu estorno no mesmo período
  Quando o resumo do mês é calculado
  Então o par se anula e não entra no gasto (RN-007)
```

```gherkin
Cenário: saldo total soma contas ativas e cartão entra como fatura
  Dado contas correntes, poupanças e um cartão de crédito
  Quando o resumo consolidado é pedido
  Então o saldo total é a soma das contas ativas (RN-009)
  E a fatura do cartão aparece separada, nunca somada ao saldo (RN-009)
```

```gherkin
Cenário: lançamentos do mês são listados com valores em centavos
  Dado lançamentos no mês de referência
  Quando a lista é pedida
  Então retorna ordenada por data, com valores em centavos (RF-009, RN-006)
  E nada de outra pessoa aparece (RN-015)
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-006` | Valores em centavos, arredondamento só na apresentação |
| `RN-007` | Estorno anula o lançamento original no gasto |
| `RN-008` | Duplicidade por identificador externo (instituição + data + valor) |
| `RN-009` | Saldo total = soma das contas ativas; cartão é fatura, nunca soma |
| `RN-015` | Tudo isolado por titular |

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-019` | Domínio testável | Regras de saldo/estorno no domínio, testadas sem banco |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| `transactions` | Estende | `externalId` no modelo (dedup), persistência das contas externas, resumo consolidado |
| `consent` | Estende | `SyncInstitution` passa a persistir os dados do agregador |
| Contract | Novo DTO | `ConsolidatedSummaryDTO` |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Duplicar lançamentos | Dedup por identificador externo (RN-008) | Repersistir com a regra |
| Saldo errado ao misturar cartão | RN-009 com tipo separado | Corrigir a composição |

## Fora de escopo

- Descrição legível e categorização (são `HN-004`/`HN-005`)
- Trocar o `FakeSource` do frontend pela API real (última milha da UI, registrada na dívida)
- Orçamento semáforo (é `HN-007`)

## Gates aplicáveis

QA (regras RN-006..009), Segurança (isolamento RN-015), SRE (persistência), Arquitetura (domínio), Revisão final.

## Definição de pronto

- [ ] Cenários BDD antes do código e verdes
- [ ] Testes unitários por RN
- [ ] Gates com evidência
- [ ] `docs/entregas/ENTREGA-HN-003-painel-consolidado.md`
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-003` e tag `v0.19.0`