---
name: test-evidence-quality
description: Garante que os testes provem regra de negócio real e que a evidência registrada seja verificável, não decorativa.
document_type: rule
severity: bloqueante
applies_when:
  - revisar uma suíte de testes no gate de QA
  - registrar evidência em documento de entrega
complements:
  - tdd-bdd-before-implementation
complemented_by:
  - main-push-quality-and-versioning
max_lines: 300
---

# Regra — Qualidade da Evidência de Teste

## Intenção

Cobertura alta com asserção fraca é pior que cobertura baixa honesta: produz
confiança sem base. Teste existe para provar regra, não para pintar o pipeline
de verde.

## Obrigações

1. **Toda RN citada pela história tem pelo menos um teste que falharia se a
   regra fosse quebrada.** Este é o critério central.
2. **Asserção específica.** Verificar o valor esperado, não apenas "não lançou
   exceção" ou "respondeu 200".
3. **Casos de borda presentes:** vazio, limite inferior, limite superior,
   duplicado, inválido e concorrente quando aplicável.
4. **Evidência é saída real.** O documento de entrega contém a saída do comando,
   copiada, não reescrita à mão nem resumida como "tudo passou".
5. **Teste que não pode falhar é dívida.** Se nenhuma mutação plausível do
   código o quebra, ele não prova nada.

## Anti-reward-hacking

Proibido, mesmo que deixe o gate verde:

| Prática | Por que é proibida |
| --- | --- |
| Ajustar a asserção ao valor que o código produziu | Inverte a direção da prova |
| Marcar teste como skip para destravar entrega | Esconde regressão |
| Mockar o próprio objeto sob teste | Testa o mock, não o sistema |
| Testar somente o caminho feliz | Deixa a regra sem defesa |
| Inflar cobertura com testes de acessores | Aumenta o número sem aumentar segurança |
| Afrouxar o limiar de cobertura para passar | Move a régua em vez do trabalho |

## Verificação no gate

Escolher uma RN e perguntar: *qual teste quebra se eu inverter esta regra?*
Sem resposta com caminho de arquivo e nome de teste, o gate reprova.
