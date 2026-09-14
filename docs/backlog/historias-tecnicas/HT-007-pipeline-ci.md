---
name: ht-007-pipeline-ci
description: História técnica — pipeline de CI com gates bloqueantes no GitHub Actions, rodando os mesmos comandos do harness local.
document_type: story
story_key: HT-007
story_type: tecnica
epic: EPIC-TEC-001
status: Em execução
max_lines: 300
---

# `HT-007` — Pipeline de CI com gates bloqueantes

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Em execução**
- **Requisitos:** `RNF-021` (gates bloqueiam de fato), `RNF-007` (mesmo comando local e CI)
- **Depende de:** `HT-006` (infra de testes) — concluída
- **Versão prevista:** `v0.26.0`

## Problema técnico

Os gates só rodam localmente (`harness gates` verde desde `HT-006`). `RNF-021`
exige que o gate **bloqueie de verdade** — e isso só é provado numa pipeline que
roda a cada push/PR, com o mesmo comando que roda na máquina de quem desenvolve
(`RNF-007`). Sem CI, um merge quebrado depende de disciplina, não de verificação.

## Resultado esperado

Workflow no GitHub Actions que roda, em push para `develop`/`main` e em PR:
`setup` → `lint` (fronteiras) → `test:unit` → `test:integration` → `test:functional`
→ `security` → `coverage` → `build`. Qualquer falha **bloqueia** o merge
(proteção de branch no GitHub).

## Critérios de aceite

- [ ] `.github/workflows/ci.yml` existe e usa os comandos do harness (`pnpm run …`)
- [ ] O workflow roda em `push` e `pull_request`
- [ ] A falha de qualquer step faz o job falhar (sem `continue-on-error`)
- [ ] O Postgres de integração sobe (docker compose) dentro do job
- [ ] `JWT_SECRET` e `ENCRYPTION_KEY` definidos como envs de teste no job
- [ ] Proteção de branch no GitHub exige o check passar (ação de quem gerencia o repo)
- [ ] **PR de prova**: um PR que viola uma fronteira (`@nestjs/common` em `domain/`)
      tem o check reprovado e o merge bloqueado — evidência em `docs/tasks/HT-007/evidencia/`

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-021` | Gates bloqueiam de fato | O job falha em qualquer violação; PR de prova mostra o bloqueio |
| `RNF-007` | Mesmo comando local e CI | O workflow chama os mesmos `pnpm run …` do harness |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| CI/infra | Sim | `.github/workflows/ci.yml` novo |
| Código | Não | — |
| Dependências | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| CI divergir do local | Mesmos comandos do harness (`RNF-007`) | Corrigir o workflow |
| Setup demorar (docker/playwright) | `pnpm run setup` com cache de pnpm | Ajustar steps |

## Fora de escopo

- Publicação/deploy (é `HT-015`)
- Proteção de branch (ação de quem gerencia o repo, documentada aqui)

## Gates aplicáveis

QA (paridade local/CI), SRE (o gate), Segurança (security no CI), Arquitetura (fronteiras no CI), Revisão final.

## Definição de pronto

- [ ] Workflow criado e commitado
- [ ] `docs/entregas/ENTREGA-HT-007-pipeline-ci.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado (HT-007 fora de "adiada")
- [ ] PR de prova e proteção de branch registrados como pendência de quem gerencia o repo
- [ ] Commit semântico citando `HT-007` e tag `v0.26.0` no mesmo hash