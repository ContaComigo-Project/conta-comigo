---
name: entrega-hn-007
description: Documento de entrega da HN-007 — orçamento semáforo por categoria e aviso ao cruzar faixa, único por faixa por categoria por mês.
document_type: delivery
story_key: HN-007
version: v0.27.0
max_lines: 300
---

# ENTREGA — `HN-007` — Orçamento semáforo e aviso ao cruzar faixa

- **Data:** 2026-09-09
- **Tipo:** Negócio
- **Versão:** `v0.27.0`
- **Commit:** `ed5bbf14c41cd745458c71fcedf6575f9231bb38`
- **Tag:** `v0.27.0` → `ed5bbf14c41cd745458c71fcedf6575f9231bb38`

## O que foi entregue

- **Semáforo por categoria no mês (RF-014)**: `GET /budgets/semaphore?month=AAAA-MM`
  retorna, para cada categoria, o gasto do mês, o limite e a **faixa exata de
  `RN-001`** (verde ≤70%, amarela ≤90%, vermelha >90% — comparação em inteiros,
  sem arredondar). Categoria sem limite retorna `sem-limite` (`RN-002`).
- **Aviso ao cruzar faixa (RF-015 / RN-005)**: quando o gasto cruza 70% e/ou 90%,
  um aviso é **emitido no máximo uma vez por faixa por categoria por mês** e
  **persistido** (`BudgetAlert`). Se o gasto pula direto para a vermelha, emite
  o aviso amarelo e o vermelho.
- Gasto por categoria calculado a partir das transações persistidas (`HN-003`),
  no mês de referência (`RN-003`).
- Tabela `budget_alerts` (migração) e `BudgetSemaphoreDTO` no contrato.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-014` — faixa do semáforo por categoria | `GET /budgets/semaphore` com faixa exata | testes + API real |
| `RF-015` — avisar ao cruzar 70%/90% | Aviso persistido, uma vez por faixa | testes |
| `RN-001` | Faixa com comparação exata em inteiros | `get-budget-semaphore.test.ts` |
| `RN-002` | Sem limite → `sem-limite`, nunca verde | teste |
| `RN-005` | Aviso único por faixa por categoria por mês | teste |
| `RN-003` | Gasto no mês de referência (fuso SP) | caso de uso |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Faixa exata por categoria (RN-001) | Aprovado | teste (70% verde, 90,01% vermelha) |
| Sem limite → `sem-limite` (RN-002) | Aprovado | teste |
| Aviso único por faixa por categoria por mês (RN-005) | Aprovado | teste (não repete) |
| Faixa vermelha gera aviso separado da amarela | Aprovado | teste |
| Isolamento por titular (RN-015) | Aprovado | consultas sempre por holder |

## Evidência de verificação

```
$ curl "GET /budgets/semaphore?month=2026-09" -H "Bearer <token>"
  → {"month":"2026-09","categorias":[{"category":"moradia","limitInCents":1000000,
     "spentInCents":0,"percentage":0,"band":"verde"}],"alertas":[]}
```

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  51 passed (51)   Tests  297 passed (297)

$ pnpm run test:integration
 Test Files  4 passed (4)     Tests  22 passed (22)

$ pnpm run test:functional
 3 passed

$ pnpm run lint:boundaries
✔ no dependency violations found

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Refatoração feita após os funcionais verdes

Foi identificado e corrigido um **drift nas migrações** (as migrações das
`HN-004/005/006` existiam como arquivos mas nunca foram aplicadas ao banco). Com
autorização, foi feito `prisma migrate reset` (banco de desenvolvimento) — as 14
migrações foram reaplicadas na ordem e o `db:seed` repopulou os dados sintéticos.
A rota estática `/budgets/semaphore` foi colocada antes de `:month` para o
roteador não capturar a palavra como mês.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | RN-001/002/005 provadas com teste; RN-005 com persistência |
| Segurança | `open-finance-security-agent` | Aprovado | Isolamento por titular (RN-015); sem dado pessoal em alertas |
| SRE | `sre-agent` | Aprovado | Migração aplicada; banco sincronizado; build e integração verdes |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Regra no domínio; portas por token; fronteiras intactas |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.27.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Aviso persistido (tabela) | RN-005 não pode depender de memória | UI pode listar avisos depois |
| Emitir amarela+vermelha quando pula direto | Cruzou as duas faixas | Fiel ao RF-015 |
| `migrate reset` autorizado | Corrigir drift das migrações de HN-004/005/006 | Banco reaplicado + seed |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| UI real do semáforo (tela) | Integração via `HT-018` | Kanban |
| Migrações da HN-004/005/006 nunca aplicadas | Processo de execução anterior | Corrigido com reset; registro no progress |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-007`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.27.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado