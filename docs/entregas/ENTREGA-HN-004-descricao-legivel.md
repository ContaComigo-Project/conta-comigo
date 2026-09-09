---
name: entrega-hn-004
description: Documento de entrega da descrição legível do lançamento — regras determinísticas no domínio, IA em lote como último recurso e texto original preservado.
document_type: delivery
story_key: HN-004
version: v0.23.0
max_lines: 300
---

# ENTREGA — `HN-004` — Descrição legível do lançamento

- **Data:** 2026-09-08
- **Tipo:** Negócio
- **Versão:** `v0.23.0`
- **Commit:** `7652252`
- **Tag:** `v0.23.0` → `7652252`

## O que foi entregue

- **`domain/model/readable-description.ts`** — as regras determinísticas, puras:
  prefixo de adquirente (`PAG*`, `PG *`, `TEF COMPRA`), sufixo de parcela
  (`04/12`), código numérico, ruído do adquirente (`HELP.UBER`, `.COM`,
  `BR SERVICOS`), caixa de título com preposição em minúscula e um dicionário
  curto de estabelecimentos frequentes.
- **`precisaDeAjuda`** — decide quando vale gastar IA: só quando o resultado
  determinístico continua ilegível (código, sigla curta, texto sem vogais).
  Perguntar sobre "Mercado Central" seria queimar cota (`RNF-009`).
- **`application/make-descriptions-readable.ts`** — o caso de uso: aplica as
  regras, junta as descrições distintas que sobraram e pede **uma** tradução em
  lote, com limite de 30 itens; o que não voltar fica com a versão
  determinística e, na falta dela, com o original.
- **Porta `DescriptionTranslator`** no domínio de `transactions` e adaptador
  `AdvisorDescriptionTranslator` sobre a porta de IA de `HT-013` — o caso de uso
  não sabe que existe modelo.
- **`readableDescription`** na entidade, na tabela (`readable_description`, com
  migração) e no transporte: `description` passa a levar a legível e
  `descriptionOriginal` viaja junto sempre que os dois diferem.
- **Sincronização** (`SyncInstitutionUseCase`) aplica a limpeza no momento em que
  o lançamento chega, não a cada leitura de tela.
- **Web**: a lista exibe a legível e mantém o texto do agregador acessível no
  `title` do item; o `db:seed` usa as mesmas regras, então a demo mostra o
  comportamento real.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-010` — descrição em linguagem reconhecível | Regras determinísticas + IA em lote | `readable-description.test.ts`, saída da API real |
| `RN-010` — o original permanece consultável | `description` nunca é sobrescrita; `descriptionOriginal` no contrato | Teste do controller e saída da API |
| `RN-010` — não reconhecido mantém o texto | Fallback em cascata: IA → determinística → original | `make-descriptions-readable.test.ts` |
| `RNF-009` — teto de IA | Uma chamada por lote, descrição repetida entra uma vez, limite de 30 | Teste conta 1 chamada para 12 lançamentos |
| `RNF-005` / `RN-021` — degradação | Tradutor fora do ar não interrompe a sincronização | Teste com tradutor que lança |
| `RN-019` / `RNF-015` — nada de valor no prompt | O pedido leva só a lista de descrições | `advisor-description-translator.test.ts` |
| `RNF-017` — saída não confiável | Só JSON, só chaves perguntadas, só valores de texto até 120 caracteres | `advisor-description-translator.test.ts` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `GET /transactions` devolve legível + original | Aprovado | Saída da API real, abaixo |
| Regras cobrem os casos declarados | Aprovado | `PAG*MERCADO CENTRAL 04/12` → `Mercado Central`; `UBER *TRIP HELP.UBER` → `Uber`; `NETFLIX.COM` → `Netflix` |
| Não reconhecido mantém o original | Aprovado | `X9ZQ` continua `X9ZQ` |
| Valor, data e identificador não mudam | Aprovado | Teste explícito |
| Uma chamada por lote | Aprovado | 12 lançamentos → 1 chamada, cortada em 5 no teste de limite |
| Provedor fora não derruba a lista | Aprovado | Teste com tradutor que lança |
| Nada de valor monetário no prompt | Aprovado | `dados` do pedido contém apenas `descricoes` |
| Tela exibe legível e mantém original | Aprovado | `TransactionsListView` com `title` |
| Suítes verdes | Aprovado | 246 unitários, 13 de integração, 3 funcionais |

## Evidência de verificação

Saída real da API com o banco semeado, em
`docs/tasks/HN-004/evidencia/20260908-api-descricao-legivel.txt`
(`description  <-  descriptionOriginal`):

```
Mercado Central  <-  PAG*MERCADO CENTRAL
Transf Recebida  <-  TRANSF RECEBIDA
Uber  <-  UBER *TRIP
Netflix  <-  NETFLIX.COM
Rendimento Poupanca  <-  RENDIMENTO POUPANCA
```

## Evidência de testes

Saída de `scripts/harness.sh gates`, em
`docs/tasks/HN-004/evidencia/20260908-215854-gates-verde.txt`:

```
 Test Files  43 passed (43)
      Tests  246 passed (246)
 Test Files  3 passed (3)
      Tests  13 passed (13)
  3 passed (6.3s)
