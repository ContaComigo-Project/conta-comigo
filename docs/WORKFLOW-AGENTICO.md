---
name: workflow-agentico
description: README operacional do workflow agêntico — como puxar, executar, validar, documentar e fechar uma história.
document_type: operational_doc
applies_when:
  - iniciar a primeira história do projeto
  - retomar o trabalho sem lembrar do processo
max_lines: 300
---

# Workflow Agêntico — Guia Operacional

O produto muda conforme o domínio. Este processo não muda: kanban oficial,
história pequena, teste primeiro, refatoração, gates, entrega documentada,
commit semântico e tag no mesmo hash.

## Mapa

| Preciso de… | Vá para |
| --- | --- |
| Saber o que fazer agora | [`docs/jira-pessoal/KANBAN-OFICIAL.md`](./jira-pessoal/KANBAN-OFICIAL.md) |
| Entender o produto | [`docs/jira-pessoal/EPICO-NEGOCIO.md`](./jira-pessoal/EPICO-NEGOCIO.md) |
| Entender o sistema | [`docs/jira-pessoal/EPICO-TECNICO.md`](./jira-pessoal/EPICO-TECNICO.md) |
| Consultar requisito | [`docs/requisitos/`](./requisitos/) |
| Registrar entendimento | [`docs/spec-driven-development/`](./spec-driven-development/) |
| Saber o que é proibido | [`.agents/rules/`](../.agents/rules/) |
| Saber quem faz o quê | [`.agents/skills/`](../.agents/skills/) |
| Rodar qualquer coisa | [`scripts/README.md`](../scripts/README.md) |
| Ver o que já foi entregue | [`docs/entregas/`](./entregas/) |

## Ciclo de uma história

```
1. PUXAR      kanban -> item Ready de menor ordem  (WIP = 1)
2. PLANEJAR   scripts/nova-historia.sh HT-XXX
              preencher TASK.md e IMPLEMENTATION.md
3. TESTAR     cenário funcional/BDD escrito e VERMELHO
4. IMPLEMENTAR código mínimo até ficar verde
5. REFATORAR  com os funcionais verdes, sem tocar nos testes
6. COBRIR     testes unitários e casos de borda
7. VALIDAR    gates marcados na história
8. DOCUMENTAR docs/entregas/ENTREGA-HT-XXX-*.md
9. FECHAR     commit semântico (CHAVE) + tag vX.Y.Z no mesmo hash
10. ATUALIZAR kanban: Done + histórico
```

Cada passo é uma volta do [Ralph Loop](../.agents/prompts/ralph-loop.md):
Perceber → Orientar → Decidir → Agir → **Registrar**.

## Como iniciar a primeira história

A próxima demanda é **`HT-001` — Conduzir SDD-001 e registrar entendimento
inicial**.

```bash
# 1. Confirmar a próxima demanda
cat docs/jira-pessoal/KANBAN-OFICIAL.md

# 2. Ler a história
cat docs/jira-pessoal/historias-tecnicas/HT-001-sdd-inicial.md

# 3. Criar a pasta de execução
scripts/nova-historia.sh HT-001        # Windows: powershell -File scripts/nova-historia.ps1 HT-001

# 4. Preencher TASK.md e IMPLEMENTATION.md ANTES de qualquer trabalho

# 5. Mover HT-001 para "Em execução" no kanban
```

Depois, com o time: copiar `docs/spec-driven-development/SDD-000-template.md`
para `SDD-001-<assunto>.md` e preencher. Ao aprovar a spec, `HT-002` e `HT-003`
transformam o entendimento em `RF`, `RN` e `RNF` numerados — e só então o
backlog de produto passa a existir.

## Negócio ou técnica?

| Pergunta | Tipo |
| --- | --- |
| Alguém percebe a mudança usando o sistema? | `HN-XXX` — história de negócio |
| É infraestrutura, qualidade, segurança, CI/CD, operação, publicação, observabilidade ou governança? | `HT-XXX` — história técnica |
| As duas coisas? | Duas histórias |

## Gates

| Gate | Skill | Aciona quando |
| --- | --- | --- |
| QA | `qa-agent` | Sempre que houver comportamento testável |
| SRE | `sre-agent` | Ambiente, build, pipeline, publicação, operação |
| Segurança | `security-specialist-agent` | Autenticação, autorização, dado pessoal, segredo, integração |
| Arquitetura | `architect-reviewer-agent` | Módulo, contrato, dependência ou padrão novo |
| Revisão final | `final-reviewer-agent` | Sempre, antes do commit de entrega |

Gate reprovado devolve a história para `Em execução` com a lista do que falta.

## Fechamento

```bash
git status --short                    # inspecionar antes de qualquer add
git add <caminhos da história>        # staging seletivo, nunca -A
git diff --cached --stat              # conferir o que vai no commit
git commit -m "feat(escopo): descrição no imperativo (HT-XXX)"
git tag -a v0.2.0 -m "HT-XXX — título da entrega"
scripts/verificar-fechamento.sh v0.2.0
```

| Regra | Consequência de violar |
| --- | --- |
| Testes quebrados | Push para `main` bloqueado |
| Commit misturando histórias | Reversão deixa de ser possível; entrega rejeitada |
| Tag em hash diferente | A tag deixa de identificar a entrega |
| `Done` sem documento de entrega | História volta para `Em revisão` |

## Convenções rápidas

| Item | Formato |
| --- | --- |
| História de negócio | `HN-XXX` |
| História técnica | `HT-XXX` |
| Requisito funcional | `RF-XXX` |
| Requisito não funcional | `RNF-XXX` |
| Regra de negócio | `RN-XXX` |
| Commit | `tipo(escopo): descrição (CHAVE)` |
| Versão | `vMAJOR.MINOR.PATCH` |
| Rule / skill / prompt | frontmatter + responsabilidade única + ≤ 300 linhas |

## Nota sobre ferramenta

Rules e skills vivem em `.agents/` porque descrevem o processo do time, não a
configuração de um assistente específico. Para acioná-las como skills nativas do
Claude Code, crie espelhos em `.claude/skills/<nome>/SKILL.md` apontando para o
arquivo canônico em `.agents/skills/`.
