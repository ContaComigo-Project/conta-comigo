---
name: entrega-ht-003
description: Documento de entrega do catálogo de requisitos não funcionais do ContaComigo e do épico técnico preenchido.
document_type: delivery
story_key: HT-003
version: v0.4.0
max_lines: 300
---

# ENTREGA — `HT-003` — Catálogo RNF e épico técnico

- **Data:** 2026-09-02
- **Tipo:** Técnica (governança)
- **Versão:** `v0.4.0`
- **Commit:** `f9ed24f`
- **Tag:** `v0.4.0` → `f9ed24f`

## O que foi entregue

- **21 requisitos não funcionais** (`RNF-001` a `RNF-021`) em cinco categorias:
  desempenho e experiência, confiabilidade e operação, custo, segurança e
  privacidade, qualidade e manutenibilidade. Cada um com métrica, alvo,
  método de medição e história dona.
- **Épico técnico** preenchido: objetivo, mapa de RNF, arquitetura com decisões
  tomadas e em aberto, segurança, estratégia de testes, harness, CI/CD,
  observabilidade, versionamento e riscos técnicos.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-021` — gates bloqueiam de fato | O épico define o que cada gate mede e declara que gate como aviso não é gate | `EPICO-TECNICO.md` §7 |
| `RNF-019` — cobertura ≥ 80% no domínio | Número fixado antes de existir código, para não ser calibrado pelo resultado | `REQUISITOS-NAO-FUNCIONAIS.md` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Todo RNF com métrica, alvo e medição | Aprovado | 21 linhas com as três colunas preenchidas |
| Nenhum adjetivo sem número | Aprovado | Revisão linha a linha |
| Alvo pendente tem marcação e dono | Aprovado | `RNF-009` (teto de IA, `HT-012`) e `RNF-016` (prazo de exclusão, time) |
| Cada RNF aponta história | Aprovado | Coluna "Histórias" preenchida em todas |
| Épico distingue decisão tomada de aberta | Aprovado | `EPICO-TECNICO.md` §3, coluna "Escolha" |
| Épico declara ordem dos testes e rastreio RN→teste | Aprovado | `EPICO-TECNICO.md` §5 |
| Categorias sem RNF justificadas | Aprovado | Seção final do catálogo: SLA, escala, DR e i18n fora, com motivo |

## Evidência de verificação

```
$ grep -o "RNF-[0-9]\{3\}" docs/requisitos/REQUISITOS-NAO-FUNCIONAIS.md | sort -u | wc -l
21
```

Identificadores únicos batem com a faixa declarada (`RNF-001` a `RNF-021`).
Dois alvos permanecem abertos por decisão pendente, ambos marcados no texto e
com história dona.

## Testes

Não aplicável: história de documentação. Dispensa prevista em
`tdd-bdd-before-implementation`.

A verificação automática destes RNF é o objeto de `HT-006` (testes) e `HT-007`
(gates de CI) — um RNF só passa a bloquear quando o gate o mede.

## Refatoração feita após os funcionais verdes

Não aplicável. Ajuste durante a redação: a numeração de `RN` referenciada na
`SDD-001` foi corrigida depois que os catálogos fixaram a ordem final, para que
spec e catálogo não divergissem.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Não aplicável | Sem comportamento de produto |
| SRE | `sre-agent` | Aprovado com ressalva | `RNF-007` a `RNF-011` são verificáveis, mas nada os mede ainda: o harness segue sem comandos. Ressalva endereçada por `HT-005` |
| Segurança | `security-specialist-agent` | Aprovado | `RNF-012` a `RNF-017` cobrem segredo, autorização no servidor, cifra em repouso, log limpo e saída de modelo como entrada não confiável |
| Arquitetura | `architect-reviewer-agent` | Aprovado | `RNF-020` fixa adapters trocáveis; §3 do épico registra o que está decidido e o que não está |
| Revisão final | `final-reviewer-agent` | Aprovado | Fechamento verificado; correção do backlog em `9c063f7` (`v0.4.1`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Teto de custo de IA vira RNF, não boa intenção | Sem orçamento, custo é risco de projeto, não detalhe técnico | `RNF-009` e `RNF-010`; `HT-012` precisa definir o número antes de fechar |
| Saída do modelo tratada como entrada não confiável | O modelo pode produzir número plausível e errado | `RNF-017`, implementado por `HT-014` |
| Cobertura mínima só no domínio, não global | Cobertura global premia teste de código trivial | `RNF-019` |
| SLA, escala e recuperação de desastre ficam fora | PoC sem dado real e sem carga externa | Declarado na seção final do catálogo; rever se houver decisão de produção |
| Dado de Sandbox tratado como se fosse real | Hábito de segurança se constrói antes de existir risco | Vale para log, cifra e autorização desde `HN-001` |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Nenhum RNF é medido automaticamente ainda | Sem harness e sem CI | `HT-005`, `HT-006`, `HT-007` |
| `RNF-009` sem número | Depende de medir consumo real do provedor | `HT-012` |
| `RNF-016` sem prazo | Decisão do time com o orientador | `SDD-001` §7 |

## Verificação de fechamento

- [x] Documentação criada e coerente
- [x] `KANBAN-OFICIAL.md` atualizado
- [x] Commit semântico contém a chave `HT-003`
- [x] Commit não contém arquivos de outra história
- [x] Tag `v0.4.0` aponta para o mesmo hash do commit
- [x] Correção posterior (frontend existente) entregue em `v0.4.1` → `9c063f7`
