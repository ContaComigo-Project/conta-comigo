---
name: entrega-ht-018
description: Documento de entrega da HT-018 — parte 1 do fechamento da fronteira: as superfícies de IA, exportação e o overview do dashboard passam a consumir o backend real; mocks de regra removidos.
document_type: delivery
story_key: HT-018
version: v0.32.0
max_lines: 300
---

# ENTREGA — `HT-018` — Fechamento da fronteira (parte 1)

- **Data:** 2026-09-09
- **Tipo:** Técnica
- **Versão:** `v0.32.0`
- **Commit:** `daa579e95e3749da883143ed90459e56e15add27`
- **Tag:** `v0.32.0` → `daa579e95e3749da883143ed90459e56e15add27`

## O que foi entregue

Fechamento da fronteira que `HT-017` abriu: o frontend deixa de calcular regra
de domínio e passa a consumir o backend real nas superfícies de IA, exportação
e no overview.

| Superfície | Antes (mock) | Depois (real) |
| --- | --- | --- |
| `AIChatWidget` | `generateMockReply` + cards locais | `POST /intelligence/chat` (resposta + aviso RN-018) |
| `AIInsightPanel` | `mockAIInsights` (3 fixos, rotação) | `GET /budgets/diagnosis` + degradação (RN-021) |
| `ExportDropdown` | botões sem download | `GET /transactions/export.csv` e `GET /budgets/report.pdf` (blob) |
| `BudgetAtAGlance` | `resolveStatus` (70/90) no frontend | `GET /budgets/semaphore?month=` com `band` pronta (RN-001) |
| `RecentActivity` | `mockTransactions` | `GET /transactions` + mapper |
| `ApiSource` | 4 métodos | 12 métodos (semaphore, history, diagnosis, chat, simulation, exports, limites) |

## Regra removida do frontend

- `resolveStatus`, `BUDGET_RULES` (70/90), `generateMockReply`, agregação de
  budget, simulador de compra e parser de valor — todos viviam no frontend e
  saem das superfícies conectadas. A faixa, o ranking e o diagnóstico agora vêm
  prontos do backend (RN-001, RN-019, RN-023).
- Removidos os mocks mortos: `chat.mock.ts` e `ai-insights.mock.ts`.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-020/RF-021` | Chat real; aviso RN-018 permanente no widget | código + API |
| `RF-023/RF-024` | Exportações geram arquivo real | código (blob) + API |
| `RF-022` | `POST /budgets/simulation` disponível ao front | `ApiSource.simularCompra` |
| `RN-001/RN-019` | Faixa e diagnóstico vindos do backend | sem limiar no frontend |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `AIChatWidget` responde via backend | Aprovado | `ApiSource.perguntarNoChat` |
| Aviso RN-018 presente em toda superfície de IA | Aprovado | widget + painel |
| Exportações baixam arquivo | Aprovado | blob + `Content-Disposition` do backend |
| Semáforo do overview vem pronto | Aprovado | `BudgetAtAGlance` sem `resolveStatus` |
| Busca por limiares no frontend não retorna regra | Aprovado (superfícies conectadas) | grep nas superfícies tocadas |

## Evidência de verificação

```
$ pnpm --filter client-contacomigo build
✓ built (tsc -b && vite build)

$ pnpm run test:unit        → 314 passed
$ pnpm run test:integration → 22 passed
$ pnpm run test:functional  → 3 passed (Playwright, tela real)
$ pnpm run build            → ✓ built
$ pnpm run lint:boundaries  → sem violações
$ auditar-repositorio.sh    → 100%
```

## Dívida assumida (parte 2 — fora desta entrega)

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Páginas de despesas (`Expenses`, `use-expenses-state`, `CategoryCard`, `HistoricalOverview`) ainda consomem `budget.mock`/`MONTHS` | Migrar para semáforo/histórico/limites reais é uma segunda fase | Kanban (nota na `HT-018`) |
| `SpendingChart` ainda com `mockSpendingCategories` | Backend não expõe categorias de gasto ainda | Kanban + `ApiSource.listarCategoriasDeGasto` (stub) |
| `WelcomeHeader`/`Sidebar` status de sincronização fixo | Depende do consentimento expor status | Kanban |

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Functional verde; build frontend; fluxos reais |
| Segurança | `open-finance-security-agent` | Aprovado | Só token Bearer; aviso RN-018 em toda superfície |
| SRE | `sre-agent` | Aprovado | Downloads via blob; degradação tratada |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Regra sai do frontend; fronteira `DataSource` respeitada |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.32.0`) |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HT-018`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.32.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado