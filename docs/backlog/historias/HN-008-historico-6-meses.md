---
name: hn-008-historico-6-meses
description: História de negócio — histórico dos últimos 6 meses por categoria (RF-016) e os três problemas orçamentários mais recorrentes, calculados dos meses fechados (RF-017).
document_type: story
story_key: HN-008
story_type: negocio
epic: EPIC-NEG-001
status: Em execução
max_lines: 300
---

# `HN-008` — Histórico de 6 meses e problemas recorrentes

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Em execução**
- **Requisitos:** `RF-016`, `RF-017` · `RN-022`, `RN-023`, `RN-001`
- **Depende de:** `HN-007` (semáforo), `HN-006` (limites)
- **Versão prevista:** `v0.28.0`

## Narrativa

> Como **Rita**, pessoa com renda variável,
> quero **ver o histórico de 6 meses e quais problemas se repetem**
> para **prever o mês ruim antes de ele acontecer**.

## Contexto

`HN-007` deu o semáforo do mês corrente; `HN-006` os limites. Falta o olhar
para trás: os meses fechados (até 6, `RN-022`) com gasto e faixa por categoria,
e o **ranking dos três problemas mais recorrentes** — calculado dos dados, nunca
da IA (`RN-023`).

## Critérios de aceite

```gherkin
Cenário: histórico dos últimos 6 meses por categoria
  Dado transações e limites de meses fechados
  Quando o histórico é consultado
  Então cada mês fechado traz, por categoria, gasto, limite e faixa atingida (RF-016)
  E a janela é de no máximo 6 meses fechados (RN-022)
  E uma conta com 2 meses mostra 2, sem erro (RN-022)
```

```gherkin
Cenário: ranking dos três problemas mais recorrentes
  Dado meses fechados com categorias que estouraram o limite (vermelha)
  Quando o ranking é calculado
  Então as três categorias mais recorrentes em vermelho aparecem (RF-017)
  E o cálculo vem dos dados, nunca do modelo de IA (RN-023)
  E empate é desempatado pelo maior valor absoluto (RN-023)
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-022` | Janela de até 6 meses fechados (exclui o corrente) |
| `RN-023` | Ranking calculado dos dados; empate por maior valor absoluto |
| `RN-001` | Faixa de cada mês pela mesma regra do semáforo |

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-019` | Domínio testável | RN-022/023 testadas sem banco |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| `budget` | Estende | Caso de uso de histórico + ranking |
| Contract | Novo DTO | `BudgetHistoryDTO` |

## Fora de escopo

- UI real do histórico (via `HT-018`)
- Geração de ranking por IA (proibido — RN-023)

## Gates aplicáveis

QA (RN-022/023), Segurança (RN-015), SRE, Arquitetura, Revisão final.

## Definição de pronto

- [ ] Cenários BDD antes do código e verdes
- [ ] `docs/entregas/ENTREGA-HN-008-historico-6-meses.md`
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-008` e tag `v0.28.0`