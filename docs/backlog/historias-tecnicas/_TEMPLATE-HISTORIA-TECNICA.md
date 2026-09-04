---
name: template-historia-tecnica
description: Template de história técnica com critérios de aceite verificáveis, rastreio a RNF e evidência operacional.
document_type: template
applies_when:
  - criar uma história de infraestrutura, qualidade, segurança, CI/CD, operação, observabilidade ou governança
max_lines: 300
---

# `HT-XXX` — [Título curto e objetivo]

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Backlog | Ready | Em execução | Em revisão | Done
- **Requisitos:** `RNF-XXX` (e `RF-XXX` quando a história habilita um comportamento)
- **Depende de:** [chaves ou —]
- **Versão prevista:** `vX.Y.Z`

## Problema técnico

[Qual limitação, risco ou custo existe hoje. Evidência de que o problema é real.]

## Resultado esperado

[Qual capacidade passa a existir e quem se beneficia — time, operação ou usuário final.]

## Critérios de aceite

Critério técnico também é verificável. Prefira comando reprodutível a descrição.

- [ ] `[comando do harness]` executa e retorna sucesso em máquina limpa
- [ ] [métrica] atinge [alvo] medido por [método]
- [ ] Falha esperada é detectada: [como provamos que o gate realmente bloqueia]

```gherkin
Cenário: [comportamento operacional, quando aplicável]
  Dado [estado do ambiente]
  Quando [comando ou evento]
  Então [resultado verificável]
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-XXX` | | |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | | |
| Dependências externas | | |
| Contratos públicos | | |
| Dados e migração | | |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| | | |

## Fora de escopo

- [o que esta história não faz]

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | | |
| SRE | Sim | |
| Segurança | | |
| Arquitetura | | |
| Revisão final | Sim | |

## Definição de pronto

- [ ] Comportamento testável coberto por cenário funcional antes do código
- [ ] Refatoração feita após os funcionais verdes
- [ ] Testes unitários onde houver lógica
- [ ] Gates marcados acima executados com evidência
- [ ] Documentação operacional atualizada
- [ ] `docs/entregas/` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-XXX` e tag no mesmo hash
