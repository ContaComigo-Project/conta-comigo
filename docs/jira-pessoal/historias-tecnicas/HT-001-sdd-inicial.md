---
name: ht-001-sdd-inicial
description: História técnica para conduzir a sessão de spec-driven-development inicial e registrar o entendimento que originará requisitos e histórias.
document_type: story
story_key: HT-001
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-001` — Conduzir SDD-001 e registrar entendimento inicial

- **Tipo:** História técnica (governança/descoberta)
- **Épico:** `EPIC-TEC-001`
- **Estado:** Ready — **próxima demanda**
- **Requisitos:** origina `RF`, `RN` e `RNF`
- **Depende de:** `HT-000`
- **Versão prevista:** `v0.2.0`

## Problema técnico

Os catálogos de requisitos e os épicos estão vazios por decisão do time. Sem
entendimento registrado, qualquer história escrita agora seria palpite, e o
kanban ficaria com uma fila que ninguém consegue defender.

## Resultado esperado

Uma especificação `SDD-001` aprovada, com problema, personas, escopo, limites e
decisões em aberto — suficiente para que `HT-002` e `HT-003` derivem requisitos
verificáveis, e para que o épico de negócio deixe de ser esqueleto.

## Critérios de aceite

- [ ] Existe `docs/spec-driven-development/SDD-001-<assunto>.md` com todas as
      seções do template preenchidas
- [ ] O problema está descrito com evidência, não com opinião
- [ ] Existem no mínimo duas personas com objetivo e dor
- [ ] A seção "Fora de escopo" lista pelo menos três exclusões explícitas
- [ ] Toda decisão em aberto tem responsável e prazo
- [ ] A seção "Quebra proposta" classifica cada item em `HN` ou `HT`
- [ ] A spec está marcada como `Aprovada` com data e autores
- [ ] `EPICO-NEGOCIO.md` teve, no mínimo, visão e personas preenchidas
- [ ] `KANBAN-OFICIAL.md` recebeu as histórias derivadas, em ordem

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| _(a catalogar em `HT-003`)_ | Rastreabilidade de escopo | Toda história futura aponta para uma seção da `SDD-001` |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | História de entendimento |
| Dependências externas | Não | — |
| Contratos públicos | Não | — |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Spec vira documento longo e genérico | Limite de 300 linhas e seção de exclusões obrigatória | Reescrever a spec; nada foi implementado ainda |
| Decisões travadas por falta de definição | Toda decisão em aberto tem dono e prazo | Registrar como premissa e seguir, revisando depois |
| Time descrever solução em vez de problema | Revisão pela skill `product-manager` antes de aprovar | Reabrir a seção 1 da spec |

## Fora de escopo

- Escrever requisitos numerados (é `HT-002` e `HT-003`)
- Escolher tecnologia (é `HT-004`)
- Qualquer implementação

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Não | Avaliada quando houver dado definido |
| Arquitetura | Sim | Valida se a quebra proposta é coerente |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] `SDD-001` aprovada e versionada
- [ ] Épico de negócio atualizado
- [ ] Histórias derivadas criadas e ordenadas no kanban
- [ ] `docs/entregas/ENTREGA-HT-001-*.md` criado
- [ ] Commit semântico citando `HT-001`
- [ ] Tag `v0.2.0` no mesmo hash
