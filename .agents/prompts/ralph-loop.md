---
name: ralph-loop
description: Prompt operacional do ciclo Perceber, Orientar, Decidir, Agir e Registrar aplicado a uma história do kanban oficial.
document_type: prompt
applies_when:
  - iniciar ou retomar a execução de uma história
  - decidir qual skill aciona a próxima ação
max_lines: 300
---

# Ralph Loop

Ciclo de execução de uma história. Uma volta por ação relevante; nunca pule
`Registrar`, é ela que torna a próxima volta possível.

```
PERCEBER -> ORIENTAR -> DECIDIR -> AGIR -> REGISTRAR
    ^                                          |
    +------------------------------------------+
```

## 1. Perceber

Ler, nesta ordem, sem presumir memória:

- `docs/jira-pessoal/KANBAN-OFICIAL.md` — qual é a próxima demanda
- o arquivo da história (`HN-XXX` ou `HT-XXX`)
- `docs/tasks/[CHAVE]/progress.txt` — o que já foi feito
- entregas relacionadas em `docs/entregas/`
- rules citadas pela etapa atual

Saída: uma frase sobre o estado real, não o estado esperado.

## 2. Orientar

Comparar:

| Dimensão | Pergunta |
| --- | --- |
| Critérios de aceite | O que ainda não está provado? |
| Rules | Qual restrição se aplica à próxima ação? |
| Riscos | O que pode dar errado e qual o custo? |
| Dependências | Falta algo fora do meu alcance? |

## 3. Decidir

Escolher **uma** próxima ação e a skill responsável:

| Situação | Skill |
| --- | --- |
| Escopo ambíguo ou história mal formada | `product-manager` |
| Falta cenário funcional ou implementação | `executor-agent` |
| Implementação verde, falta provar qualidade | `qa-agent` |
| Toca ambiente, pipeline ou operação | `sre-agent` |
| Toca autenticação, dado sensível ou segredo | `security-specialist-agent` |
| Introduz módulo, contrato ou padrão | `architect-reviewer-agent` |
| Gates concluídos | `final-reviewer-agent` |
| Fechamento aprovado | `git-operator` |

Uma ação por volta. Duas frentes simultâneas violam `spec-to-execution-plan`.

## 4. Agir

Executar a ação com a menor unidade possível de mudança. Se durante a ação
surgir trabalho novo, ele não é feito agora: vira história no `Backlog`.

## 5. Registrar

Sempre, e no mesmo momento:

- linha em `docs/tasks/[CHAVE]/progress.txt` com fase, ação e evidência;
- atualização do `IMPLEMENTATION.md` se o plano mudou;
- atualização do `KANBAN-OFICIAL.md` se o estado mudou;
- documento em `docs/entregas/` no fechamento;
- commit semântico e tag no mesmo hash no fechamento.

## Critério de saída do loop

O loop termina quando a história está em `Done` com evidência, ou quando foi
devolvida a `Ready` com o motivo registrado. Não termina por cansaço nem por
"parece pronto".
