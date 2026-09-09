---
name: entrega-hn-005
description: Documento de entrega da categorização automática do lançamento e da correção manual, que prevalece sobre qualquer sincronização posterior.
document_type: delivery
story_key: HN-005
version: v0.24.0
max_lines: 300
---

# ENTREGA — `HN-005` — Categorização automática e correção manual

- **Data:** 2026-09-08
- **Tipo:** Negócio
- **Versão:** `v0.24.0`
- **Commit:** `<hash do commit de fechamento>`
- **Tag:** `v0.24.0` → `<hash do commit de fechamento>`

## O que foi entregue

- **`domain/model/category.ts`** — catálogo (`alimentacao`, `transporte`,
  `moradia`, `saude`, `lazer`, `receita`, `investimentos`, `outros`, os mesmos
  identificadores que a web já usa para ícone e cor) e classificação por regra,
  com busca por **palavra inteira**: "uber" dentro de "Uberlandia" não é corrida
  de aplicativo.
- **`category` e `categoryOrigin`** na entidade, na tabela (com migração) e no
  contrato. A origem é o que torna `RN-011` executável.
- **`application/categorize-transactions.ts`** — regra primeiro, IA em um lote
  para o que sobrou, e **não classificado** quando ninguém sabe. Lançamento
  marcado como manual não é reclassificado nem entra no lote.
- **`application/correct-category.ts`** — a correção manual, com o titular no
  filtro da consulta (`RN-015`) e validação da categoria antes de qualquer
  acesso ao banco.
- **`AdvisorCategorySuggester`** — adaptador sobre a porta de IA; categoria fora
  do catálogo é descartada (`RNF-017`), virando "não classificado" em vez de um
  rótulo novo na tela.
- **`PATCH /transactions/:id/category`** — documentado na spec OpenAPI, com
  Bearer obrigatório, 400 para categoria inválida e 404 para lançamento de outro
  titular.
- **Preservação no repositório**: `salvarSincronizados` passou a atualizar a
  linha existente em vez de ignorá-la, mas **nunca** sobrescreve categoria
  manual — a decisão vive no único caminho de escrita da sincronização.
- **Web**: `TransactionsListView` ganhou o seletor de categoria e o `db:seed`
  classifica a demo com as mesmas regras.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-011` — categoria ou "não classificado" | Regra, IA em lote e `null` explícito | `category.test.ts`, saída da API |
| `RF-012` — correção manual persiste | `PATCH` grava categoria e origem manual | `correct-category.test.ts`, `curl` |
| `RN-011` — a correção não é sobrescrita | A sincronização preserva o que é manual | Teste de integração no PostgreSQL real |
| `RN-015` — barreira por titular | Titular no filtro da consulta; 404 em vez de 403 | Teste unitário e `curl` |
| `RNF-009` / `RNF-010` — custo | Um lote por sincronização, descrições distintas, manual fora do lote | `categorize-transactions.test.ts` |
| `RNF-017` — saída não confiável | Só chaves perguntadas e só categorias do catálogo | `advisor-category-suggester.test.ts` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `category` preenchida ou `null` explícito | Aprovado | Contrato e saída da API |
| Regras classificam os casos declarados | Aprovado | Uber, iFood, Netflix, Farmácia, Aluguel, salário |
| Desconhecido vai à IA em um lote | Aprovado | 4 lançamentos, 2 descrições distintas, 1 chamada |
| Categoria fora do catálogo é descartada | Aprovado | `viagens` não entra |
| `PATCH` grava como manual | Aprovado | HTTP 200 e leitura seguinte |
| Lançamento de outro titular é negado | Aprovado | HTTP 404, nada gravado |
| Sincronizar de novo preserva o manual | Aprovado | Teste de integração |
| Categoria inválida responde 400 | Aprovado | HTTP 400 |
| Tela permite corrigir | **Parcial** — ver dívida assumida | Seletor pronto no componente; nenhuma tela ainda lista dados da API |
| Suítes verdes | Aprovado | 272 unitários, 16 de integração, 3 funcionais |

## Evidência de verificação

Saída real da API com o banco semeado, em
`docs/tasks/HN-005/evidencia/20260908-api-categoria.txt`:

```
# categoria automatica vinda da API (RF-011)
seed-lanc-1  Mercado Central  ->  alimentacao
seed-lanc-2  Transf Recebida  ->  receita
seed-lanc-3  Uber  ->  transporte
seed-lanc-4  Netflix  ->  lazer
seed-lanc-5  Rendimento Poupanca  ->  investimentos

