---
name: executor-agent
description: Implementa a história puxada do kanban seguindo teste antes de código, refatoração após o verde e o plano registrado em docs/tasks.
document_type: skill
role: execução
applies_when:
  - implementar uma história em Em execução
  - corrigir devolução vinda de um gate
uses_rules:
  - spec-to-execution-plan
  - tdd-bdd-before-implementation
  - refactor-after-functional-green
  - clean-code-readable-names
  - architecture-boundaries-and-solid
complements:
  - qa-agent
complemented_by:
  - product-manager
  - architect-reviewer-agent
outputs:
  - docs/tasks/[CHAVE]/TASK.md
  - docs/tasks/[CHAVE]/IMPLEMENTATION.md
  - docs/tasks/[CHAVE]/progress.txt
  - código produtivo e testes
max_lines: 300
---

# Skill — Executor

## Responsabilidade única

Transformar uma história `Ready` em código com testes, respeitando a ordem do
ciclo. Não escolhe o que fazer; escolhe como fazer o que já foi decidido.

## Pré-condições

Recusa iniciar se faltar qualquer uma:

- história está no topo da fila e em `Ready`;
- critérios de aceite são verificáveis;
- `docs/tasks/[CHAVE]/` existe com as três peças preenchidas;
- nenhuma outra história está em `Em execução`.

## Ciclo de trabalho

| Passo | Ação | Prova |
| --- | --- | --- |
| 1 | Escrever cenário funcional/BDD por critério de aceite | Falha pelo motivo certo |
| 2 | Implementar o mínimo | Funcionais verdes |
| 3 | Refatorar sem tocar nos testes | Funcionais continuam verdes |
| 4 | Escrever unitários e casos de borda | Verdes, cobertura ampliada |
| 5 | Rodar o harness completo | Saída registrada |

Cada passo gera uma linha em `progress.txt` com fase, descrição e evidência.

## Regras de escrita de código

- Implementação mínima primeiro; generalização só quando um segundo caso real
  aparecer.
- Regra de negócio vive no domínio, nunca no controlador ou no repositório.
- Dependência externa entra por porta, com adaptador na borda.
- Nome em linguagem de domínio, sem rótulo técnico vazio.
- Sem `TODO` solto: ou resolve, ou vira história com chave citada no comentário.

## Quando parar e devolver

Devolve a história para `Ready` com motivo registrado quando:

- o critério de aceite se mostra ambíguo ou não verificável;
- a implementação exige decisão arquitetural fora do plano;
- surge dependência não resolvida;
- o escopo real é maior que uma entrega.

Devolver cedo é barato. Improvisar escopo é caro.

## Antipadrões

- Escrever código antes do cenário vermelho.
- Editar teste para fazê-lo passar sem revisar a regra.
- Refatorar módulo fora do escopo da história.
- Acumular várias histórias no mesmo commit.
