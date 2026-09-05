---
name: regras-de-negocio
description: Catálogo de regras de negócio (RN) do ContaComigo — invariantes do domínio financeiro, de consentimento e de fronteira da IA.
document_type: requirements_catalog
source: SDD-001
applies_when:
  - escrever critério de aceite de história de negócio
  - revisar se um teste prova regra de domínio e não apenas fluxo de pipeline
max_lines: 300
---

# Regras de Negócio (RN)

Derivadas de [`SDD-001`](../spec-driven-development/SDD-001-contacomigo-poc.md).

Uma RN é invariante do domínio: continua verdadeira trocando a interface, o
banco e a linguagem. **Toda RN aqui precisa de pelo menos um teste que falharia
se a regra fosse invertida** — é o critério central do gate de QA.

## Orçamento

| ID | Regra | Casos de borda | RF | Status |
| --- | --- | --- | --- | --- |
| RN-001 | O gasto da categoria no mês, dividido pelo limite da categoria, determina a faixa: **verde** até 70% inclusive, **amarelo** acima de 70% e até 90% inclusive, **vermelho** acima de 90% | Exatamente 70%: verde. Exatamente 90%: amarelo. 90,01%: vermelho. Gasto zero: verde | RF-014 | Aprovado |
| RN-002 | Categoria sem limite definido não tem faixa: exibe o estado **"sem limite"**, nunca verde | Limite removido depois de definido volta ao estado sem limite | RF-013, RF-014 | Aprovado |
| RN-003 | O mês de referência de um lançamento é o mês civil da sua data de competência, no fuso de São Paulo | Lançamento em 31/01 23:59 e 01/02 00:01 caem em meses diferentes | RF-014 | Aprovado |
| RN-004 | Limite é sempre mensal e não acumula saldo entre meses | Sobra de janeiro não aumenta o limite de fevereiro | RF-013 | Aprovado |
| RN-005 | Aviso de cruzamento de faixa ocorre no máximo uma vez por faixa, por categoria, por mês | Gasto que sobe, cai e sobe de novo não gera segundo aviso da mesma faixa | RF-015 | Aprovado |

## Dados financeiros

| ID | Regra | Casos de borda | RF | Status |
| --- | --- | --- | --- | --- |
| RN-006 | Valores são em BRL, com duas casas decimais, e o arredondamento nunca é aplicado a resultado intermediário | Soma de 0,005 repetidos não pode gerar divergência com o extrato | RF-008 | Aprovado |
| RN-007 | Lançamento estornado não conta no gasto: estorno e lançamento original se anulam | Estorno parcial reduz o valor, não elimina o lançamento | RF-009, RF-014 | Aprovado |
| RN-008 | Lançamento duplicado pelo agregador é contado uma única vez | Mesma instituição, mesmo valor, mesma data e mesmo identificador externo | RF-007 | Aprovado |
| RN-009 | O saldo total é a soma dos saldos das contas ativas; cartão de crédito entra como fatura, nunca somado ao saldo | Conta com saldo negativo reduz o total | RF-008 | Aprovado |
| RN-010 | A limpeza semântica não altera o lançamento original: a descrição legível é derivada, e o original permanece consultável | Descrição que o tradutor não reconhece mantém o texto original | RF-010 | Aprovado |
| RN-011 | Categoria corrigida manualmente prevalece sobre a automática e não é sobrescrita por sincronização posterior | Nova sincronização do mesmo lançamento preserva a correção | RF-012 | Aprovado |

## Consentimento e privacidade

