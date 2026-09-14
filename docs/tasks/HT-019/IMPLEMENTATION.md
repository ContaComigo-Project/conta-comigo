---
name: implementation-ht-019
description: Plano técnico da história HT-019 — como o Swagger/OpenAPI é instalado e configurado sem quebrar fronteiras.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HT-019
max_lines: 300
---

# IMPLEMENTATION — `HT-019`

- **Requisitos ligados:** `RNF-008`, `RNF-021`
- **Versão prevista:** `v0.15.0`
- **Tipo de mudança:** MINOR (capacidade nova compatível)

## 1. Abordagem

`@nestjs/swagger` entra como dependência do backend. A configuração
(`DocumentBuilder` + `SwaggerModule.createDocument` + `setup('api/docs', …,
{ jsonDocumentUrl: 'api-json' })`) mora em `backend/src/openapi.ts` — arquivo
global de infraestrutura, no mesmo nível de `app.module.ts` — e é chamada pelo
`main.ts` e pelo teste de controle. Os controllers recebem decorators Swagger
(`@ApiTags`, `@ApiBody`, `@ApiBearerAuth`, `@ApiResponse`) na camada
`infrastructure/http/` (permitido por `ADR-001`). Os body schemas são derivados
dos schemas zod do `@contacomigo/contrato` via `toJSONSchema()` (zod 4 → JSON
Schema 2020-12, compatível com OpenAPI 3.1) — assim a spec nunca diverge do
contrato. Teste antes de código: um teste de controle sobe o Nest em porta
efêmera e verifica `/api/docs` 200 e `/api-json` com os 6 paths.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Classes DTO com `@ApiProperty` duplicadas no backend | Duplicaria o contrato; a fonte única é `@contacomigo/contrato` (zod) |
| `nestjs-zod` / plugin extra | Dependência a mais sem necessidade; `toJSONSchema()` nativo do zod 4 resolve |
| `SwaggerModule.setup` no caminho padrão `/api/docs-json` | Critério exige `/api-json`; `jsonDocumentUrl` customiza sem controller extra |

## 3. Fronteiras e design

- Módulos tocados: `backend/src/openapi.ts` (novo, global), `main.ts`,
  controllers `acesso` e `lancamentos` (só `infrastructure/http/`)
- Contratos novos: `/api/docs` e `/api-json` (documentação, não dados)
- Dependências que entram: `@nestjs/swagger` (documentação de transporte; não
  toca `domain/` nem `application/`)

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Teste de controle: `/api/docs` 200 e `/api-json` com os 6 paths + Bearer nos lancamentos | Vermelho antes do código |
| 2 | Instalar `@nestjs/swagger`, configurar `openapi.ts`, `main.ts`, anotar controllers | Teste verde |
| 3 | Refatoração | Continua verde |
| 4 | `lint:boundaries`, `typecheck`, suíte unitária completa | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| A API é descoberta pela própria documentação (spec lista os 6 endpoints) | — (controle, sem RN) | `backend/src/openapi.test.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `openapi.test.ts` verde; `/api/docs` e `/api-json` 200 |
| SRE | Sim | `pnpm run build` (typecheck) verde; `lint:boundaries` verde |
| Segurança | Sim | Bearer documentado nos lancamentos; nenhum dado exposto pela UI de docs |
| Arquitetura | Sim | `@nestjs/swagger` só em `infrastructure/http/`; `domain/` intacto |
| Revisão final | Sim | Critérios de aceite + evidências |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Decorator Swagger vazar para o domínio | Baixa | `lint:boundaries` bloqueia import fora de `infrastructure/` |
| Spec divergir do contrato | Média | Teste de controle compara os paths; schemas gerados do zod |
| `@nestjs/swagger` incompatível com NestJS 12 | Baixa | Versão mais recente do pacote; ajustar se peer dep reclamar |

## 7. Plano de reversão

Remover `@nestjs/swagger`, `backend/src/openapi.ts` e os decorators dos
controllers. Nenhuma rota de negócio muda; a API volta ao estado anterior.

## 8. Fechamento

- Mensagem de commit prevista: `feat(api): document endpoints with OpenAPI/Swagger (HT-019)`
- Tag prevista: `v0.15.0` apontando para o commit de fechamento