---
name: entrega-hn-006
description: Documento de entrega do limite mensal por categoria — persistido por titular, mês e categoria, com ausência distinta de zero.
document_type: delivery
story_key: HN-006
version: v0.25.0
max_lines: 300
---

# ENTREGA — `HN-006` — Definir e editar limite mensal por categoria

- **Data:** 2026-09-09
- **Tipo:** Negócio
- **Versão:** `v0.25.0`
- **Commit:** `<hash do commit de fechamento>`
- **Tag:** `v0.25.0` → `<hash do commit de fechamento>`

## O que foi entregue

- **O contexto `budget` ganhou o hexágono completo.** Até aqui ele tinha só a
  regra de faixa (`faixaDoSemaforo`, de `HT-017`); agora tem modelo, porta,
  casos de uso, adaptadores e borda HTTP.
- **`domain/model/monthly-limit.ts`** — o limite como valor: chave
  (titular, mês, categoria), validação do mês em `AAAA-MM` e do valor em
  centavos inteiros, com teto contra erro de digitação.
- **Três casos de uso**: `SetMonthlyLimit` (define e substitui),
  `RemoveMonthlyLimit` (volta ao estado sem limite) e `ListMonthlyLimits`
  (só do titular).
- **`BudgetRepository`** com adaptador Prisma (tabela `monthly_budgets`, chave
  primária composta) e adaptador em memória.
- **Três endpoints**, documentados na spec OpenAPI e protegidos por Bearer:
  `GET /budgets/:month`, `PUT /budgets/:month/:category` e
  `DELETE /budgets/:month/:category`.
- **`MonthlyLimitDTO` e `DefinirLimiteDTO`** no contrato, em centavos (`RN-006`).

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-013` — definir e editar o limite | `PUT` grava e substitui pela chave composta | `curl` e teste de integração |
| `RN-002` — sem limite não há faixa | `DELETE` apaga a linha; ausência é diferente de zero | Teste de integração e unitário |
| `RN-006` — valor em centavos inteiros | Validação recusa fracionário, negativo e acima do teto | `monthly-limit.test.ts` |
| `RN-015` — barreira por titular | Titular na chave e em toda consulta | Teste de integração com dois titulares |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `PUT` grava o limite do titular | Aprovado | HTTP 200 e leitura seguinte |
| `DELETE` volta ao estado sem limite | Aprovado | HTTP 204; lista vazia; segundo `DELETE` responde 404 |
| `GET` lista só o titular | Aprovado | Teste de integração com dois titulares |
| Definir de novo substitui, sem duplicar | Aprovado | Uma linha, valor atualizado |
| Valor inválido responde 400 sem gravar | Aprovado | Negativo, fracionário e acima do teto |
| Mês e categoria inválidos respondem 400 | Aprovado | `2026-13` e `viagens` |
| Limite não vaza entre titulares | Aprovado | Teste de integração no PostgreSQL |
| Limite em centavos no contrato | Aprovado | `MonthlyLimitDTO` |
| Suítes verdes | Aprovado | 293 unitários, 22 de integração, 3 funcionais |

## Evidência de verificação

Saída real da API, em `docs/tasks/HN-006/evidencia/20260909-api-limites.txt`:

```
# definir limite (RF-013)
PUT /budgets/2026-01/alimentacao {"limiteEmCents":80000} -> 200
GET /budgets/2026-01 -> {"estado":"ok","dados":[{"month":"2026-01","category":"alimentacao","limiteEmCents":80000}]}
# substituir, nao duplicar
GET /budgets/2026-01 -> {"estado":"ok","dados":[{"month":"2026-01","category":"alimentacao","limiteEmCents":95000}]}
# validacoes
mes invalido (2026-13) -> 400
categoria fora do catalogo -> 400
valor negativo -> 400
sem token -> 401

# remover volta ao estado sem limite (RN-002)
DELETE /budgets/2026-01/alimentacao -> 204
GET /budgets/2026-01 -> {"estado":"ok","dados":[]}
DELETE de novo -> 404
```

## Evidência de testes

Saída de `scripts/harness.sh gates`, em
`docs/tasks/HN-006/evidencia/20260909-003042-gates-verde.txt`:

```
 Test Files  50 passed (50)
      Tests  293 passed (293)
 Test Files  4 passed (4)
      Tests  22 passed (22)
  3 passed (6.9s)
Statements   : 96.63% ( 201/208 )
Branches     : 88.88% ( 112/126 )
  [OK]    nenhum segredo detectado
  [OK]    nenhuma vulnerabilidade conhecida
harness: gates concluídos
EXIT_CODE=0
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unit` | 293 testes verdes | +21 desta história |
| Integração | `pnpm run test:integration` | 22 testes verdes | +6, incluindo `RN-015` |
| Funcional | `pnpm run test:functional` | 3 testes verdes | web real |
| Fronteiras | `pnpm run lint:boundaries` | verde | 282 módulos, 802 dependências |
| Segurança | `pnpm run security` | aprovada | gitleaks + osv-scanner |

## Refatoração feita após os funcionais verdes

O teste de aplicação começou importando o adaptador em memória e o
`lint:boundaries` reprovou — `application/` não pode conhecer `infrastructure/`.
O fake passou a ser construído a partir da própria porta, dentro do teste, com a
mesma chave do banco. É a terceira vez que esse gate pega o mesmo atalho
(`HT-009`, `HT-017` e agora aqui), e é exatamente para isso que ele existe.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 21 testes novos; valores de fronteira e `RN-002` cobertos |
| SRE | `sre-agent` | Aprovado | Tabela nova com chave composta; três endpoints documentados |
| Segurança | `security-specialist-agent` | Aprovado | Guarda própria no contexto; titular sempre do token |
| Arquitetura | `architect-reviewer-agent` | Aprovado | `budget` completo sob `ADR-001`; catálogo reaproveitado de `transactions` |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.25.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Mês como valor explícito na chave | Derivar do relógio faria o mesmo `PUT` cair em meses diferentes conforme o fuso | `HN-007` e `HN-008` leem por mês |
| Ausência de linha é "sem limite"; zero é limite | `RN-002` contra `RN-001`: zero deixaria a categoria vermelha no primeiro centavo | Testado nos dois sentidos |
| Catálogo de categorias reaproveitado de `transactions` | Duas listas divergiriam na primeira categoria nova | — |
| Identidade reaproveita o `TokenIdentity` de `HN-001` | Duplicar a leitura do token criaria dois pontos para divergir | Padrão para o próximo contexto com rota autenticada |
| Teto de um trilhão de centavos | Valor absurdo é erro de digitação, não intenção | — |
| `DELETE` responde 404 quando não havia limite | Distinguir "removi" de "não havia" é informação útil para a tela | — |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| A `CategoryCard` continua editando o limite só em memória | A tela de despesas ainda lê os mocks; ligá-la é escopo de `HT-018` | Aqui e no kanban, junto com a dívida de `HN-004` e `HN-005` |
| Sem cópia de limites entre meses | Fora de escopo; cada mês é uma decisão | Aqui |
| Sem sugestão automática de limite | Depende do histórico de `HN-008` | `HN-008` |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-006`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.25.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado
