---
name: ht-000-fundacao-workflow-agentico
description: História técnica de fundação — estrutura de governança agêntica, kanban oficial, épicos, templates, rules, skills e harness.
document_type: story
story_key: HT-000
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-000` — Fundação do workflow agêntico

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Em revisão
- **Requisitos:** governança de entrega (RNF a catalogar em `HT-003`)
- **Depende de:** —
- **Versão prevista:** `v0.1.0`

## Problema técnico

O projeto não tem processo de execução declarado: não existe fonte única da
próxima demanda, nem separação entre negócio e técnico, nem critério objetivo
para uma entrega ser considerada concluída. Sem isso, cada história é executada
de um jeito e a qualidade depende de quem estiver no teclado.

## Resultado esperado

Qualquer pessoa do time — ou agente — consegue responder sem perguntar:
qual é a próxima demanda, o que precisa ser provado, quem valida, e o que
caracteriza o fechamento.

## Critérios de aceite

- [x] Existe `docs/backlog/KANBAN-OFICIAL.md` como fonte única, com fila
      cronológica e próxima demanda explícita
- [x] Existem épico de negócio e épico técnico, ainda que como esqueleto
- [x] Histórias de negócio e técnicas têm diretórios e templates separados
- [x] Existem catálogos de `RF`, `RNF` e `RN` prontos para preenchimento
- [x] Existem templates de task, plano de implementação, progresso e entrega
- [x] Existem 7 rules com frontmatter, responsabilidade única e ≤ 300 linhas
- [x] Existem 8 skills com frontmatter, responsabilidade única e ≤ 300 linhas
- [x] Rules e skills declaram complemento mútuo (`complements` / `complemented_by`)
- [x] Existe harness local com comandos reprodutíveis e falha explícita quando
      não configurado
- [x] Existe script que valida commit semântico, chave da história e tag no
      mesmo hash
- [x] Existe README operacional explicando como iniciar a primeira história
- [x] Nenhum código de produto foi implementado nesta história

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-021 | Gates bloqueiam de fato | Cria as rules e os gates que as histórias seguintes executam |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Nenhum código de produto tocado |
| Dependências externas | Não | Scripts usam apenas bash/PowerShell e git |
| Contratos públicos | Não | — |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Processo pesado demais para o tamanho do time | Gates são marcados por história, não obrigatórios em todas | Ajustar as rules; são texto versionado |
| Estrutura vira documentação morta | `spec-to-execution-plan` amarra execução ao kanban | Revisar na retrospectiva da primeira entrega de produto |

## Fora de escopo

- Definir requisitos funcionais e não funcionais (é `HT-002` e `HT-003`)
- Escolher stack (é `HT-004`)
- Configurar CI (é `HT-007`)
- Implementar qualquer comportamento de produto

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento executável de produto |
| SRE | Sim | Harness e scripts de fechamento |
| Segurança | Não | Sem superfície nova nem dado sensível |
| Arquitetura | Sim | Define fronteiras do processo e das rules |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Documentação criada e coerente entre si
- [x] Scripts falham de forma explícita quando não configurados
- [x] `docs/entregas/ENTREGA-HT-000-fundacao-workflow-agentico.md` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-000`
- [ ] Tag `v0.1.0` apontando para o mesmo hash
