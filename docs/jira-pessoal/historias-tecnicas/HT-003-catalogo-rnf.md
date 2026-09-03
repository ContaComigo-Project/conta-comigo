---
name: ht-003-catalogo-rnf
description: História técnica para transformar restrições da SDD-001 em requisitos não funcionais com métrica e alvo, e preencher o épico técnico.
document_type: story
story_key: HT-003
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-003` — Catalogar RNF e preencher o épico técnico

- **Tipo:** História técnica (governança)
- **Épico:** `EPIC-TEC-001`
- **Estado:** Em revisão — aguarda commit e tag `v0.4.0`
- **Requisitos:** origina `RNF-001` a `RNF-021`
- **Depende de:** `HT-001`
- **Versão prevista:** `v0.4.0`

## Problema técnico

As restrições do projeto — custo zero, dado sensível, free tier, três estudantes
em tempo parcial — estão descritas como contexto, não como alvo verificável.
Restrição sem número não bloqueia nada: no primeiro aperto, "o sistema deve ser
seguro" e "deve ser rápido" são interpretados como já atendidos.

## Resultado esperado

Toda restrição relevante vira um `RNF-XXX` com métrica, alvo e forma de medição,
e o épico técnico passa a dizer quais decisões estão tomadas, quais estão em
aberto e quem as resolve.

## Critérios de aceite

- [x] Todo RNF tem métrica, alvo e método de medição
- [x] Nenhum RNF é adjetivo sem número ("rápido", "seguro", "escalável")
- [x] Alvo que ainda depende de decisão do time está marcado como pendente e tem história dona
- [x] Cada RNF aponta a história que o implementa
- [x] O épico técnico distingue decisão tomada de decisão em aberto
- [x] O épico técnico declara a ordem obrigatória dos testes e a regra de rastreio RN→teste
- [x] Categorias deliberadamente sem RNF nesta fase estão listadas com justificativa

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-021 | Gates bloqueiam de fato | Define o que cada gate mede; sem isso o gate não tem critério |
| RNF-019 | Cobertura ≥ 80% no domínio | Fixa o número antes de existir código, evitando calibrar a régua pelo resultado |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Documenta a fronteira exigida; não a implementa |
| Dependências externas | Não | Registra Pluggy e Gemini como decisões já tomadas, ainda não implementadas |
| Contratos públicos | Não | — |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Alvo numérico inventado sem base | Alvos sem base declarados como pendentes de calibração | Ajustar na história que implementa |
| RNF exigente demais para uma PoC sem orçamento | Categorias sem RNF listadas explicitamente (SLA, escala, DR) | Rebaixar alvo com decisão registrada |
| Catálogo virar documentação morta | Cada RNF aponta história dona; gate cobra o número | Revisar na retrospectiva |

## Fora de escopo

- Escolher as tecnologias em aberto (é `HT-004`)
- Implementar qualquer verificação automatizada dos RNF (é `HT-006` e `HT-007`)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Sim | `RNF-005` a `RNF-011` definem reprodutibilidade, resiliência e custo |
| Segurança | Sim | `RNF-012` a `RNF-017` definem a baseline de proteção |
| Arquitetura | Sim | `RNF-020` define a exigência de adapters trocáveis |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] `REQUISITOS-NAO-FUNCIONAIS.md` preenchido com métrica e alvo
- [x] `EPICO-TECNICO.md` preenchido, com decisões tomadas e em aberto
- [x] `docs/entregas/ENTREGA-HT-003-catalogo-rnf.md` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-003`
- [ ] Tag `v0.4.0` no mesmo hash
