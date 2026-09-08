---
name: entrega-hn-002
description: Documento de entrega da HN-002 — conectar instituição com consentimento e sincronizar, com consentimento como registro de primeira classe e isolamento por titular.
document_type: delivery
story_key: HN-002
version: v0.17.0
max_lines: 300
---

# ENTREGA — `HN-002` — Conectar instituição com consentimento e sincronizar

- **Data:** 2026-09-08
- **Tipo:** Negócio
- **Versão:** `v0.17.0`
- **Commit:** `[preenchido no fechamento]`
- **Tag:** `v0.17.0` → `[mesmo hash]`

## O que foi entregue

- **Novo contexto hexagonal `consent`** (ADR-001): entidade `Consent` de primeira
  classe (holder, instituição, escopo, expiração, revogação, `lastSyncAt`,
  credencial **cifrada**), portas `ConsentRepository` e `CredentialCipher`.
- **Casos de uso**: `ConnectInstitution` (RF-004), `ListConnections` (RF-005),
  `SyncInstitution` (RF-007).
- **Porta `OpenFinanceAggregator` estendida** com `criarConexao` (adaptador falso
  determinístico; Pluggy recusa estruturada; ambos sob a política de RNF-006).
- **Persistência**: migração Prisma `consent` (token do agregador cifrado com
  AES-GCM de HT-010 — RNF-014); repositório Prisma + memória.
- **Endpoints**: `POST /consents`, `GET /consents`, `POST /consents/:id/sync`,
  protegidos por Bearer (RNF-013) e isolados por titular (RN-015); DTOs no
  `@contacomigo/contract`; documentados no Swagger.
- **Comportamento percebido**: a pessoa autoriza a conexão; a instituição aparece
  com status e última sincronização; a sincronização traz contas/lançamentos só
  com consentimento ativo. A UI real (ConnectedBanksWidget consumindo a API) é
  da `HN-003`.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-004` — conectar com consentimento explícito | Consentimento ativo criado por instituição; credencial cifrada | testes + API real |
| `RF-005` — listar conexões com status/sincronização | `GET /consents` do titular com status e `lastSyncAt` | testes |
| `RF-007` — sincronizar contas e lançamentos | `POST /consents/:id/sync` só com consentimento ativo | testes |
| `RN-012` — sem consentimento ativo não sincroniza | Revogado/expirado → `sem-consentimento-ativo` (409) | testes |
| `RN-014` — um consentimento ativo por instituição/pessoa | Reconectar substitui o anterior | testes |
| `RN-015` — isolamento entre pessoas | `findById` sempre scoped pelo titular; recurso alheio → 404 | testes |
| `RNF-014` — cifra em repouso | Token cifrado com AES-GCM antes de persistir | testes + código |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Consentimento ativo com escopo/expiração; credencial cifrada | Aprovado | `consent.test.ts`, `connect-institution.test.ts` |
| Um consentimento ativo por instituição/pessoa (RN-014) | Aprovado | teste de reconexão |
| Sem consentimento ativo não há sincronização (RN-012) | Aprovado | testes revogado/expirado |
| Sincronização persiste e atualiza `lastSyncAt` (RF-005/007) | Aprovado | `sync-institution.test.ts` |
| Dado de uma pessoa nunca vaza para outra (RN-015) | Aprovado | teste negativo (404) |
| Agregador fora → erro estruturado, mantém estado (RNF-005/006) | Aprovado | `sync-institution.test.ts` |

## Evidência de verificação

```
$ curl -X POST /access/sessions ...            → 200 (token)
$ curl -X POST /consents -H "Bearer <token>" -d '{"institutionId":"inst-1","scope":"accounts"}'
  → {"id":"311cbd5b-…","institutionId":"inst-1","scope":"accounts","status":"ativo",
     "createdAt":"…","expiresAt":"2026-12-07…","lastSyncAt":null}
$ curl -X POST /consents/<id>/sync -H "Bearer <token>"
  → {"consentId":"311cbd5b-…","contas":3,"lancamentos":0}
```

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  25 passed (25)   Tests  148 passed (148)

$ pnpm run test:integration
 Test Files  2 passed (2)     Tests  7 passed (7)   (3 do consent + 4 do transactions)

$ pnpm run test:functional
 2 passed (2.7s)

$ pnpm run lint:boundaries
✔ no dependency violations found (185 modules, 463 dependencies cruised)

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `test:unit` | 148 verdes | backend (inclui consent) + contrato + dados web + governança |
| Integração | `test:integration` | 7 verdes | Prisma real (transactions + consent) |
| Funcional | `test:functional` | 2 verdes | web real |

## Refatoração feita após os funcionais verdes

O gate de fronteiras apontou que os testes de `application/` importavam
`infrastructure/` (repositório em memória e agregador falso). Os cenários foram
reescritos com **fakes inline** no próprio teste, preservando a cobertura sem
violar `ADR-001`; a fronteira `application → infrastructure` segue bloqueada e
verificada.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Cenários BDD por critério; RN-012/014/015 provadas com teste negativo |
| Segurança | `open-finance-security-agent` | Aprovado | Consentimento de primeira classe; credencial cifrada (RNF-014); isolamento por titular (RN-015); guarda no servidor (RNF-013); nada de credencial em log |
| SRE | `sre-agent` | Aprovado | Sincronização assíncrona; agregador fora degrada com erro estruturado (RNF-005/006); build e integração verdes |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Contexto `consent` hexagonal (ADR-001); portas por token; fronteiras intactas (185 módulos) |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.17.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Novo contexto `consent` (não dentro de `aggregation`) | ADR-001 cita consentimento como contexto; separa a HN-012 | HN-012 estende o mesmo contexto |
| `criarConexao` na porta de agregação | A conexão nasce do consentimento; fake determinístico para teste | Fluxo real de connect token do Pluggy quando o sandbox for exercitado |
| Persistência dos lançamentos do agregador fica para HN-003 | O painel consolida; a HN-002 sincroniza e atualiza o status | Nota para HN-003 |
| Fakes inline nos testes de application | Respeita a fronteira `application → infrastructure` | Padrão de teste do repo |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| `ConnectedBanksWidget` ainda consome mocks | Integração da UI real é HN-003 | Kanban → HN-003 |
| `criarConexao` do Pluggy sem connect token | Fluxo de redirect do usuário exige sandbox de ponta a ponta | Código do adaptador pluggy |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-002`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.17.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado