---
name: entrega-ht-019
description: Documento de entrega da documentação OpenAPI/Swagger da API do ContaComigo — UI em /api/docs e spec em /api-json.
document_type: delivery
story_key: HT-019
version: v0.15.0
max_lines: 300
---

# ENTREGA — `HT-019` — Documentação OpenAPI/Swagger da API

- **Data:** 2026-09-07
- **Tipo:** Técnica
- **Versão:** `v0.15.0`
- **Commit:** `[preenchido no fechamento]`
- **Tag:** `v0.15.0` → `[mesmo hash]`

## O que foi entregue

- **`@nestjs/swagger` 12.0.1** instalado no backend.
- **`backend/src/openapi.ts`** — configuração Swagger global (DocumentBuilder +
  `SwaggerModule.setup('api/docs', …, { jsonDocumentUrl: 'api-json' })`).
- **UI Swagger em `/api/docs`** e **spec OpenAPI em `/api-json`** documentando os
  6 endpoints existentes: `POST /acesso/contas`, `POST /acesso/sessoes`,
  `POST /acesso/sessoes/renovacao`, `DELETE /acesso/sessoes`,
  `GET /lancamentos`, `GET /lancamentos/resumo-do-mes`.
- **Schemas de corpo derivados do `@contacomigo/contrato`** via `toJSONSchema()`
  do zod — a spec não duplica o contrato, reflete-o.
- **Exigência de Bearer documentada** nos endpoints de `lancamentos`
  (guarda de titular, `RNF-013`).
- `backend/src/main.ts` chama a configuração; nenhuma rota de negócio mudou.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-008` — operação rastreável | Contrato inspecionável em `/api/docs` sem ler código | spec gerada |
| `RNF-021` — gates bloqueiam de fato | `lint:fronteiras` verde com o Swagger instalado; `@nestjs/swagger` só em `infrastructure/` e `openapi.ts` | depcruise 165 módulos |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `GET /api-json` 200 com spec válida | Aprovado | `openapi.test.ts` + curl |
| `GET /api/docs` 200 | Aprovado | `openapi.test.ts` + curl (HTTP 200) |
| Spec lista os 6 endpoints | Aprovado | paths: `/acesso/contas`, `/acesso/sessoes` (POST+DELETE), `/acesso/sessoes/renovacao`, `/lancamentos`, `/lancamentos/resumo-do-mes` |
| Schemas derivados do contrato | Aprovado | `zodParaSchema(...)` via `toJSONSchema()` |
| Bearer nos lancamentos | Aprovado | `security: [[{"bearer":[]}]]` na spec |
| `lint:fronteiras` verde | Aprovado | 165 módulos, 389 dependências, sem violação |
| Teste de controle | Aprovado | 4 testes em `backend/src/openapi.test.ts` |

## Evidência de verificação

```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs
200

$ curl -s http://localhost:3000/api-json
openapi: 3.0.0
paths: /acesso/contas, /acesso/sessoes, /acesso/sessoes/renovacao,
       /lancamentos, /lancamentos/resumo-do-mes
/lancamentos security: [[{"bearer":[]}]]
```

## Evidência de testes

```
$ pnpm run test:unitario
 Test Files  21 passed (21)
      Tests  132 passed (132)

$ pnpm run lint:fronteiras
✔ no dependency violations found (165 modules, 389 dependencies cruised)

$ pnpm run build
✓ built in 1.26s   (vite web)
tsc -p tsconfig.json --noEmit   (backend typecheck verde)
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unitario` | 132 testes verdes | backend + contrato + dados web + governança |
| Fronteiras | `pnpm run lint:fronteiras` | verde | ADR-001/002 |
| Funcional | `pnpm run test:funcional` | verde (validação da sessão anterior) | web real |

## Refatoração feita após os funcionais verdes

O `zodParaSchema` foi isolado em `openapi.ts` com retorno `any` documentado: o
tipo `SchemaObject` do `@nestjs/swagger` não é exportado publicamente (exports
restringidos ao `.` e `./plugin`) e o JSON Schema do zod admite `false`. O
objetivo é manter o cast num único ponto comentado, em vez de espalhar `as`
pelos controllers.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Teste de controle prova a spec (6 endpoints) e a UI; sem RN nova (documentação) |
| SRE | `sre-agent` | Aprovado | `build` (web + typecheck) verde; API sobe e responde `/api/docs` e `/api-json` |
| Segurança | `security-specialist-agent` | Aprovado | Bearer documentado nos lancamentos; UI de docs não expõe dado; JWT_SECRET segue fora do repo |
| Arquitetura | `architect-reviewer-agent` | Aprovado | `@nestjs/swagger` só em `infrastructure/http/` e `openapi.ts` (global); `domain/` e `application/` intactos |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.15.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Config Swagger em `openapi.ts` (global, exportada) | O teste de controle precisa reutilizá-la sem subir o bootstrap | Padrão para próximos testes de infra |
| `/api-json` via `jsonDocumentUrl` | Critério exigia o caminho exato; sem controller extra | UI em `/api/docs` |
| Schemas via `toJSONSchema()` do zod | Fonte única é o contrato; sem classes DTO duplicadas | Spec cresce com o contrato |
| Retorno `any` no `zodParaSchema` | `SchemaObject` não é exportado pelo pacote | Comentado; único ponto de cast |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| UI Swagger sem autenticação | PoC sem produção pública (`ADR-005`) | História `HT-015` |
| Endpoints de HNs futuras não documentados | Fora de escopo | A spec cresce com `HN-002` em diante |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HT-019`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.15.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado