---
name: refactor-after-functional-green
description: Exige uma etapa explícita de refatoração depois que os testes funcionais ficam verdes e antes do fechamento da história.
document_type: rule
severity: bloqueante
applies_when:
  - concluir a implementação mínima de uma história
  - preparar a entrega para revisão final
complements:
  - clean-code-readable-names
  - architecture-boundaries-and-solid
complemented_by:
  - tdd-bdd-before-implementation
max_lines: 300
---

# Regra — Refatorar Depois do Verde Funcional

## Intenção

O código que faz o teste passar é a primeira versão que funciona, não a versão
que fica. A refatoração é a etapa em que o custo da próxima história é decidido.

## Obrigações

1. Refatoração acontece **depois** dos funcionais verdes e **antes** dos
   unitários de ampliação de cobertura.
2. Refatoração **não altera comportamento**: os mesmos testes funcionais
   continuam verdes, sem edição nos testes.
3. Se um teste precisou mudar, não foi refatoração — foi mudança de
   comportamento, e volta para o ciclo de `tdd-bdd-before-implementation`.
4. O que foi refatorado é registrado no documento de entrega. "Nada foi
   refatorado" só é aceito com justificativa explícita.

## Alvos típicos

| Alvo | Sinal |
| --- | --- |
| Duplicação | A mesma decisão em dois lugares |
| Função longa | Faz mais de uma coisa em níveis de abstração diferentes |
| Nome provisório | `data`, `handle`, `process`, `temp`, `aux` |
| Condicional aninhada | Três níveis ou mais |
| Vazamento de fronteira | Domínio conhecendo detalhe de infraestrutura |
| Comentário explicando o "o quê" | O código deveria dizer isso sozinho |

## Limite

A refatoração é da área tocada pela história. Reescrever módulo vizinho "já que
estou aqui" viola o isolamento de commit exigido por
`main-push-quality-and-versioning` e vira história própria.
