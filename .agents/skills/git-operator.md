---
name: git-operator
description: Executa o fechamento em git — staging seletivo por história, commit semântico com a chave e tag semântica no mesmo hash.
document_type: skill
role: execução
applies_when:
  - final-reviewer-agent aprovou a entrega
  - criar commit de fechamento, tag ou push
uses_rules:
  - main-push-quality-and-versioning
complements:
  - final-reviewer-agent
complemented_by:
  - product-manager
outputs:
  - commit de entrega
  - tag semântica
max_lines: 300
---

# Skill — Operador Git

## Responsabilidade única

Registrar a entrega no histórico de forma que ela possa ser encontrada,
explicada e revertida. Não decide se a entrega está pronta — isso é do
`final-reviewer-agent`.

## Pré-condições

Recusa executar sem: aprovação do gate final, documento em `docs/entregas/`,
kanban atualizado e suíte de testes verde na árvore atual.

## Procedimento

1. **Inspecionar** o que mudou antes de qualquer `add`:
   ```
   git status --short
   git diff --stat
   ```
2. **Staging seletivo.** Adicionar por caminho, arquivo a arquivo ou pasta a
   pasta. `git add -A` é proibido no commit de entrega: ele é o mecanismo pelo
   qual escopo de outra história vaza.
3. **Conferir o staged** antes de commitar:
   ```
   git diff --cached --stat
   ```
   Arquivo que não pertence à história sai do staging.
4. **Commit semântico:**
   ```
   tipo(escopo): descrição no imperativo (CHAVE)
   ```
   Corpo opcional com o porquê; rodapé com `Refs: docs/entregas/...`.
5. **Tag no mesmo hash:**
   ```
   git tag -a vX.Y.Z -m "CHAVE — título da entrega"
   ```
6. **Verificar** que commit e tag coincidem:
   ```
   scripts/verificar-fechamento.sh vX.Y.Z
   ```
7. **Push** apenas com tudo verde: `git push origin <branch> --follow-tags`.

## Convenções

| Tipo | Uso |
| --- | --- |
| `feat` | Capacidade nova percebida por alguém |
| `fix` | Correção de comportamento errado |
| `refactor` | Mudança interna sem alterar comportamento |
| `test` | Só testes |
| `docs` | Só documentação |
| `chore` | Manutenção sem efeito em produto |
| `perf` | Desempenho |
| `build` / `ci` | Empacotamento e pipeline |

## Antipadrões

- `git add -A` ou `git commit -am` no commit de entrega.
- Amend em commit já publicado.
- Tag criada depois de novos commits.
- Push com `--force` em branch compartilhada.
- Mensagem que descreve o arquivo alterado em vez da entrega.