| ID | Regra | Casos de borda | RF | Status |
| --- | --- | --- | --- | --- |
| RN-012 | Sem consentimento ativo não há sincronização nem exibição de dado daquela instituição | Consentimento expirado equivale a ausente | RF-004, RF-007 | Aprovado |
| RN-013 | Revogar consentimento remove os dados daquela instituição do painel imediatamente e agenda a exclusão definitiva no prazo definido pelo time | Revogação durante uma sincronização em andamento cancela o resultado | RF-006 | Aprovado |
| RN-014 | Existe no máximo um consentimento ativo por instituição por pessoa | Reconectar a mesma instituição substitui o consentimento anterior | RF-004 | Aprovado |
| RN-015 | Dado de uma pessoa nunca é visível para outra, em nenhuma superfície, incluindo exportação e resposta de IA | Identificador de recurso adivinhado retorna negação, não conteúdo | RF-009, RF-023 | Aprovado |
| RN-016 | Excluir a conta apaga ou anonimiza todo dado pessoal e financeiro associado | Exportação anterior já entregue à pessoa não é alcançada | RF-025 | Aprovado |

## Fronteira da inteligência artificial

| ID | Regra | Casos de borda | RF | Status |
| --- | --- | --- | --- | --- |
| RN-017 | A IA não recomenda produto financeiro, investimento, crédito ou instituição — em nenhuma superfície, nem quando solicitada diretamente | Pergunta insistente ou reformulada continua sendo recusada | RF-020, RF-021 | Aprovado |
| RN-018 | Toda superfície com saída de IA exibe o aviso de não aconselhamento | Aviso não pode ser fechado nem rolar para fora da tela | RF-021 | Aprovado |
| RN-019 | Nenhum número exibido como dado financeiro vem do modelo de IA: os valores vêm do dado consolidado, e a IA apenas os interpreta | Se a IA citar valor divergente do painel, a resposta é bloqueada | RF-018, RF-019 | Aprovado |
| RN-020 | Diagnóstico exige dado mínimo — pelo menos um mês fechado com lançamentos; sem isso, o sistema exibe "dados insuficientes" em vez de diagnosticar | Conta recém-conectada não recebe diagnóstico | RF-018 | Aprovado |
| RN-021 | Indisponibilidade do provedor de IA degrada apenas os blocos de IA; o painel numérico continua funcionando | Falha do modelo nunca esvazia a tela de saldos | RF-018, RF-020 | Aprovado |

## Histórico

| ID | Regra | Casos de borda | RF | Status |
| --- | --- | --- | --- | --- |
| RN-022 | O histórico da PoC cobre no máximo 6 meses fechados | Conta com 2 meses mostra 2, não erro | RF-016 | Aprovado |
| RN-023 | O ranking de problemas recorrentes é calculado a partir dos meses fechados, nunca gerado pelo modelo de IA | Empate é desempatado pelo maior valor absoluto | RF-017 | Aprovado |

## Observadas no código atual (a decidir)

Regras que **hoje existem** em `frontend/src/mocks/budget.mock.ts` mas que
ninguém aprovou como requisito. `HT-016` promove ou descarta cada uma; até lá,
não valem como especificação.

| ID | Regra observada | Onde está hoje | Pergunta que o time precisa responder | Status |
| --- | --- | --- | --- | --- |
| RN-024 | O percentual da categoria é limitado a 200%, mesmo que o gasto seja maior | `budget.mock.ts:91` — `Math.min(200, ...)` | **Descartada** — `HT-016`: truncar o dado esconde a gravidade do estouro. O domínio calcula o percentual real; o cap visual da barra é implementação de UI. `RN-001`/`RN-006` operam sobre o valor real | Descartada |
| RN-025 | O percentual é arredondado para uma casa decimal antes de determinar a faixa | `budget.mock.ts:91` — `.toFixed(1)` | **Descartada** — `HT-016`: arredondar antes da faixa cria fronteira ambígua (70,04% viraria verde). O domínio compara contra os limites exatos de `RN-001` (≤70, ≤90, >90); arredondamento é só de exibição | Descartada |

Ambas interagem com `RN-001` e `RN-006`. `RN-025` em particular muda o resultado
de um caso de borda que `RN-001` declara — precisa ser resolvida antes de `HN-007`.

## Legenda de status

`Rascunho` → `Aprovado` → `Em execução` → `Entregue` → `Obsoleto` · `Descartada`
(nunca foi aprovada como requisito; registra-se o motivo na coluna da regra)
