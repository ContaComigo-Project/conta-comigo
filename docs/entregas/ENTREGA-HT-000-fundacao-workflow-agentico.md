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
- **Commit da estrutura:** `5e38950` — 50 arquivos, 3.208 linhas
- **Commit de fechamento:** `1a2f863`
- **Tag:** `v0.1.0` → `1a2f863`

## Exceção registrada

A estrutura desta história foi commitada em `5e38950` com a mensagem
`docs: create AI bases workflow`, que **não segue o padrão exigido pela rule
`main-push-quality-and-versioning`**: não está no formato
`tipo(escopo): descrição (CHAVE)` e não cita `HT-000`.

Motivo: o commit foi feito antes de a própria rule existir no repositório —
ela nasceu dentro dele. Reescrever o histórico para corrigir seria pior que a
falha, porque o commit pode já ter sido compartilhado.

Consequência assumida: `scripts/verificar-fechamento.sh v0.1.0` aponta a
divergência se apontado para `5e38950`. A tag `v0.1.0` marca o **commit de
fechamento** — aquele que registra esta exceção e move a história para `Done` —
e não o commit que trouxe os arquivos. Esta é a única entrega do projeto em que
os dois são commits diferentes.

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
$ ls .agents/rules/*.md | grep -v README | wc -l
7
$ ls .agents/skills/*.md | grep -v README | wc -l
8
$ find .agents -name '*.md' | while read f; do wc -l < "$f"; done | sort -n | tail -1
83
$ bash scripts/harness.sh test; echo "exit=$?"
harness: scripts/harness.env não existe.
harness: copie scripts/harness.env.example e preencha os comandos.
exit=2
```

Os scripts foram exercitados nos quatro caminhos de falha previstos
(sem `harness.env`, com `harness.env` vazio, tarefa inválida, chave de história
inválida) e retornaram os códigos de saída corretos.

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
| Revisão final | `final-reviewer-agent` | Aprovado | Fechada com a exceção de commit registrada acima |

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
- [x] Commit de fechamento contém a chave `HT-000`
- [!] Commit da estrutura (`5e38950`) não cita a chave — exceção registrada acima
- [x] Commit não contém arquivos de outra história
- [x] Tag `v0.1.0` aponta para o commit de fechamento
