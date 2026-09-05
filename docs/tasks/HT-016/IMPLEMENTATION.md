---
name: implementation-ht-016
description: Plano técnico da história HT-016 — como o inventário do frontend é produzido, as RN-024/025 resolvidas e o escopo das HNs revisado.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HT-016
max_lines: 300
---

# IMPLEMENTATION — `HT-016`

- **Requisitos ligados:** `RF-001` a `RF-024`, `RN-001`, `RN-006`, `RN-024`, `RN-025`
- **Versão prevista:** `v0.6.0`
- **Tipo de mudança:** MINOR (capacidade nova compatível em `0.x`)

## 1. Abordagem

O inventário é produzido por análise estática do `frontend/src`, sem tocar em
código. Para cada arquivo de componente (.tsx) registra-se caminho, `RF`
servido, classificação e motivo. Para cada mock, classifica-se o destino (vira
contrato de dados, vira massa de teste, ou descarta) e extrai-se a regra de
negócio embutida com arquivo+linha. Regras observadas fora dos mocks (views e
hooks) também entram. As decisões `RN-024` e `RN-025` são resolvidas com
justificativa no catálogo. O resultado alimenta `HT-017` (contrato) e `HT-018`
(remoção da lógica do frontend).

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Teste de caracterização sobre os mocks | Decisão da história: código que será apagado não recebe teste; mocks são fonte de observação, não especificação |
| Reescrever/limpar código durante o inventário | Fora de escopo declarado; a correção é `HT-017`/`HT-018` |

## 3. Fronteiras e design

- Módulos tocados: `docs/inventario-frontend.md`, `docs/requisitos/`, `docs/backlog/`, `docs/tasks/HT-016/`, `docs/entregas/`
- Contratos novos ou alterados: nenhum contrato de software
- Dependências que entram: **nenhuma**

## 4. Estratégia de testes

Sem comportamento executável: história de análise e documentação. A
verificação é pelos critérios de aceite conferidos no gate de revisão final;
a prova de "nenhuma regra escondida" é o inventário apontar arquivo+linha para
cada regra observada.

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Conferir critérios de aceite contra `docs/inventario-frontend.md` | Todos marcados |
| 2 | Conferir que `RN-024`/`RN-025` saíram de Rascunho | Catálogo atualizado |
| 3 | Rodar `bash scripts/verificar-fechamento.sh` após commit+tag | Verde |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Nenhuma regra de negócio fica escondida no frontend | — (documental) | `docs/inventario-frontend.md` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Sim | Inventário varreu credenciais, `console.log` de credenciais e identidade real em mocks |
| Arquitetura | Sim | Localiza regra de negócio fora do domínio |
| Revisão final | Sim | Critérios de aceite + evidências |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Inventário virar lista morta | Média | Cada linha exige classificação e motivo |
| Preservar regra por inércia | Média | `RN-024`/`RN-025` resolvidas com decisão explícita |
| Escopo escondido nas telas | Média | Componente sem `RF` vira decisão registrada no inventário |

## 7. Plano de reversão

Nenhum código é alterado. Reverter é apagar `docs/inventario-frontend.md` e
reverter as linhas de `RN-024`/`RN-025` no catálogo.

## 8. Fechamento

- Mensagem de commit prevista: `docs(web): inventory existing frontend and mock rules (HT-016)`
- Tag prevista: `v0.6.0` apontando para o commit de fechamento