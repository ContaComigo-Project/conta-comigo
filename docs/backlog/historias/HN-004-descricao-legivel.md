---
name: hn-004-descricao-legivel
description: História de negócio para exibir a descrição do lançamento em linguagem reconhecível, preservando o texto original do agregador.
document_type: story
story_key: HN-004
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-004` — Descrição legível do lançamento (limpeza semântica)

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda (ordem 23)**
- **Requisitos:** `RF-010`; `RN-010` (o original permanece consultável), `RN-019` (nenhum número vem do modelo), `RNF-009` e `RNF-010` (teto e cache de IA)
- **Depende de:** `HN-003`, `HT-014` — concluídas
- **UI hoje:** `TransactionsListView` exibe a descrição crua vinda do agregador
- **Versão prevista:** `v0.23.0`

## A história

> Como Douglas, que abre o app depois do trabalho e não lembra o que foi
> `PAG*MERCADO CENTRAL 04/12`, quero ver **o que era aquele gasto** em linguagem
> que eu reconheço, sem perder a informação original quando eu precisar
> conferir com a fatura do banco.

Hoje a lista mostra o texto exatamente como o agregador entregou: prefixos de
adquirente, asteriscos, códigos de parcela, tudo em caixa alta. A pessoa
reconhece uma parte e ignora o resto — e um lançamento que não se reconhece é um
lançamento que não entra em nenhuma decisão.

## Resultado esperado

Cada lançamento passa a ter uma **descrição legível derivada**, e o texto
original continua guardado e disponível no contrato (`RN-010`).

A limpeza acontece em duas camadas, nesta ordem:

1. **Regras determinísticas**, no domínio: retiram prefixo de adquirente
   (`PAG*`, `PG *`, `TEF `), sufixo de parcela (`04/12`), código numérico solto
   e caixa alta, e aplicam um dicionário de estabelecimentos conhecidos.
2. **IA como último recurso**, só para o que sobrou irreconhecível, em **uma
   chamada por lote** e não por lançamento — passando pela porta de `HT-013`
   (teto, cache, degradação) e pela guarda de `HT-014`.

O que nenhuma das duas reconhecer **mantém o texto original** (`RN-010`), sem
inventar nada.

## Critérios de aceite

- [ ] `GET /transactions` devolve `description` legível e `descriptionOriginal`
      com o texto do agregador, quando os dois diferem
- [ ] Regras determinísticas cobrem, com teste: `PAG*MERCADO CENTRAL` →
      `Mercado Central`; `UBER *TRIP HELP.UBER` → `Uber`; `NETFLIX.COM` →
      `Netflix`; `TEF COMPRA 04/12` sem parcela no texto final
- [ ] Descrição não reconhecida pelas regras **nem** pela IA mantém o original
      (`RN-010`), e o teste prova que nada é inventado
- [ ] A limpeza **não altera** valor, data nem identificador do lançamento
- [ ] A IA é chamada **uma vez por lote** de descrições desconhecidas, nunca uma
      vez por lançamento (`RNF-009`)
- [ ] Provedor de IA fora do ar: a lista continua respondendo, com a descrição
      determinística ou a original (`RNF-005`, `RN-021`)
- [ ] Nenhum valor monetário do lançamento é enviado ao provedor — a limpeza é
      de texto, não de número (`RN-019`, `RNF-015`)
- [ ] A tela exibe a descrição legível e mantém o original acessível
- [ ] `pnpm run lint:boundaries`, `test:unit`, `test:integration` e
      `test:functional` verdes

```gherkin
Cenário: a fatura crua vira algo que a pessoa reconhece
  Dado um lançamento com descrição "PAG*MERCADO CENTRAL 04/12"
  Quando a pessoa abre a lista de lançamentos
  Então ela vê "Mercado Central"
  E o texto original continua disponível no contrato
  E o valor e a data do lançamento não mudaram
```

## Regras de negócio envolvidas

| Regra | O que exige | Como esta história cumpre |
| --- | --- | --- |
| `RN-010` | O original permanece consultável; o não reconhecido não muda | `descriptionOriginal` no contrato e na persistência; fallback para o original |
| `RN-019` | Nenhum número vem do modelo | O prompt recebe texto de descrição, sem valores |
| `RNF-009` | Teto de IA por pessoa por dia | Uma chamada por lote, e só para o que as regras não resolveram |
| `RNF-010` | Cache obrigatório | A mesma descrição não é limpa duas vezes |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Caso de uso no contexto `transactions`, consumindo a porta de `intelligence` |
| Dependências externas | Não | — |
| Contratos públicos | Acrescenta | `descriptionOriginal` passa a ser preenchido (campo já previsto em `HT-017`) |
| Dados e migração | Sim | Coluna para a descrição legível derivada |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Limpeza deturpar o sentido | O original nunca é sobrescrito; a derivada é outra coluna | Apagar a coluna derivada |
| IA estourar o teto em conta com muitos lançamentos | Lote, cache e apenas o que as regras não cobriram | Desligar o passo de IA e manter só as regras |
| Dicionário virar manutenção infinita | Ele cobre o caso frequente; o resto cai na IA ou no original | — |

## Fora de escopo

- Categoria do lançamento — é `HN-005`
- Edição manual da descrição pela pessoa
- Reprocessar histórico antigo em massa fora do fluxo de sincronização

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Comportamento visível e regra de fallback |
| SRE | Sim | Custo de IA e degradação |
| Segurança | Sim | O que é enviado ao provedor |
| Open Finance | Sim | Dado financeiro de titular atravessa a fronteira externa |
| Arquitetura | Sim | Contexto novo consumindo porta de outro contexto |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Testes das regras, do fallback e do lote verdes
- [ ] Cenário funcional da lista com descrição legível verde
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HN-004-descricao-legivel.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-004` e tag `v0.23.0` no mesmo hash
