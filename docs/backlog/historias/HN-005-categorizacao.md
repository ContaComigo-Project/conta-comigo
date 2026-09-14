---
name: hn-005-categorizacao
description: História de negócio para categorizar o lançamento automaticamente e permitir a correção manual, que prevalece e não é sobrescrita por sincronização posterior.
document_type: story
story_key: HN-005
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-005` — Categorização automática e correção manual

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda (ordem 24)**
- **Requisitos:** `RF-011`, `RF-012`; `RN-011` (a correção manual prevalece e não é sobrescrita), `RN-015` (barreira por titular), `RNF-009` e `RNF-010` (teto e cache de IA), `RNF-017` (saída do modelo validada)
- **Depende de:** `HN-004` — concluída
- **UI hoje:** `CategoryCard`, `QuickFilterBar` e a lista já exibem categoria, sobre dado simulado; **não há correção manual em lugar nenhum**
- **Versão prevista:** `v0.24.0`

## A história

> Como Marina, que quer saber para onde o dinheiro está indo, quero que cada
> lançamento **já venha classificado**, e quero poder **corrigir** quando a
> classificação estiver errada — sem que a correção suma na próxima
> sincronização.

Hoje todo lançamento chega à tela sem categoria: o painel mostra "Outros" para
tudo, e o orçamento por categoria (`HN-006`, `HN-007`) não tem sobre o que ser
calculado. Categorizar é o que transforma uma lista de lançamentos em uma
resposta à pergunta "para onde foi meu dinheiro".

## Resultado esperado

Todo lançamento recebe **uma categoria ou o estado explícito "não
classificado"** (`RF-011`), pelo mesmo desenho que `HN-004` validou: regras
determinísticas primeiro, IA em lote só para o que sobrar.

A pessoa pode **corrigir** a categoria de um lançamento (`RF-012`). A correção
é marcada como **manual** e, a partir daí, **nenhuma sincronização, regra ou
modelo a sobrescreve** (`RN-011`) — só outra correção manual.

## Critérios de aceite

- [ ] Todo lançamento tem `category` preenchida ou `null` explícito, e o
      contrato diferencia os dois casos
- [ ] Regras determinísticas classificam, com teste: `Uber`/`99` → transporte;
      `iFood`/`Mercado Central` → alimentação; `Netflix`/`Spotify` → lazer;
      `Farmácia` → saúde; valor positivo de salário → receita
- [ ] O que as regras não reconhecem vai para a IA **em um lote**, e o que a IA
      não classificar fica **não classificado** — nunca chutado
- [ ] `RNF-017`: categoria devolvida pelo modelo que não existe no catálogo é
      descartada, e o lançamento fica não classificado
- [ ] `PATCH /transactions/:id/category` grava a correção, marcada como manual
- [ ] `RN-015`: corrigir lançamento de outro titular responde negação, nunca
      conteúdo, e não altera nada
- [ ] `RN-011`: sincronizar de novo o mesmo lançamento **preserva** a categoria
      manual; a automática pode ser recalculada
- [ ] Categoria inválida no `PATCH` responde 400 sem gravar
- [ ] A tela permite corrigir a categoria de um lançamento e mostra o resultado
- [ ] `pnpm run lint:boundaries`, `test:unit` e `test:integration` verdes

```gherkin
Cenário: a correção manual sobrevive à sincronização
  Dado um lançamento classificado automaticamente como "alimentação"
  Quando a pessoa corrige para "lazer"
  E a instituição é sincronizada de novo
  Então o lançamento continua em "lazer"
  E a origem da categoria continua sendo manual
```

## Regras de negócio envolvidas

| Regra | O que exige | Como esta história cumpre |
| --- | --- | --- |
| `RN-011` | Correção manual prevalece e não é sobrescrita | Origem da categoria persistida; a sincronização não toca no que é manual |
| `RN-015` | Dado de uma pessoa nunca é visível nem alterável por outra | O `PATCH` procura o lançamento pelo titular da sessão |
| `RF-011` | Todo lançamento recebe categoria ou "não classificado" | Estado explícito, sem chute |
| `RNF-009` / `RNF-010` | Teto e cache de IA | Um lote por sincronização, descrições distintas |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Caso de uso no contexto `transactions` |
| Dependências externas | Não | — |
| Contratos públicos | Acrescenta | `PATCH /transactions/:id/category`; `category` passa a vir preenchida |
| Dados e migração | Sim | Colunas de categoria e de origem da categoria |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Sincronização apagar correção manual | A origem é persistida e verificada antes de gravar | Teste de regressão dedicado a `RN-011` |
| Modelo inventar categoria | Só valores do catálogo são aceitos | — |
| Regra classificar errado em massa | A pessoa corrige, e a correção é definitiva | Ajustar a regra, com teste |

## Fora de escopo

- Limite por categoria e semáforo — `HN-006` e `HN-007`
- Criar categorias novas pela pessoa
- Reclassificar em massa o histórico anterior à história

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Regra de prevalência é comportamento testável |
| SRE | Sim | Custo de IA |
| Segurança | Sim | Escrita autorizada por titular |
| Open Finance | Sim | Dado financeiro atravessa a fronteira externa |
| Arquitetura | Sim | Endpoint novo no contrato |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Testes das regras, do lote, do `PATCH` e de `RN-011` verdes
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HN-005-categorizacao.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-005` e tag `v0.24.0` no mesmo hash
