---
name: implementation-ht-012
description: Plano técnico de HT-012 — contexto observability com redação no domínio, correlação por requisição e erro rastreável.
document_type: implementation_plan
applies_when:
  - implementar a história HT-012
max_lines: 300
---

# IMPLEMENTATION — `HT-012`

- **Requisitos ligados:** `RNF-008`, `RNF-015`
- **Versão prevista:** `v0.20.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Um contexto novo, `observability`, no formato de `ADR-001`. O domínio guarda o
que é regra: como uma entrada de log é montada e **quais chaves são redigidas**
antes de sair. A redação é recursiva e opera por nome de chave (`password`,
`senha`, `token`, `authorization`, `email`, `credential`, `amountInCents`,
`description`, entre outras), porque é o único critério disponível sem conhecer
o formato de cada payload — e erra para o lado seguro: chave com nome sensível
some, chave inocente permanece.

O transporte é Nest puro. Um middleware cria (ou aproveita de `x-request-id`) o
identificador de correlação e o devolve no cabeçalho; um interceptor mede a
duração e emite a linha da requisição; um filtro de exceção transforma falha em
linha `error` com a operação (`MÉTODO /rota`) e devolve o `requestId` ao cliente.
A escrita concreta fica atrás da porta `LogSink`, com adaptador JSON para
`stdout` e adaptador em memória para teste.

O `requestId` viaja no objeto de requisição, não em estado global: sem
`AsyncLocalStorage`, sem singleton mutável.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| `pino` / `winston` | Dependência nova para escrever JSON em `stdout`; o valor da história é a redação e a correlação, não a biblioteca |
| Redação por lista de permissão | Cada payload novo teria de ser cadastrado; o log ficaria vazio por padrão e não diagnosticaria nada |
| `AsyncLocalStorage` para propagar o `requestId` | Estado implícito atravessa a fronteira do `ADR-001` e dificulta o teste; a requisição já é o portador natural |
| Registrar o corpo da requisição | `RNF-015` proíbe; rota, status e duração bastam para diagnosticar |

## 3. Fronteiras e design

- Módulos tocados: `observability` (novo), `app.module.ts`, `main.ts`
- Contratos novos ou alterados: a resposta de erro passa a carregar `requestId`
- Dependências que entram: nenhuma — `crypto.randomUUID` do Node

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenário HTTP: correlação e erro rastreável | Vermelho antes do código |
| 2 | Middleware, interceptor, filtro e sink mínimos | Verde |
| 3 | Refatoração da redação para recursiva | Continua verde |
| 4 | Unitários de redação: aninhado, array, chave desconhecida | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Resposta devolve `x-request-id` e preserva o recebido | `RNF-008` | `observability.test.ts` |
| Falha vira linha `error` com o mesmo `requestId` e a operação | `RNF-008` | `observability.test.ts` |
| Senha, e-mail, token e valor não aparecem na saída | `RNF-015` | `log-entry.test.ts` |
| Redação atravessa objeto aninhado e array | `RNF-015` | `log-entry.test.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `pnpm run test:unit`, `pnpm run test:integration` |
| SRE | Sim | Linha de log real capturada na evidência |
| Segurança | Sim | Teste de redação e `pnpm run security` |
| Arquitetura | Sim | `pnpm run lint:boundaries` com o contexto novo |
| Revisão final | Sim | `scripts/verificar-fechamento.sh v0.20.0` |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Redação por nome de chave deixar passar um campo | Média | Lista explícita e testada; casos de borda no unitário |
| Log poluir a saída dos testes | Alta | Sink em memória nos testes; `logger: false` onde o log não é o alvo |
| `requestId` do cliente ser tratado como confiança | Baixa | Serve só para correlação, nunca para autorização |

## 7. Plano de reversão

Remover o `ObservabilityModule` do `app.module.ts` e o filtro global do
`main.ts`. Nenhum dado migrado, nenhum contrato de leitura alterado: o
comportamento volta ao anterior em um commit de revert.

## 8. Fechamento

- Mensagem de commit prevista: `feat(observability): structured log with request correlation (HT-012)`
- Tag prevista: `v0.20.0` apontando para o commit de fechamento
