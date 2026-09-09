---
name: entrega-ht-012
description: Documento de entrega da observabilidade mínima do ContaComigo — log estruturado em JSON, correlação por requisição e erro rastreável até a operação, sem dado pessoal.
document_type: delivery
story_key: HT-012
version: v0.20.0
max_lines: 300
---

# ENTREGA — `HT-012` — Observabilidade mínima: log estruturado e erro rastreável

- **Data:** 2026-09-08
- **Tipo:** Técnica
- **Versão:** `v0.20.0`
- **Commit:** `<hash do commit de fechamento>`
- **Tag:** `v0.20.0` → `<hash do commit de fechamento>`

## O que foi entregue

- **Contexto `observability`** no formato do `ADR-001`, com o domínio guardando
  a regra e a infraestrutura só transportando.
- **`domain/model/log-entry.ts`** — montagem da entrada de log e **redação
  recursiva** por nome de chave (`password`, `token`, `authorization`,
  `credential`, `email`, `name`, `description`, `amountInCents`, ...), incluindo
  redação de e-mail dentro da mensagem de erro. Puro TypeScript.
- **`domain/model/request-id.ts`** — a correlação como valor do domínio, com
  saneamento de caractere de controle e limite de tamanho.
- **`domain/port/driven/log-sink.ts`** e **`clock.ts`** — portas de saída.
- **`infrastructure/logging/json-log-sink.ts`** — uma linha JSON por evento em
  `stdout`, com corte por `LOG_LEVEL`; **`memory-log-sink.ts`** para teste.
- **`infrastructure/http/correlation.middleware.ts`** — gera o `x-request-id` ou
  preserva o recebido, e o devolve no cabeçalho da resposta.
- **`infrastructure/http/request-log.interceptor.ts`** — uma linha por
  requisição com método, rota, status e duração. Corpo e cabeçalho **não** entram.
- **`infrastructure/http/traceable-error.filter.ts`** — a falha vira linha
  `error` com a operação, e a resposta devolve o mesmo `requestId`. A mensagem
  interna fica só no log, já redigida.
