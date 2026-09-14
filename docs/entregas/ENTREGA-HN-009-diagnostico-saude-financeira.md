---
name: entrega-hn-009
description: Documento de entrega da HN-009 — diagnóstico de saúde financeira a partir dos dados consolidados, com a guarda de saída da IA e degradação quando o provedor falha.
document_type: delivery
story_key: HN-009
version: v0.29.0
max_lines: 300
---

# ENTREGA — `HN-009` — Diagnóstico de saúde financeira

- **Data:** 2026-09-09
- **Tipo:** Negócio
- **Versão:** `v0.29.0`
- **Commit:** `00ae8745006660dc159ac8fc52cc4381519c933a`
- **Tag:** `v0.29.0` → `00ae8745006660dc159ac8fc52cc4381519c933a`

## O que foi entregue

- **Diagnóstico (RF-018)**: `GET /budgets/diagnosis` gera um diagnóstico de saúde
  financeira a partir dos dados consolidados (meses fechados com gasto/limite/
  faixa por categoria). O modelo recebe **só os números** (RN-019) e a guarda de
  saída (`HT-014`) valida o texto antes de responder.
- **Dado mínimo (RN-020)**: sem ao menos um mês fechado com lançamentos, o
  endpoint responde `dados-insuficientes` — conta recém-conectada não é
  diagnosticada.
- **Degradação (RN-021)**: provedor indisponível, resposta bloqueada ou teto
  diário atingido viram **resultado estruturado** (nunca erro/esvaziar tela).

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-018` — diagnóstico a partir dos dados consolidados | Caso de uso monta os números e chama o `AiAdvisor` | testes + API |
| `RN-020` — dado mínimo | Sem mês fechado com lançamentos → `dados-insuficientes` | teste |
| `RN-019` — número vem dos dados, IA só interpreta | Payload sem identidade; guarda de saída bloqueia valor divergente | teste (payload) + `HT-014` |
| `RN-021` — falha do provedor degrada | `ia-indisponivel` / `teto-atingido` / `ia-bloqueou` | testes |
| `RN-017` — sem recomendação de produto | Garantido pela guarda de saída (`HT-014`) | `output-guard.test.ts` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Diagnóstico cita números que existem no painel | Aprovado | payload só com `spentInCents`/`limitInCents` |
| Sem mês fechado → sem diagnóstico | Aprovado | teste RN-020 |
| Provedor fora → painel continua | Aprovado | teste RN-021 (estado estruturado) |

## Evidência de verificação

```
$ curl GET /budgets/diagnosis -H "Bearer <token>"
  → {"estado":"dados-insuficientes"}
```

(Seed sem lançamentos nos meses fechados atuais — comportamento correto de
RN-020; o fluxo completo com texto é coberto pelos testes unit com `FakeAdvisor`.)

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  53 passed (53)   Tests  304 passed (304)

$ pnpm run test:integration
 Test Files  4 passed (4)     Tests  22 passed (22)

$ pnpm run test:functional
 3 passed

$ pnpm run lint:boundaries
✔ no dependency violations found

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Refatoração feita após os funcionais verdes

Nenhuma. O caso de uso reutiliza o helper compartilhado `por-categoria-do-mes`
(da HN-008) para montar os números — a fonte da faixa é única.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | RN-019/020/021 provadas com teste; payload inspecionado |
| Segurança | `open-finance-security-agent` | Aprovado | IA sem identidade (RNF-015); guarda RN-017/019 |
| SRE | `sre-agent` | Aprovado | API sobe; build e integração verdes; degradação estruturada |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Regra no domínio; fronteiras intactas; usa portas da IA |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.29.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Caso de uso no contexto `budget` | Os números nascem do orçamento; o `IntelligenceModule` é só a porta da IA | Diagnóstico segue a fonte da faixa |
| Endpoint no `BudgetController` | Reaproveita a guarda de autenticação e o titular | Uma tela para orçamento+diagnóstico |
| Fases de falha como `estado` | RN-021 (nunca esvaziar a tela) | UI renderiza estado com aviso |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| UI real do diagnóstico + aviso RN-018 | Integração via `HT-018` | Kanban |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-009`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.29.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado