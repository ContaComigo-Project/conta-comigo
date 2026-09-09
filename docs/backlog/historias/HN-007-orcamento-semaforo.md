---
name: hn-007-orcamento-semaforo
description: História de negócio — semáforo do orçamento por categoria (RN-001) e aviso ao cruzar faixa, único por faixa por categoria por mês (RN-005).
document_type: story
story_key: HN-007
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-007` — Orçamento semáforo e aviso ao cruzar faixa

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda**
- **Requisitos:** `RF-014`, `RF-015` · `RN-001`, `RN-002`, `RN-003`, `RN-005`
- **Depende de:** `HN-006` (limite), `HN-003` (transações persistidas)
- **Versão prevista:** `v0.27.0`

## Narrativa

> Como **Marina**, pessoa que controla o orçamento de cabeça,
> quero **ver a faixa do semáforo de cada categoria e ser avisada quando ela
> cruza 70% e 90% do limite**
> para **ajustar o gasto antes do fim do mês**.

## Contexto

`HN-006` deu o limite mensal por categoria (persistido); `HN-003` os lançamentos
do mês. A regra da faixa (`faixaDoSemaforo`, RN-001) já existe no domínio. Falta
o que a une: o **semáforo por categoria no mês** (RF-014) e o **aviso de
cruzamento** (RF-015) — que deve ocorrer **uma única vez por faixa, por
categoria, por mês** (RN-005), então precisa ser registrado, não só calculado.

## Critérios de aceite

```gherkin
Cenário: faixa do semáforo por categoria no mês corrente
  Dado uma categoria com limite e gastos no mês de referência
  Quando o semáforo é consultado
  Então cada categoria retorna a faixa exata de RN-001 (verde ≤70%, amarela ≤90%, vermelha >90%)
  E categoria sem limite retorna "sem-limite" (RN-002)
```

```gherkin
Cenário: aviso único por faixa por categoria por mês
  Dado uma categoria cujo gasto cruza a faixa amarela (70%)
  Quando o semáforo é avaliado de novo
  Então o aviso de "amarela" é emitido uma única vez naquele mês (RN-005)
  E cruzar de novo (gasto oscila) não gera segundo aviso da mesma faixa
```

```gherkin
Cenário: aviso da faixa vermelha é separado da amarela
  Dado uma categoria que cruza 70% e depois 90% no mesmo mês
  Quando o semáforo é avaliado
  Então há um aviso de "amarela" e um de "vermelha" (RN-005: uma por faixa)
```

```gherkin
Cenário: tudo isolado por titular
  Dado limites e avisos de outro titular
  Quando o semáforo é consultado
  Então nenhum dado de outra pessoa aparece (RN-015)
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-001` | Faixa calculada com comparação exata em inteiros (sem arredondar) |
| `RN-002` | Sem limite → "sem-limite", nunca verde |
| `RN-003` | Mês de referência do gasto pelo fuso de São Paulo |
| `RN-005` | Aviso persistido; máximo um por faixa por categoria por mês |

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-019` | Domínio testável | RN-001/002/005 testadas sem banco |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| `budget` | Estende | Caso de uso de semáforo + avisos; tabela de avisos |
| `transactions` | Lê | Gasto do mês por categoria (dados já persistidos) |
| Contract | Novo DTO | `BudgetSemaphoreDTO` (categorias com faixa + avisos) |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Aviso repetido | RN-005 com registro persistido | Remover o registro do aviso |
| Faixa errada na fronteira | `faixaDoSemaforo` com inteiros | Corrigir a regra |

## Fora de escopo

- Histórico de 6 meses e problemas recorrentes (é `HN-008`)
- UI real do semáforo (integração da tela via `HT-018`)

## Gates aplicáveis

QA (RN-001/002/005), Segurança (RN-015), SRE, Arquitetura (domínio), Revisão final.

## Definição de pronto

- [ ] Cenários BDD antes do código e verdes
- [ ] Testes unitários por RN
- [ ] `docs/entregas/ENTREGA-HN-007-orcamento-semaforo.md`
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-007` e tag `v0.27.0`