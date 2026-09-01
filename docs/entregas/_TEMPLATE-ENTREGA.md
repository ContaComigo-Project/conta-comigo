---
name: template-entrega
description: Template de documento de entrega, com evidência de validação, gates executados e rastreio de commit e tag.
document_type: template
applies_when:
  - concluir uma história e movê-la para Done
max_lines: 300
---

# ENTREGA — `[CHAVE]` — [Título]

- **Data:** [AAAA-MM-DD]
- **Tipo:** Negócio | Técnica
- **Versão:** `vX.Y.Z`
- **Commit:** `[hash]`
- **Tag:** `vX.Y.Z` → `[mesmo hash]`

## O que foi entregue

[Em linguagem de negócio quando HN, em linguagem operacional quando HT.]

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF/RN/RNF-XXX` | | |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| | Aprovado/Reprovado | |

## Evidência de testes

```
[saída real do comando de testes — não parafraseada]
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Funcional/BDD | | | |
| Unitário | | | |

## Refatoração feita após os funcionais verdes

[O que foi limpo e por quê. "Nada" é uma resposta válida apenas com justificativa.]

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | | |
| SRE | `sre-agent` | | |
| Segurança | `security-specialist-agent` | | |
| Arquitetura | `architect-reviewer-agent` | | |
| Revisão final | `final-reviewer-agent` | | |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| | | |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `[CHAVE]`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `vX.Y.Z` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado
