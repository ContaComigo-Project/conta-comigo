---
name: ht-019-swagger-openapi
description: História técnica para documentar a API do ContaComigo com OpenAPI/Swagger — UI em /api/docs e spec JSON em /api-json, cobrindo os endpoints existentes sem quebrar as fronteiras de ADR-001.
document_type: story
story_key: HT-019
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-019` — Documentação OpenAPI/Swagger da API

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Ready — próxima demanda (puxada antes da ordem natural)**
- **Requisitos:** apoia `RNF-008` (rastreabilidade de operação) e `RNF-021` (gates bloqueantes intactos)
- **Depende de:** `HT-009`, `HT-010`, `HN-001` — todas concluídas
- **Versão prevista:** `v0.15.0`

## Problema técnico

A API NestJS existe e está testada (6 endpoints em `acesso` e `lancamentos`),
mas **não há documentação acessível**: nenhum Swagger/OpenAPI. Quem precisa
consumir a API — o próprio time nas histórias de integração (`HN-002`, `HN-003`)
ou uma pessoa testando manualmente — lê o código-fonte dos controllers e dos
DTOs em `packages/contract` para descobrir o contrato. Isso custa tempo a cada
história e não há um mapa único dos endpoints, schemas e da segurança exigida.

## Resultado esperado

A API expõe **UI Swagger em `/api/docs`** e **spec OpenAPI JSON em `/api-json`**
documentando os 6 endpoints existentes, com schemas derivados dos DTOs do
`@contacomigo/contract` e com a guarda de titular marcada como segurança. Nenhuma
fronteira do `ADR-001` é quebrada: decorators Swagger vivem só na camada
`infrastructure/http/`.

## Critérios de aceite

- [ ] `pnpm --filter @contacomigo/backend start` expõe `GET /api-json` respondendo 200 com spec válida
- [ ] `GET /api/docs` responde 200 (UI Swagger)
- [ ] A spec lista os 6 endpoints: `POST /acesso/contas`, `POST /acesso/sessoes`,
      `POST /acesso/sessoes/renovacao`, `DELETE /acesso/sessoes`,
      `GET /lancamentos`, `GET /lancamentos/resumo-do-mes`
- [ ] Schemas dos corpos/respostas derivados dos tipos do `@contacomigo/contract`
      (ex.: `CriarContaDTO`, `CredenciaisDTO`, `SessaoDTO`, `LancamentoDTO`)
- [ ] Os endpoints de `lancamentos` documentam a exigência de autenticação
      (guarda de titular) na especificação
- [ ] `pnpm run lint:fronteiras` continua verde — nenhum import de
      `@nestjs/swagger` fora de `infrastructure/http/` (ADR-001)
- [ ] Teste de controle prova que `/api-json` lista os 6 endpoints e que
      `/api/docs` responde

```gherkin
Cenário: a API é descoberta pela própria documentação
  Dado a API em execução
  Quando alguém acessa GET /api-json
  Então a spec responde 200 com o schema OpenAPI
  E lista os 6 endpoints existentes com seus métodos e paths
  E os schemas de corpo e resposta derivam do @contacomigo/contract
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-008` | Erro/operação rastreável | A spec torna o contrato inspecionável sem ler código |
| `RNF-021` | Gates bloqueiam de fato | `lint:fronteiras` continua verde com o Swagger instalado |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Decorators Swagger só em `infrastructure/http/`; `domain/` e `application/` intactos |
| Dependências externas | Sim | `@nestjs/swagger` entra no backend — documentação de transporte, não estrutural de domínio; sem ADR novo (não toca regra) |
| Contratos públicos | Documenta | Os DTOs do `@contacomigo/contract` são refletidos; nenhum campo muda |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Decorator Swagger vazar para o domínio | `lint:fronteiras` + regra do dependency-cruiser | Remover `@nestjs/swagger` e os decorators |
| Spec divergir do contrato real | Teste de controle compara a spec com a lista de endpoints | Corrigir no teste |
| Swagger expor dado sensível em produção | PoC sem produção pública (`ADR-005`); UI de docs não autenticada por ora | Restringir por ambiente quando `HT-015` |

## Fora de escopo

- Documentar histórias futuras (`HN-002` em diante) — a spec cresce com elas
- Autenticar a UI do Swagger
- Gerar SDK de cliente a partir da spec
- Alterar qualquer campo dos DTOs do contrato

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Prova de endpoint (`/api-json`, `/api/docs`) |
| SRE | Sim | Operação: a API passa a expor rotas novas |
| Segurança | Sim | Guarda de titular documentada; UI de docs não expõe dado |
| Arquitetura | Sim | Fronteiras do ADR-001 com dependência nova |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Teste de controle (spec lista os 6 endpoints + `/api/docs` 200) verde
- [ ] `lint:fronteiras` verde após instalar `@nestjs/swagger`
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HT-019-swagger-openapi.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-019` e tag `v0.15.0` no mesmo hash