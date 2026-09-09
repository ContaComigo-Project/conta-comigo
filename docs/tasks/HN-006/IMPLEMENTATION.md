---
name: implementation-hn-006
description: Plano técnico de HN-006 — limite mensal por titular, mês e categoria, com ausência distinta de zero.
document_type: implementation_plan
applies_when:
  - implementar a história HN-006
max_lines: 300
---

# IMPLEMENTATION — `HN-006`

- **Requisitos ligados:** `RF-013`, `RN-002`, `RN-006`, `RN-015`
- **Versão prevista:** `v0.25.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

O contexto `budget` hoje só tem a regra de faixa (`faixaDoSemaforo`, de
`HT-017`). Esta história dá a ele o resto do hexágono: modelo, porta, casos de
uso, adaptadores e borda HTTP.

A chave é **(titular, mês, categoria)**, e o mês entra como valor explícito
(`2026-01`), não derivado da data do servidor. Derivar do relógio faria o mesmo
`PUT` cair em meses diferentes conforme o fuso de quem chama.

A decisão que atravessa a história é **ausência não é zero**. Remover o limite
apaga a linha, e `faixaDoSemaforo` já traduz ausência em `sem-limite`
(`RN-002`). Gravar zero seria uma promessa diferente: "quero gastar zero", que
por `RN-001` deixaria a categoria vermelha ao primeiro centavo.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Limite único, sem mês | Um limite de dezembro passaria a valer para janeiro sem ninguém decidir |
| Mês derivado da data do servidor | O mesmo `PUT` cairia em meses diferentes conforme o fuso |
| Zero como "sem limite" | `RN-001` deixaria a categoria vermelha no primeiro centavo |
| Valor em reais com decimal | `RN-006` exige centavos inteiros; ponto flutuante em dinheiro erra na soma |
| Guardar a faixa junto com o limite | A faixa é derivada; guardada, divergiria do gasto atual |

## 3. Fronteiras e design

- Módulos tocados: `budget` (novo hexágono completo), contrato, `app.module.ts`
- Contratos novos ou alterados: `GET /budgets/:month`, `PUT` e `DELETE /budgets/:month/:category`
- Dependências que entram: nenhuma

O catálogo de categorias vem do contexto `transactions` (`HN-005`): duplicá-lo
aqui criaria duas listas para divergir na primeira categoria nova.

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenário: limite gravado volta na consulta | Vermelho antes do código |
| 2 | Modelo, casos de uso e adaptador em memória | Verde |
| 3 | Refatoração para o adaptador Prisma | Continua verde |
| 4 | Unitários: validação, substituição, remoção, `RN-015` | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Mês inválido é recusado | `RF-013` | `monthly-limit.test.ts` |
| Valor não inteiro, negativo ou acima do teto é recusado | `RN-006` | `monthly-limit.test.ts` |
| Definir de novo substitui | `RF-013` | `set-monthly-limit.test.ts` |
| Remover volta a "sem limite" | `RN-002` | `remove-monthly-limit.test.ts` |
| Limite de outro titular não aparece | `RN-015` | teste de integração |
| Endpoints respondem 400 e 401 corretamente | `RF-013` | teste do controller |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `scripts/harness.sh gates` |
| SRE | Sim | Tabela e endpoints novos |
| Segurança | Sim | Escrita autorizada por titular |
| Arquitetura | Sim | Contexto `budget` completo sob `ADR-001` |
| Revisão final | Sim | `scripts/verificar-fechamento.sh v0.25.0` |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Zero confundido com ausência | Média | Remoção apaga a linha; teste explícito dos dois casos |
| Escrita cruzada entre titulares | Baixa | Titular na chave composta e na consulta, com teste negativo |
| Categoria fora do catálogo virar linha órfã | Média | Validação contra o catálogo de `HN-005` antes de gravar |

## 7. Plano de reversão

Remover o `BudgetModule` do `app.module.ts`. A tabela fica sem uso e pode ser
removida por migração; nenhum lançamento é afetado.

## 8. Fechamento

- Mensagem de commit prevista: `feat(budget): monthly limit per category, persisted by holder (HN-006)`
- Tag prevista: `v0.25.0` apontando para o commit de fechamento
