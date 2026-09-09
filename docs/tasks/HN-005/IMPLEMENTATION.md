---
name: implementation-hn-005
description: Plano técnico de HN-005 — categoria por regra e IA em lote, com origem persistida para que a correção manual prevaleça.
document_type: implementation_plan
applies_when:
  - implementar a história HN-005
max_lines: 300
---

# IMPLEMENTATION — `HN-005`

- **Requisitos ligados:** `RF-011`, `RF-012`, `RN-011`, `RN-015`, `RNF-009`, `RNF-010`, `RNF-017`
- **Versão prevista:** `v0.24.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

O mesmo desenho de `HN-004`, que já se provou: **regra determinística primeiro,
IA em lote depois, estado explícito quando ninguém sabe**. A diferença desta
história é `RN-011`, e ela não é sobre classificar — é sobre **lembrar quem
classificou**.

Por isso a entidade ganha dois campos, e não um: `category` e `categoryOrigin`
(`automatica` ou `manual`). Sem a origem, "preservar a correção" viraria
adivinhação na próxima sincronização.

A preservação acontece no único lugar onde pode ser garantida: o repositório.
`salvarSincronizados` só grava categoria automática quando a linha existente
**não** está marcada como manual. Deixar essa decisão no caso de uso funcionaria
até alguém escrever um segundo caminho de escrita.

A correção manual é um caso de uso próprio, com a barreira por titular no filtro
da consulta (`RN-015`): id de outra pessoa devolve "não encontrado", e não uma
negação que confirmaria a existência do recurso.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Só IA para classificar | Estoura o teto (`RNF-009`) e paga por "Uber para transporte", que uma regra resolve |
| Chutar "Outros" no lugar de "não classificado" | `RF-011` pede o estado explícito; "Outros" é categoria de verdade e poluiria o orçamento |
| Não guardar a origem e nunca recalcular | Congelaria erros automáticos para sempre |
| Guardar a origem só na aplicação | Um segundo caminho de escrita apagaria a correção sem ninguém perceber |
| Aceitar qualquer categoria vinda do modelo | `RNF-017`: valor fora do catálogo é descartado |

## 3. Fronteiras e design

- Módulos tocados: `transactions` (domínio, aplicação, persistência, HTTP), contrato, web
- Contratos novos ou alterados: `PATCH /transactions/:id/category`
- Dependências que entram: nenhuma

O catálogo vive no domínio e usa os identificadores que a web já conhece
(`alimentacao`, `transporte`, `moradia`, `saude`, `lazer`, `receita`,
`investimentos`, `outros`), para que a apresentação continue mapeando ícone e
cor sem tradução extra.

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenário de `RN-011`: correção sobrevive à sincronização | Vermelho antes do código |
| 2 | Catálogo, regras, casos de uso e endpoint mínimos | Verde |
| 3 | Refatoração da preservação para o repositório | Continua verde |
| 4 | Unitários: catálogo, lote, 400, `RN-015` | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Regras classificam os casos declarados | `RF-011` | `category.test.ts` |
| Desconhecido vai à IA em um lote | `RNF-009` | `categorize-transactions.test.ts` |
| Categoria fora do catálogo é descartada | `RNF-017` | `advisor-category-suggester.test.ts` |
| Correção grava origem manual | `RF-012` | `correct-category.test.ts` |
| Lançamento de outro titular: não encontrado | `RN-015` | `correct-category.test.ts` |
| Sincronização preserva o manual | `RN-011` | teste de integração no PostgreSQL |
| Categoria inválida no `PATCH` responde 400 | `RF-012` | teste do controller |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `scripts/harness.sh gates` |
| SRE | Sim | Custo: um lote por sincronização |
| Segurança | Sim | Primeira escrita autorizada por titular fora do consentimento |
| Open Finance | Sim | Dado financeiro do titular |
| Arquitetura | Sim | Endpoint novo; preservação no repositório |
| Revisão final | Sim | `scripts/verificar-fechamento.sh v0.24.0` |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Segundo caminho de escrita apagar o manual | Média | A preservação vive no repositório, não no caso de uso |
| Regra ampla demais classificar errado | Média | Regras por termo específico; a correção manual é definitiva |
| `PATCH` sem barreira virar escrita cruzada | Baixa | Titular no filtro, com teste negativo |

## 7. Plano de reversão

Parar de expor o `PATCH` e devolver `category: null` no DTO. As colunas ficam,
sem uso; nenhum dado original foi alterado.

## 8. Fechamento

- Mensagem de commit prevista: `feat(transactions): automatic category with manual correction that wins (HN-005)`
- Tag prevista: `v0.24.0` apontando para o commit de fechamento
