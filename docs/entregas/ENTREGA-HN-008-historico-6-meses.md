---
name: entrega-hn-008
description: Documento de entrega da HN-008 — histórico de 6 meses por categoria e os três problemas orçamentários mais recorrentes, calculados dos dados.
document_type: delivery
story_key: HN-008
version: v0.28.0
max_lines: 300
---

# ENTREGA — `HN-008` — Histórico de 6 meses e problemas recorrentes

- **Data:** 2026-09-09
- **Tipo:** Negócio
- **Versão:** `v0.28.0`
- **Commit:** `f2e066e9788ea44f8b7d1879f0beb727fd9e20a2`
- **Tag:** `v0.28.0` → `f2e066e9788ea44f8b7d1879f0beb727fd9e20a2`

## O que foi entregue

- **Histórico (RF-016 / RN-022)**: `GET /budgets/history` retorna, para cada mês
  fechado (até 6, excluindo o corrente), por categoria: gasto, limite e faixa
  (RN-001). Mês sem nenhuma categoria não entra — uma conta com 2 meses mostra 2.
- **Problemas recorrentes (RF-017 / RN-023)**: ranking dos três problemas mais
  recorrentes — categorias que estouraram o limite (vermelha) em mais meses,
  desempatadas pelo **maior valor absoluto do excesso**. Calculado dos dados,
  **nunca pelo modelo de IA**.
- Gasto por categoria via helper compartilhado (`por-categoria-do-mes`) para o
  histórico e o semáforo nunca divergirem.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-016` — histórico de 6 meses | `GET /budgets/history` com meses fechados | testes + API |
| `RF-017` — três problemas mais recorrentes | Ranking top 3 calculado | testes |
| `RN-022` | Janela ≤ 6 meses fechados; 2 meses → 2 | teste |
| `RN-023` | Ranking dos dados; desempate por maior valor absoluto | teste |
| `RN-001` | Faixa de cada mês pela regra do semáforo | helper compartilhado |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Meses fechados com gasto/limite/faixa | Aprovado | `get-budget-history.test.ts` |
| Janela máx 6; 2 meses mostra 2 | Aprovado | teste RN-022 |
| Top 3 mais recorrentes | Aprovado | teste RN-023 |
| Desempate por maior valor absoluto | Aprovado | teste (moradia vence lazer) |
| Cálculo dos dados, nunca IA | Aprovado | caso de uso (nenhum provedor de IA) |

## Evidência de verificação

```
$ curl GET /budgets/history -H "Bearer <token>"
  → {"meses":[],"problemas":[]}
```

(Meses fechados atuais sem dados no seed — comportamento correto de RN-022.)

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  52 passed (52)   Tests  300 passed (300)

$ pnpm run test:integration
 Test Files  4 passed (4)     Tests  22 passed (22)

$ pnpm run test:functional
 3 passed

$ pnpm run lint:boundaries
✔ no dependency violations found

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Refatoração feita após os funcionais verdes

Foi corrigido um bug de bootstrap: o `BudgetModule` precisava do `TOKENS.Clock`,
que o `TransactionsModule` não exportava — a API não subia. Adicionado o `Clock`
aos exports do módulo. O gasto por categoria foi extraído para o helper
compartilhado `por-categoria-do-mes.ts`.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | RN-022/023 provadas com teste; ranking com desempate |
| Segurança | `open-finance-security-agent` | Aprovado | Isolamento por titular (RN-015); ranking sem dado pessoal |
| SRE | `sre-agent` | Aprovado | API sobe; build e integração verdes |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Regra no domínio; helper compartilhado; fronteiras intactas |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.28.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Meses vazios não entram no histórico | RN-022 ("2 meses mostra 2") | UI mostra só o que existe |
| Desempate por excesso (gasto-limite) | RN-023 "maior valor absoluto" | Ranking determinístico |
| Helper compartilhado de cálculo mensal | Histórico e semáforo nunca divergem | Fonte única da faixa |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| UI real do histórico (tela) | Integração via `HT-018` | Kanban |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-008`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.28.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado