---
name: implementation-hn-008
description: Plano técnico de implementação de uma história, com ordem de testes, gates e riscos, escrito antes do código.
document_type: template
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HN-008`

- **Requisitos ligados:** `RF-XXX`, `RN-XXX`, `RNF-XXX`
- **Versão prevista:** `vX.Y.Z`
- **Tipo de mudança:** MAJOR | MINOR | PATCH

## 1. Abordagem

[Como será resolvido, em 5 a 15 linhas. Decisão, não narrativa.]

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| | |

## 3. Fronteiras e design

- Módulos tocados: [lista]
- Contratos novos ou alterados: [lista]
- Dependências que entram: [lista + justificativa]

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenário funcional/BDD por critério de aceite | Vermelho antes do código |
| 2 | Implementação mínima | Funcionais verdes |
| 3 | Refatoração | Funcionais continuam verdes |
| 4 | Testes unitários e casos de borda | Verdes, cobertura ampliada |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| | `RN-XXX` | |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | | |
| SRE | | |
| Segurança | | |
| Arquitetura | | |
| Revisão final | Sim | |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| | | |

## 7. Plano de reversão

[Como desfazer se der errado em produção ou no ambiente do time.]

## 8. Fechamento

- Mensagem de commit prevista: `tipo(escopo): descrição (CHAVE)`
- Tag prevista: `vX.Y.Z` apontando para o commit de fechamento