# correcao manual (RF-012)
PATCH /transactions/seed-lanc-1/category {"category":"lazer"} -> 200
categoria fora do catalogo -> 400
lancamento de outro titular (RN-015) -> 404
sem token -> 401

# depois da correcao
seed-lanc-1  Mercado Central  ->  lazer
```

## Evidência de testes

Saída de `scripts/harness.sh gates`, em
`docs/tasks/HN-005/evidencia/20260908-221321-gates-verde.txt`:

```
 Test Files  47 passed (47)
      Tests  272 passed (272)
 Test Files  3 passed (3)
      Tests  16 passed (16)
  3 passed (6.0s)
Statements   : 96.44% ( 190/197 )
Branches     : 88.13% ( 104/118 )
  [OK]    nenhum segredo detectado
  [OK]    nenhuma vulnerabilidade conhecida
harness: gates concluídos
EXIT_CODE=0
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unit` | 272 testes verdes | +26 desta história |
| Integração | `pnpm run test:integration` | 16 testes verdes | +3, incluindo `RN-011` |
| Funcional | `pnpm run test:functional` | 3 testes verdes | web real |
| Fronteiras | `pnpm run lint:boundaries` | verde | ADR-001/002 |
| Segurança | `pnpm run security` | aprovada | gitleaks + osv-scanner |

## Refatoração feita após os funcionais verdes

`salvarSincronizados` deixou de simplesmente ignorar lançamentos já existentes e
passou a atualizá-los, com a exceção explícita da categoria manual. A versão
anterior "preservava" a correção por acidente — porque não atualizava nada — e
qualquer melhoria futura na sincronização teria apagado a correção sem que
nenhum teste percebesse.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 26 testes novos; `RN-011` provado contra o banco real |
| SRE | `sre-agent` | Aprovado | Um lote por sincronização; manual não consome cota |
| Segurança | `security-specialist-agent` | Aprovado | Primeira escrita autorizada por titular fora do consentimento; 404 em vez de 403 |
| Open Finance | `open-finance-security-agent` | Aprovado | Só descrições atravessam a fronteira externa |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Preservação no repositório; porta nova no domínio |
| Revisão final | `final-reviewer-agent` | Aprovado com ressalva | Critério da tela parcial, registrado como dívida |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Dois campos, não um: categoria e origem | Sem a origem, "preservar a correção" é adivinhação | `HN-006` e `HN-007` leem a categoria sem saber quem a definiu |
| Preservação no repositório, não no caso de uso | Um segundo caminho de escrita apagaria a correção em silêncio | — |
| `null` em vez de "Outros" | `RF-011` pede o estado explícito; "Outros" é categoria de verdade e poluiria o orçamento | A tela mostra "Não classificado" |
| Busca por palavra inteira | Substring classifica "Uberlandia" como transporte | — |
| 404 para lançamento de outro titular | 403 confirmaria que o recurso existe | Padrão para os próximos endpoints por id |
| Entrada de dinheiro é receita por padrão | Salário e transferência recebida são o caso comum; rendimento vira investimento pelo termo | Revisitar se aparecer entrada que não é nenhum dos dois |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| **Nenhuma tela usa o seletor ainda** | A tela de despesas ainda lê os mocks; ligá-la à API é escopo de `HT-018`. O componente já aceita o `onCorrigirCategoria` e o `ApiSource` já expõe `corrigirCategoria`, mas nenhuma página passa o handler | Aqui e no kanban |
| Sem cenário de navegador | Mesma limitação de `HN-004`: o Playwright sobe só a web | `HT-007` ou `HT-015` |
| Regras cobrem o vocabulário frequente | O resto vai para a IA ou fica não classificado | Cresce com uso real |
| Reclassificar histórico anterior | Fora de escopo | Aqui |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-005`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.24.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado
