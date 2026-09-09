---
name: hn-006-limite-mensal
description: História de negócio para definir, editar e remover o limite mensal de gasto por categoria, persistido por titular e por mês.
document_type: story
story_key: HN-006
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-006` — Definir e editar limite mensal por categoria

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda (ordem 25)**
- **Requisitos:** `RF-013`; `RN-002` (sem limite não há faixa), `RN-006` (valor em centavos), `RN-015` (barreira por titular)
- **Depende de:** `HN-005` — concluída
- **UI hoje:** `CategoryCard` já edita o limite inline, **sem persistir nada**
- **Versão prevista:** `v0.25.0`

## A história

> Como Marina, que quer parar de descobrir o estouro no fim do mês, quero
> **definir quanto pretendo gastar em cada categoria** e mudar esse número
> quando a vida mudar — e quero que ele continue lá quando eu voltar amanhã.

O limite é o número que falta para tudo o que vem depois: sem ele, `RN-001` não
tem denominador, o semáforo de `HN-007` não tem faixa e o histórico de `HN-008`
não tem contra o quê comparar. Hoje a `CategoryCard` deixa a pessoa arrastar o
valor e some com ele no primeiro recarregamento.

## Resultado esperado

O limite é definido **por titular, por mês de referência e por categoria**,
guardado em centavos, e pode ser alterado ou **removido** — removido volta ao
estado "sem limite" (`RN-002`), que não é o mesmo que limite zero.

O mês faz parte da chave de propósito: um limite de dezembro não deve valer para
janeiro sem que a pessoa decida isso.

## Critérios de aceite

- [ ] `PUT /budgets/:month/:category` grava o limite do titular da sessão
- [ ] `DELETE /budgets/:month/:category` remove o limite, voltando ao estado
      "sem limite" (`RN-002`) — diferente de gravar zero
- [ ] `GET /budgets/:month` lista os limites do mês, só do titular (`RN-015`)
- [ ] Definir de novo o mesmo mês e categoria **substitui** o valor, sem duplicar
- [ ] Valor não inteiro, negativo ou acima do teto responde 400 sem gravar
- [ ] Mês em formato inválido responde 400; categoria fora do catálogo, 400
- [ ] Limite de um titular nunca aparece para outro (`RN-015`), provado por teste
      de integração no PostgreSQL
- [ ] O limite viaja em **centavos** no contrato (`RN-006`), sem número
      fracionário
- [ ] `pnpm run lint:boundaries`, `test:unit` e `test:integration` verdes

```gherkin
Cenário: o limite sobrevive ao recarregamento
  Dado que a pessoa definiu R$ 800,00 de limite para alimentação em janeiro
  Quando ela consulta os limites de janeiro de novo
  Então o limite de alimentação continua sendo R$ 800,00
  E o limite de fevereiro continua indefinido
```

## Regras de negócio envolvidas

| Regra | O que exige | Como esta história cumpre |
| --- | --- | --- |
| `RN-002` | Sem limite definido não há faixa | Remover apaga a linha; ausência é diferente de zero |
| `RN-006` | Valor monetário em centavos, inteiro | O contrato usa `Cents`; o domínio recusa não inteiro |
| `RN-015` | Dado de uma pessoa não vaza para outra | Titular na chave e na consulta |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | O contexto `budget` ganha aplicação, porta e infraestrutura (hoje só tem a regra de faixa) |
| Dependências externas | Não | — |
| Contratos públicos | Acrescenta | Três endpoints de orçamento |
| Dados e migração | Sim | Tabela de limites por titular, mês e categoria |

## Riscos e plano de reversão

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Limite zero ser confundido com "sem limite" | Média | Remoção apaga a linha; `faixaDoSemaforo` já trata zero como sem faixa |
| Mês em fuso errado agrupar errado | Média | O mês é valor explícito na chave, não derivado de data no servidor |
| Escrita cruzada entre titulares | Baixa | Titular na chave primária composta, com teste negativo |

## Fora de escopo

- Semáforo e aviso ao cruzar faixa — `HN-007`
- Sugestão automática de limite
- Copiar limites de um mês para o seguinte

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Comportamento testável e valores de fronteira |
| SRE | Sim | Tabela e endpoints novos |
| Segurança | Sim | Escrita autorizada por titular |
| Arquitetura | Sim | Contexto `budget` passa a ter infraestrutura |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Testes de gravação, substituição, remoção, validação e `RN-015` verdes
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HN-006-limite-mensal.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-006` e tag `v0.25.0` no mesmo hash
