---
name: workflow-agentico
description: README operacional do workflow agêntico — como puxar, executar, validar, documentar e fechar uma história.
document_type: operational_doc
applies_when:
  - iniciar a próxima história do projeto
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
| Saber o que fazer agora | [`docs/backlog/KANBAN-OFICIAL.md`](./backlog/KANBAN-OFICIAL.md) |
| Entender o produto | [`docs/backlog/EPICO-NEGOCIO.md`](./backlog/EPICO-NEGOCIO.md) |
| Entender o sistema | [`docs/backlog/EPICO-TECNICO.md`](./backlog/EPICO-TECNICO.md) |
| Consultar requisito | [`docs/requisitos/`](./requisitos/) |
| Saber por que o projeto é assim | [`docs/adr/`](./adr/) |
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
7. VALIDAR    gates da história + code-reviewer-agent (diff limpo)
8. DOCUMENTAR docs/entregas/ENTREGA-HT-XXX-*.md
9. FECHAR     final-reviewer-agent -> commit-crafter-agent (staging seletivo)
              -> git-operator: commit semântico (CHAVE) + tag no mesmo hash
10. ATUALIZAR kanban: Done + histórico
```

Cada passo é uma volta do [Ralph Loop](../.agents/prompts/ralph-loop/PROMPT.md):
Perceber → Orientar → Decidir → Agir → **Registrar**.

## Como iniciar a próxima história

Hoje a coluna `Ready` do kanban está **vazia** — `HT-016` (Ordem 5) foi a última
concluída. O próximo da fila é **`HT-005` — Harness local reprodutível com
docker compose** (Ordem 6, ainda em `Backlog`), e ele precisa ser groomado antes
de ser puxado.

```bash
# 1. Confirmar a próxima demanda
cat docs/backlog/KANBAN-OFICIAL.md

# 2. Groomar: escrever o arquivo da história com critérios verificáveis
cp docs/backlog/historias-tecnicas/_TEMPLATE-HISTORIA-TECNICA.md docs/backlog/historias-tecnicas/HT-005-harness-local.md

# 3. Mover HT-005 de "Backlog" para "Ready" no kanban

# 4. Criar a pasta de execução
scripts/nova-historia.sh HT-005        # Windows: powershell -File scripts/nova-historia.ps1 HT-005

# 5. Preencher TASK.md e IMPLEMENTATION.md ANTES de qualquer trabalho

# 6. Mover HT-005 para "Em execução" no kanban
```

`HT-005` destrava toda a fila: enquanto `scripts/harness.env` não existir,
qualquer tarefa de `scripts/harness.sh` — inclusive `gates` — falha com
"comando não configurado", e nenhuma história com código pode provar qualidade.

Da ordem 6 em diante, o item só ganha arquivo de história quando entra em
`Ready`. Detalhar hoje o critério de aceite da ordem 27 seria adivinhação.

## Negócio ou técnica?

| Pergunta | Tipo |
| --- | --- |
| Alguém percebe a mudança usando o sistema? | `HN-XXX` — história de negócio |
| É infraestrutura, qualidade, segurança, CI/CD, operação, publicação, observabilidade ou governança? | `HT-XXX` — história técnica |
| As duas coisas? | Duas histórias |

## Gates e Revisão

| Gate / Papel | Skill | Aciona quando |
| --- | --- | --- |
| QA | `qa-agent` | Sempre que houver comportamento testável |
| SRE | `sre-agent` | Ambiente, build, pipeline, publicação, operação |
| Segurança | `security-specialist-agent` | Autenticação, autorização, dado pessoal, segredo, integração |
| Arquitetura | `architect-reviewer-agent` | Módulo, contrato, dependência ou padrão novo |
| Revisão de Diff | `code-reviewer-agent` | Inspecionar diff linha a linha (bugs, segredos, prints, clean code) |
| Revisão Final | `final-reviewer-agent` | Sempre, antes do commit de entrega (cruza critérios e gates) |
| Preparo de Commit | `commit-crafter-agent` | Staging seletivo e composição da mensagem em inglês + rodapé de IA |
| Operador Git | `git-operator` | Execução do commit e emissão de tag no mesmo hash |

Gate reprovado devolve a história para `Em execução` com a lista do que falta.

## Fechamento

```bash
git status --short                    # inspecionar antes de qualquer add
git add <caminhos da história>        # staging seletivo, nunca -A
git diff --cached --stat              # conferir o que vai no commit
scripts/validar-staging.sh            # Windows: powershell -File scripts/validar-staging.ps1
git commit -m "feat(scope): imperative description (HT-XXX)"
git tag -a v0.2.0 -m "HT-XXX — título da entrega"
scripts/verificar-fechamento.sh v0.2.0 # Windows: powershell -File scripts/verificar-fechamento.ps1 v0.2.0
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
| Commit | `type(scope): imperative description (KEY)` |
| Versão | `vMAJOR.MINOR.PATCH` |
| Rule / skill / prompt | frontmatter + responsabilidade única + ≤ 300 linhas |

## Nota sobre ferramenta

Rules e skills vivem **exclusivamente** em `.agents/` porque descrevem o processo
do time (versão git, compartilhada pela equipe), não a configuração de um
assistente ou IDE específicos.

Se uma IDE específica só ler atalhos de caminhos locais particulares
(ex: Claude Code, Cursor, Trae), crie **na sua máquina** — sem versionar —
cópias de conveniência apontando para os arquivos canônicos em `.agents/`.
O que vale para a equipe é sempre o que está em `.agents/*` e `docs/*`.
