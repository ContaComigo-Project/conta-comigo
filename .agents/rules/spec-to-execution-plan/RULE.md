---
name: spec-to-execution-plan
description: Estabelece o KANBAN-OFICIAL como única fonte de execução e o spec-driven-development como insumo complementar, nunca como fila paralela.
document_type: rule
severity: bloqueante
applies_when:
  - escolher a próxima demanda a executar
  - transformar entendimento de spec em histórias executáveis
complements:
  - main-push-quality-and-versioning
  - architecture-boundaries-and-solid
complemented_by:
  - tdd-bdd-before-implementation
max_lines: 300
---

# Regra — Da Spec ao Plano de Execução

## Intenção

Duas filas concorrentes produzem trabalho órfão: alguém executa a spec, outro
executa o kanban, e ninguém sabe o que está entregue. Existe uma fila só.

## Obrigações

1. **`docs/backlog/KANBAN-OFICIAL.md` é a única fonte da próxima demanda.**
   Nenhuma execução começa por spec, conversa, ideia ou item de outro quadro.
2. **SDD não é fila.** A spec alimenta requisitos, épicos e histórias. Ela
   complementa a história oficial; nunca a substitui.
3. **História só entra em `Ready` com:** critérios de aceite verificáveis,
   pelo menos um `RF`, `RN` ou `RNF` citado, e dependências resolvidas.
4. **Antes de implementar**, existir `docs/tasks/[CHAVE]/` com `TASK.md`,
   `IMPLEMENTATION.md` e `progress.txt`.
5. **Limite de WIP: 1.** Uma história em `Em execução` por vez. Bloqueio devolve
   a história a `Ready` com o motivo registrado, e não abre uma segunda frente.
6. **Descoberta durante a execução não vira escopo.** Achado relevante vira
   história nova no `Backlog`, com a chave registrada no `progress.txt`.
7. **Ordem cronológica é respeitada.** Puxar item fora de ordem exige registrar
   no kanban por que a ordem mudou.

## Fluxo obrigatório

```
SDD  ->  requisitos (RF/RNF/RN)  ->  épico  ->  história  ->  KANBAN (Ready)
                                                                  |
                                                       docs/tasks/[CHAVE]/
                                                                  |
                                             ciclo Ralph: Perceber .. Registrar
                                                                  |
                                              docs/entregas/ + commit + tag
```

## O que reprova

| Situação | Consequência |
| --- | --- |
| Código sem história correspondente no kanban | Trabalho não é aceito na entrega |
| História em `Em execução` sem pasta em `docs/tasks/` | Volta para `Ready` |
| Duas histórias em execução simultânea | A segunda é devolvida |
| Critério de aceite não verificável | História não sai de `Backlog` |
