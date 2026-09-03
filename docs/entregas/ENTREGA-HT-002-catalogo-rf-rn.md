---
name: entrega-ht-002
description: Documento de entrega do catálogo de requisitos funcionais e regras de negócio do ContaComigo e do épico de negócio preenchido.
document_type: delivery
story_key: HT-002
version: v0.3.0
max_lines: 300
---

# ENTREGA — `HT-002` — Catálogo RF/RN e épico de negócio

- **Data:** 2026-09-02
- **Tipo:** Técnica (governança)
- **Versão:** `v0.3.0`
- **Commit:** _(pendente — aguardando autorização de fechamento)_
- **Tag:** `v0.3.0` → _(pendente)_

## O que foi entregue

- **25 requisitos funcionais** (`RF-001` a `RF-025`), agrupados em sete temas,
  cada um com persona, prioridade MoSCoW, forma de verificação e história.
- **23 regras de negócio** (`RN-001` a `RN-023`), agrupadas em cinco domínios —
  orçamento, dados financeiros, consentimento e privacidade, fronteira da IA e
  histórico — cada uma com casos de borda explícitos.
- **Épico de negócio** preenchido: visão, indicadores, personas, quatro jornadas,
  mapa RF→história, mapa RN→história, exclusões e riscos.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-018` — toda RN tem teste que a prova | Cria o lado esquerdo do rastreio: cada RN traz casos de borda que descrevem o teste esperado | `REGRAS-DE-NEGOCIO.md` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Todo item da `SDD-001` §6 virou RF ou RN | Aprovado | Mapa §6 da spec vs. catálogos |
| RF com persona, prioridade, verificação e história | Aprovado | Todas as 25 linhas |
| RN com casos de borda e RF restringidos | Aprovado | Todas as 23 linhas |
| Nenhum RF descreve solução técnica | Aprovado | Revisão linha a linha; nenhum cita framework, rota ou tabela |
| Toda RN é invertível por teste | Aprovado | Casos de borda descrevem o valor de fronteira (ex.: 70% exato é verde) |
| Épico com visão, personas, jornadas, mapa e riscos | Aprovado | `EPICO-NEGOCIO.md` §1 a §9 |
| Exclusões da spec repetidas no épico | Aprovado | `EPICO-NEGOCIO.md` §7 |
| Nenhum identificador reutilizado | Aprovado | Contagem única confere com a faixa |

## Evidência de verificação

```
$ grep -o "RF-[0-9]\{3\}" docs/requisitos/REQUISITOS-FUNCIONAIS.md | sort -u | wc -l
25

$ grep -o "RN-[0-9]\{3\}" docs/requisitos/REGRAS-DE-NEGOCIO.md | sort -u | wc -l
23
```

Identificadores únicos batem com as faixas declaradas (`RF-001` a `RF-025`,
`RN-001` a `RN-023`): nenhum número duplicado ou pulado.

## Testes

Não aplicável: história de documentação, sem comportamento executável. Dispensa
prevista em `tdd-bdd-before-implementation`.

A cobertura de teste dos requisitos aqui catalogados é obrigação das histórias
que os implementam, e o rastreio RN→teste é cobrado pelo `qa-agent` em cada uma.

## Refatoração feita após os funcionais verdes

Não aplicável. Consolidação durante a redação: as regras da fronteira da IA foram
agrupadas em uma seção própria (`RN-017` a `RN-021`) em vez de espalhadas entre
os temas, porque são o núcleo de risco do produto e precisam ser lidas juntas.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Não aplicável | Sem comportamento de produto |
| SRE | `sre-agent` | Não aplicável | Sem impacto de ambiente |
| Segurança | `security-specialist-agent` | Aprovado | `RN-012` a `RN-016` cobrem consentimento, isolamento entre pessoas e exclusão; `RN-017` a `RN-019` fecham a fronteira do não aconselhamento |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Nenhum RF antecipa implementação; RN são invariantes independentes de interface |
| Revisão final | `final-reviewer-agent` | Pendente | Aguarda autorização de commit e tag |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Faixas do semáforo com fronteira fechada (70% e 90% inclusive) | "Até 70%" é ambíguo; teste precisa de valor exato | `RN-001` define 70,00% verde e 90,01% vermelho |
| Categoria sem limite não é verde, é "sem limite" | Verde comunicaria segurança que não foi verificada | `RN-002`; afeta a UI de `HN-007` |
| Número exibido nunca vem do modelo de IA | Risco mais grave do produto: pessoa acreditar em valor inventado | `RN-019`; originou a história `HT-014` |
| Estorno e duplicidade viraram regra, não detalhe de implementação | Erram o orçamento inteiro se tratados como detalhe | `RN-007` e `RN-008` |
| `HN-012` (revogação) executada logo após `HN-002` | É a válvula de segurança do consentimento | Ordem 14 no kanban, apesar da chave alta |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Arquivos das histórias `HN-001` a `HN-012` não criados | Grooming acontece na entrada em `Ready`; detalhar agora seria adivinhação | `KANBAN-OFICIAL.md`, seção "Grooming" |
| Prioridades MoSCoW não negociadas com o orientador | Definidas pelo time nesta sessão | Revisar na primeira retrospectiva |

## Verificação de fechamento

- [x] Documentação criada e coerente
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico contém a chave `HT-002`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.3.0` aponta para o mesmo hash do commit
