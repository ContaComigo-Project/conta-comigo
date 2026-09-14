---
name: implementation-ht-014
description: Plano técnico de HT-014 — guarda de saída da IA como decorador da porta, com as regras no domínio.
document_type: implementation_plan
applies_when:
  - implementar a história HT-014
max_lines: 300
---

# IMPLEMENTATION — `HT-014`

- **Requisitos ligados:** `RNF-017`, `RN-017`, `RN-019`, `RN-021`
- **Versão prevista:** `v0.22.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Mais um decorador da porta `AiAdvisor`, na posição em que a proteção vale para
qualquer provedor e para qualquer história futura da Fase 4:

```
Capped -> Cached -> Guarded -> Resilient -> (Gemini | Falso)
```

`Guarded` fica **abaixo** do cache de propósito: resposta reprovada nunca é
guardada, e resposta guardada já passou pelos três exames — não se paga
validação duas vezes pelo mesmo texto.

As regras são funções puras no domínio, com uma decisão explícita sobre **quais
números** são comparados: só **valores monetários** — os que aparecem com `R$`
ou com duas casas decimais. Contagem ("3 categorias"), mês ("em janeiro") e
porcentagem ("40% do total") passam. Comparar todo número transformaria "você
tem 3 contas conectadas" em bloqueio, e uma guarda que bloqueia tudo é
desligada na primeira semana.

A comparação normaliza formato antes de comparar: `1.284,32`, `R$ 1284,32` e
`1284.32` viram o mesmo inteiro em centavos. Os valores permitidos saem dos
`dados` do pedido — o mesmo consolidado que a tela exibe (`RN-019`).

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Confiar no prompt ("não cite valores") | Prompt é pedido, não garantia; `RNF-017` trata a saída como entrada não confiável |
| Pedir ao modelo que valide a própria resposta | Dobra o custo e continua confiando na mesma fonte |
| Comparar todo número do texto | Bloquearia contagem, data e porcentagem; a guarda viraria ruído |
| Reescrever a resposta com o valor certo | Inventar texto em nome do modelo é pior que bloquear; a tela sabe degradar |
| Guarda acima do cache | Validaria o mesmo texto a cada leitura e permitiria guardar resposta reprovada |

## 3. Fronteiras e design

- Módulos tocados: `intelligence` (regras e decorador), módulo do contexto
- Contratos novos ou alterados: motivo de falha `resposta-bloqueada`
- Dependências que entram: nenhuma

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Provedor adulterado citando valor inexistente | Vermelho antes do código |
| 2 | Regras e decorador mínimos | Verde |
| 3 | Refatoração da extração de valores | Continua verde |
| 4 | Unitários: formato, termos proibidos, casos de borda | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Valor divergente do consolidado bloqueia | `RN-019` | `output-guard.test.ts`, `guarded-advisor.test.ts` |
| Valor exato, em qualquer formato, passa | `RN-019` | `output-guard.test.ts` |
| Contagem e porcentagem não bloqueiam | `RN-019` (limite declarado) | `output-guard.test.ts` |
| Recomendação de produto bloqueia | `RN-017` | `output-guard.test.ts` |
| Resposta vazia, gigante ou com código bloqueia | `RNF-017` | `output-guard.test.ts` |
| Bloqueio é falha, não exceção | `RN-021` | `guarded-advisor.test.ts` |
| Resposta bloqueada não entra no cache | `RNF-010` + `RNF-017` | `guarded-advisor.test.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `scripts/harness.sh gates` |
| SRE | Sim | Motivo do bloqueio visível no log sem despejar o texto |
| Segurança | Sim | Saída não confiável é superfície de ataque |
| Arquitetura | Sim | Posição na pilha; `lint:boundaries` |
| Revisão final | Sim | `scripts/verificar-fechamento.sh v0.22.0` |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Falso positivo bloquear resposta boa | Média | Só valor monetário é comparado; lista de termos é de produto, não de assunto |
| Falso negativo deixar passar valor inventado sem `R$` | Média | Duas casas decimais também contam como monetário; documentado como limite |
| Texto enorme no log | Baixa | O motivo carrega amostra curta, não o texto inteiro |

## 7. Plano de reversão

Tirar o `GuardedAdvisor` da pilha em `intelligence.module.ts`. Nenhuma tela
consome a porta ainda, então a reversão não tem efeito visível.

## 8. Fechamento

- Mensagem de commit prevista: `feat(intelligence): guard the model output before it reaches a screen (HT-014)`
- Tag prevista: `v0.22.0` apontando para o commit de fechamento