- **`app.module.ts`** aplica o middleware em todas as rotas (antes da guarda:
  um 401 também é rastreável); **`main.ts`** registra interceptor e filtro
  globais e passa a anunciar o boot em JSON, sem `console.log`.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-008` — erro diagnosticável sem acesso à máquina | `requestId` na resposta e na linha de log, com `operation`, `route` e `status` | `observability.test.ts` (3 cenários) + log da API real |
| `RNF-015` — nenhum dado pessoal ou financeiro em log | Redação recursiva no domínio, aplicada a dados e à mensagem | `log-entry.test.ts` (8 cenários) + login real sem e-mail no log |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `x-request-id` na resposta, preservando o recebido | Aprovado | `curl` devolveu `correlacao-manual`; teste de fronteira |
| Uma linha JSON por requisição com os campos exigidos | Aprovado | `{"level":"info",...,"method":"GET","route":"/transactions","status":200,"durationMs":47}` |
| Falha rastreável pelo mesmo `requestId` | Aprovado | Corpo `{"estado":"erro","requestId":...}` e linha `warn`/`error` com `operation` |
| Redação recursiva provada | Aprovado | `log-entry.test.ts`: aninhado, array, caixa/acento/separador, ciclo |
| Redação no domínio, sem framework | Aprovado | `lint:boundaries` verde; nenhum import de `@nestjs/*` em `observability/domain/` |
| Suítes verdes | Aprovado | 177 unitários, 9 de integração, 3 funcionais |

## Evidência de verificação

Saída real da API em execução (`docs/tasks/HT-012/evidencia/20260908-log-estruturado-da-api-real.txt`):

```
$ curl -s -D - -o /dev/null http://localhost:3111/transactions
HTTP/1.1 401 Unauthorized
x-request-id: b01c1237-416f-47fd-9080-faa5e729db18

$ curl -s -H "x-request-id: correlacao-manual" http://localhost:3111/transactions/month-summary
{"estado":"erro","requestId":"correlacao-manual","message":"Unauthorized","statusCode":401}

# stdout da API
{"level":"info","message":"api ouvindo","requestId":"boot","timestamp":"2026-09-09T00:18:35.087Z", ...}
{"level":"warn","message":"Unauthorized","requestId":"b01c1237-416f-47fd-9080-faa5e729db18","timestamp":"2026-09-09T00:18:42.981Z","operation":"GET /transactions","status":401,"method":"GET","route":"/transactions","kind":"UnauthorizedException"}
{"level":"info","message":"requisicao concluida","requestId":"53fe96a2-cd72-43f8-908b-111fd85f0f71","timestamp":"2026-09-09T00:18:51.968Z","method":"POST","route":"/access/sessions","status":200,"durationMs":344}
```

A terceira linha é um **login bem-sucedido**: nem o e-mail nem a senha
enviados no corpo aparecem no log (`RNF-015`).

## Evidência de testes

```
$ scripts/harness.sh gates
 Test Files  32 passed (32)          # unitário
      Tests  177 passed (177)
 Test Files  2 passed (2)            # integração (PostgreSQL do compose)
      Tests  9 passed (9)
  3 passed (4.0s)                    # funcional (Playwright)
 Statements   : 98.66% ( 74/75 )     # cobertura de domain/
 Branches     : 91.89% ( 34/37 )
  [OK]    nenhum segredo detectado
  [OK]    nenhuma vulnerabilidade conhecida
harness: gates concluídos
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unit` | 177 testes verdes | +11 desta história |
| Integração | `pnpm run test:integration` | 9 testes verdes | PostgreSQL real |
| Funcional | `pnpm run test:functional` | 3 testes verdes | web real |
| Fronteiras | `pnpm run lint:boundaries` | verde | 220 módulos, 620 dependências |
| Segurança | `pnpm run security` | aprovada | gitleaks + osv-scanner |

## Refatoração feita após os funcionais verdes

Os tipos do `express` foram trocados por um `express-shapes.ts` local com a
forma mínima da requisição e da resposta. O `@types/express` não está instalado,
e adicioná-lo seria uma dependência nova para tipar quatro campos — o Nest já
isola o servidor concreto, e `lint:boundaries` reprovaria o import não resolvido.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 11 testes novos; correlação e redação provadas na fronteira e no domínio |
| SRE | `sre-agent` | Aprovado | API sobe, responde e emite log JSON legível por coletor; `LOG_LEVEL` corta ruído |
| Segurança | `security-specialist-agent` | Aprovado | `RNF-015` é critério de aceite testado; mensagem interna não vai ao cliente |
| Arquitetura | `architect-reviewer-agent` | Aprovado | `observability/domain/` sem framework; `depcruise` verde |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.20.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Sem `pino`/`winston` | JSON em `stdout` não justifica dependência nova | `HT-015` decide o coletor, não o formato |
| Redação por lista de bloqueio (nome de chave) | Lista de permissão esvaziaria o log e não diagnosticaria nada | Chave nova sensível entra na lista com teste |
| `requestId` no objeto de requisição | `AsyncLocalStorage` é estado implícito e atravessa a fronteira do `ADR-001` | Teste continua sem magia |
| Filtro devolve `requestId`, não a mensagem interna | A mensagem interna cita tabela, coluna e valor (`RNF-015`) | A pessoa relata o `requestId`; o log tem o resto |
| Interceptor e filtro como provider comum | O teste troca o sink pelo token sem subir o app inteiro | Padrão para o próximo contexto de infra |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Nenhum destino externo de log | PoC sem produção pública (`ADR-005`) | História `HT-015` |
| Sem métrica nem tracing distribuído | Fora do escopo declarado da história | `EPICO-TECNICO.md`, seção de observabilidade |
| Redação depende do nome da chave | Sem esquema por payload, é o critério disponível | Revisitar se um contexto novo trouxer campo sensível com nome atípico |

## Correções que precederam o fechamento

O gate `gates` estava reprovando por três motivos anteriores a esta história,
corrigidos antes do fechamento e entregues em versões próprias:

| Versão | Correção |
| --- | --- |
| `v0.19.6` | Migration de renomeação de colunas guardada — `criada_em` não existia e travava todo banco |
| `v0.19.7` | `.env` local exposto à varredura de segredo, reprovando o gate em toda máquina configurada |
| `v0.19.8` | `multer` 2.2.0 (transitivo do Nest) com quatro CVEs conhecidas |
| `v0.19.9` | `eslint` reprovando o `ConnectedBanksWidget` desde a ligação com a API real |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HT-012`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.20.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado
