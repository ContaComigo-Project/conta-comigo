---
name: entrega-ht-000
description: Documento de entrega da fundação do workflow agêntico — estrutura de governança, kanban, épicos, templates, rules, skills e harness.
document_type: delivery
story_key: HT-000
version: v0.1.0
max_lines: 300
---

# ENTREGA — `HT-000` — Fundação do workflow agêntico

- **Data:** 2026-09-01
- **Tipo:** Técnica
- **Versão:** `v0.1.0`
- **Commit:** _(pendente — aguardando autorização de fechamento)_
- **Tag:** `v0.1.0` → _(pendente)_

## O que foi entregue

O esqueleto de execução do projeto: uma fila oficial única, dois épicos,
separação entre histórias de negócio e técnicas, templates de planejamento e
entrega, sete rules de processo, oito skills de papel, um harness local e um
verificador de fechamento.

Nenhum código de produto foi implementado, e nenhum requisito funcional ou não
funcional foi definido — por decisão do time, isso é feito a partir de `HT-001`.

## Estrutura criada

| Caminho | Conteúdo |
| --- | --- |
| `docs/spec-driven-development/` | Índice e template de spec |
| `docs/requisitos/` | Catálogos `RF`, `RNF`, `RN` (vazios, com regras de preenchimento) |
| `docs/jira-pessoal/` | `KANBAN-OFICIAL.md`, épico de negócio, épico técnico |
| `docs/jira-pessoal/historias/` | Template de história de negócio |
| `docs/jira-pessoal/historias-tecnicas/` | Template + `HT-000` e `HT-001` |
| `docs/tasks/_TEMPLATE/` | `TASK.md`, `IMPLEMENTATION.md`, `progress.txt` |
| `docs/entregas/` | Índice e template de entrega |
| `.agents/rules/` | 7 rules bloqueantes/recomendadas |
| `.agents/skills/` | 8 skills de papel |
| `.agents/prompts/` | Ralph Loop |
| `scripts/` | Harness, criação de task, verificação de fechamento |
| `docs/WORKFLOW-AGENTICO.md` | README operacional |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Kanban oficial como fonte única | Aprovado | `docs/jira-pessoal/KANBAN-OFICIAL.md` com fila e próxima demanda |
| Épicos de negócio e técnico | Aprovado | `EPICO-NEGOCIO.md`, `EPICO-TECNICO.md` |
| Separação negócio/técnico | Aprovado | Diretórios e templates distintos |
| Templates de execução | Aprovado | `docs/tasks/_TEMPLATE/` |
| 7 rules com frontmatter e ≤ 300 linhas | Aprovado | Ver tabela de verificação abaixo |
| 8 skills com frontmatter e ≤ 300 linhas | Aprovado | Ver tabela de verificação abaixo |
| Complemento declarado entre rules e skills | Aprovado | Campos `complements` / `complemented_by` |
| Harness reprodutível | Aprovado | `scripts/harness.sh`, `scripts/harness.ps1` |
| Verificação de commit e tag | Aprovado | `scripts/verificar-fechamento.sh` |
| README operacional | Aprovado | `docs/WORKFLOW-AGENTICO.md` |
| Nenhum produto implementado | Aprovado | Nenhum arquivo em `frontend/` ou `backend/` alterado |

## Evidência de verificação

```
(preencher com a saída de:)
  bash scripts/verificar-estrutura.sh          # se criado em HT-005
  git status --short
```

Verificação executada nesta entrega, por inspeção:

| Item | Contagem | Limite |
| --- | --- | --- |
| Rules com frontmatter | 7/7 | — |
| Skills com frontmatter | 8/8 | — |
| Arquivo mais longo em `.agents/` | < 300 linhas | 300 |

## Testes

Não aplicável: a história não introduz comportamento executável de produto.
A dispensa está declarada na história, conforme
`tdd-bdd-before-implementation` (seção "Quando não se aplica").

O comportamento executável introduzido — os scripts — é validado em `HT-005`,
quando o harness passa a ter comandos reais para exercitar.

## Refatoração feita após os funcionais verdes

Não aplicável nesta história. Consolidações feitas durante a redação:
índices em `rules/`, `skills/` e `prompts/` para evitar duplicação de
convenções em cada arquivo.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Não aplicável | Sem comportamento de produto |
| SRE | `sre-agent` | Aprovado com ressalva | Harness existe mas ainda sem comandos; falha explícita é intencional. Ressalva vira `HT-005` |
| Segurança | `security-specialist-agent` | Não aplicável | Sem superfície nova, sem dado sensível, sem segredo |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Rules com responsabilidade única e complemento declarado |
| Revisão final | `final-reviewer-agent` | Pendente | Aguarda autorização de commit e tag |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Rules e skills em `.agents/`, não em `.claude/` | O workflow é independente de ferramenta de IA | Se o time quiser acionar por `/skill` no Claude Code, cria-se espelho em `.claude/skills/` |
| Catálogos de requisitos criados vazios | Requisitos são decisão do time, feita em `HT-001`–`HT-003` | Nenhuma história de produto entra em `Ready` antes disso |
| Harness falha em vez de assumir stack | Stack indefinida; um harness silencioso mentiria | `HT-004` decide stack, `HT-005` preenche comandos |
| Chaves `HN-XXX` e `HT-XXX` com três dígitos | Ordenação estável e legível | Limite prático de 999 histórias por tipo |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Harness sem comandos reais | Stack ainda não decidida | `HT-005` no kanban |
| Épicos e catálogos como esqueleto | Requisitos são do time | `HT-001`, `HT-002`, `HT-003` |
| Sem CI validando as rules | Sem stack e sem pipeline | `HT-007` |

## Verificação de fechamento

- [x] Documentação criada e coerente
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico contém a chave `HT-000`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.1.0` aponta para o mesmo hash do commit
