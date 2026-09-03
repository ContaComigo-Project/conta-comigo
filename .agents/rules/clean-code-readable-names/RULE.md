---
name: clean-code-readable-names
description: Impõe nomes claros em linguagem de domínio e proíbe rótulos técnicos, abreviações opacas e sufixos genéricos.
document_type: rule
severity: recomendada-forte
applies_when:
  - escrever ou revisar código produtivo, testes e documentação
  - refatorar após o verde funcional
complements:
  - refactor-after-functional-green
complemented_by:
  - architecture-boundaries-and-solid
max_lines: 300
---

# Regra — Nomes Legíveis em Linguagem de Domínio

## Intenção

O nome é a única documentação que nunca fica desatualizada em relação ao código
que ela nomeia. Quem lê o código deveria reconhecer o negócio nele, sem tradução.

## Obrigações

1. **Linguagem do domínio.** O nome que o time usa na conversa é o nome que
   aparece no código. Se o time diz "fatura", o código não diz `bill`, `doc` nem
   `registro`.
2. **Sem rótulo técnico vazio.** Evitar `Manager`, `Helper`, `Util`, `Handler`,
   `Data`, `Info`, `Service` genérico. Se o nome só faz sentido com o sufixo,
   a responsabilidade ainda não foi entendida.
3. **Sem abreviação opaca.** `qtdTrsAtv` não economiza nada relevante.
   Abreviação só quando é o termo do domínio (`CPF`, `IBAN`, `SLA`).
4. **Booleano afirma.** `estaAtivo`, `podeSacar` — não `flag`, `status2`, `notX`.
5. **Função é verbo, coisa é substantivo.** O nome diz o que a função faz, não
   como ela faz.
6. **Nome de teste descreve a regra**, não o método testado:
   `recusa_saque_acima_do_saldo` em vez de `testSaque2`.
7. **Comentário explica o porquê.** Comentário que explica o "o quê" é sinal de
   nome ruim; corrija o nome e apague o comentário.

## Consistência

Um conceito, um nome, em todo o projeto: código, testes, documentos, mensagens
de commit e histórias. Sinônimo espalhado (`cliente`, `usuário`, `pessoa` para a
mesma entidade) é dívida de comunicação.

## Idioma

O projeto escolhe **um** idioma para o domínio e mantém. Termo técnico
consagrado da linguagem ou do framework permanece no original.
