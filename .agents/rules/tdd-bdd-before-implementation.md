---
name: tdd-bdd-before-implementation
description: Exige cenário funcional/BDD escrito e vermelho antes de qualquer código produtivo quando houver comportamento testável.
document_type: rule
severity: bloqueante
applies_when:
  - iniciar a implementação de uma história com comportamento observável
  - revisar se a ordem de trabalho respeitou teste antes de código
complements:
  - test-evidence-quality
complemented_by:
  - refactor-after-functional-green
  - main-push-quality-and-versioning
max_lines: 300
---

# Regra — Teste Funcional/BDD Antes da Implementação

## Intenção

Teste escrito antes é especificação executável. Escrito depois, ele tende a
descrever o que o código faz — inclusive o que ele faz de errado.

## Obrigações

1. Todo critério de aceite com comportamento observável vira um cenário
   funcional/BDD **antes** do código produtivo.
2. O cenário precisa ser visto **falhando pelo motivo certo** antes de existir
   implementação. Falha por erro de sintaxe ou import não conta.
3. A evidência do vermelho é registrada em `docs/tasks/[CHAVE]/progress.txt`.
4. Só então entra o código produtivo mínimo para passar.
5. O cenário usa linguagem de domínio: `Dado/Quando/Então` falando do negócio,
   não de tabelas, endpoints ou classes internas.

## Quando não se aplica

A regra exige comportamento testável. Estão dispensadas:

- alterações puramente textuais de documentação;
- ajustes de formatação sem mudança de comportamento;
- exploração descartável (spike), desde que o código do spike não seja
  promovido a produção sem refazer o ciclo.

Dispensa é declarada na história, não presumida.

## Formato esperado

```gherkin
Cenário: cliente não pode sacar acima do saldo disponível
  Dado uma conta com saldo de 100
  Quando o cliente solicita saque de 150
  Então o saque é recusado
  E o saldo permanece 100
```

## Sinais de violação

| Sintoma | Diagnóstico |
| --- | --- |
| Todos os testes nasceram verdes | Foram escritos depois do código |
| Cenário cita nome de classe ou rota | Testa implementação, não comportamento |
| `progress.txt` sem registro do vermelho | A ordem não foi respeitada ou não foi provada |