Statements   : 96.53% ( 167/173 )
Branches     : 88.46% ( 92/104 )
  [OK]    nenhum segredo detectado
  [OK]    nenhuma vulnerabilidade conhecida
harness: gates concluídos
EXIT_CODE=0
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unit` | 246 testes verdes | +22 desta história |
| Integração | `pnpm run test:integration` | 13 testes verdes | inalterada |
| Funcional | `pnpm run test:functional` | 3 testes verdes | web real |
| Fronteiras | `pnpm run lint:boundaries` | verde | 259 módulos, 729 dependências |
| Segurança | `pnpm run security` | aprovada | gitleaks + osv-scanner |

## Refatoração feita após os funcionais verdes

`DescriptionTranslator.traduzir` passou a receber o titular como parâmetro em vez
de guardá-lo no construtor do adaptador. Sem isso, seria preciso um adaptador por
pessoa para que o teto e o cache de `HT-013` contassem certo — e o módulo teria
de construir objeto por requisição.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 22 testes novos; fallback em cascata coberto |
| SRE | `sre-agent` | Aprovado | Custo limitado: lote único, deduplicado, com teto e cache de `HT-013` |
| Segurança | `security-specialist-agent` | Aprovado | Sai descrição, não valor nem identidade; resposta do modelo filtrada |
| Open Finance | `open-finance-security-agent` | Aprovado | Nenhum dado de saldo ou identificador de conta atravessa a fronteira externa |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Porta no domínio de `transactions`; IA só no adaptador |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.23.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Regras determinísticas primeiro, IA depois | Elas são gratuitas e resolvem o padrão frequente; IA para 300 lançamentos estouraria o teto no primeiro uso | `HN-005` segue o mesmo padrão |
| Uma chamada por lote, descrição deduplicada | `RNF-009` e `RNF-010` | Limite de 30 por sincronização |
| Limpeza na sincronização, não na leitura | O custo se paga uma vez por lançamento novo | — |
| Limpeza conservadora: na dúvida, devolve o original | Apagar informação é pior que não limpar (`RN-010`) | Teste cobre "limpou até não sobrar nada" |
| O original vai ao contrato só quando difere | Repetir o mesmo texto em dois campos é ruído | Campo já previsto em `HT-017` |
| Resposta do modelo filtrada por chave perguntada | `RNF-017`: descrição inventada não entra na lista | — |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Sem cenário de navegador para a lista | O harness do Playwright sobe só a web; provar em tela exigiria a API e o banco no mesmo comando | Aqui; revisitar em `HT-007` (CI) ou `HT-015` |
| Descrições que sobram do lote de 30 | Ficam para a próxima sincronização, com a versão determinística | Aqui |
| Dicionário de estabelecimentos é curto | Cobre o repetido; o resto é IA ou original | Cresce com uso real |
| Reprocessar histórico anterior à história | Fora de escopo; a limpeza vale para o que sincroniza a partir de agora | Aqui |

## Verificação de fechamento

- [x] Testes e gates aplicáveis verdes
- [x] Commit semântico contém a chave `HN-004`
- [x] Commit não contém arquivos de outra história
- [x] Tag `v0.23.0` aponta para o mesmo hash do commit
- [x] `KANBAN-OFICIAL.md` atualizado
