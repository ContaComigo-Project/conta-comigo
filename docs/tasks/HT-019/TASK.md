---
name: task-ht-019
description: Recorte executável da história HT-019 — documentar a API existente com OpenAPI/Swagger sem quebrar as fronteiras de ADR-001.
document_type: task
applies_when:
  - executar a história HT-019
max_lines: 300
---

# TASK — `HT-019`

- **História:** [`docs/backlog/historias-tecnicas/HT-019-swagger-openapi.md`](../../backlog/historias-tecnicas/HT-019-swagger-openapi.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

Expor UI Swagger em `/api/docs` e spec OpenAPI em `/api-json` documentando os 6
endpoints existentes, com schemas derivados dos DTOs do `@contacomigo/contrato`,
sem quebrar o gate de fronteiras (`ADR-001`).

## Critérios de aceite copiados da história

- [ ] `GET /api-json` responde 200 com spec válida
- [ ] `GET /api/docs` responde 200 (UI Swagger)
- [ ] A spec lista os 6 endpoints (`POST /acesso/contas`, `POST /acesso/sessoes`,
      `POST /acesso/sessoes/renovacao`, `DELETE /acesso/sessoes`,
      `GET /lancamentos`, `GET /lancamentos/resumo-do-mes`)
- [ ] Schemas derivados dos tipos do `@contacomigo/contrato`
- [ ] Endpoints de `lancamentos` documentam a exigência de autenticação (Bearer)
- [ ] `pnpm run lint:fronteiras` verde — `@nestjs/swagger` só em `infrastructure/http/`
- [ ] Teste de controle prova que a spec lista os 6 endpoints e `/api/docs` responde

## Escopo desta task

**Dentro:**

- Instalar `@nestjs/swagger` no backend
- Criar `backend/src/openapi.ts` (configuração Swagger, exportada para teste)
- Ajustar `backend/src/main.ts` para chamar a configuração
- Anotar `AcessoController` e `LancamentosController` (tags, body schemas, Bearer)
- Teste de controle em `backend/src/openapi.test.ts` (spec + UI)

**Fora:**

- Autenticar a UI do Swagger
- Documentar histórias futuras (`HN-002` em diante)
- Alterar DTOs do contrato

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/package.json` | alterar | `@nestjs/swagger` entra |
| `backend/src/openapi.ts` | criar | Configuração Swagger (DocumentBuilder + setup) |
| `backend/src/openapi.test.ts` | criar | Teste de controle da spec |
| `backend/src/main.ts` | alterar | Chamar `configurarOpenApi` |
| `backend/src/acesso/infrastructure/http/acesso.controller.ts` | alterar | Tags + body schemas |
| `backend/src/lancamentos/infrastructure/http/lancamentos.controller.ts` | alterar | Tags + Bearer + response schemas |
| `docs/tasks/HT-019/` | alterar | Planos e progress |
| `docs/entregas/ENTREGA-HT-019-swagger-openapi.md` | criar | Entrega |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-009`, `HT-010`, `HN-001` | Done | Não |
| zod 4.3.6 com `toJSONSchema()` | Disponível | — |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".