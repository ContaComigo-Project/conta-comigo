---
name: implementation-hn-002
description: Plano técnico da história HN-002 — consentimento de primeira classe, conexão e sincronização com isolamento por titular.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HN-002
max_lines: 300
---

# IMPLEMENTATION — `HN-002`

- **Requisitos ligados:** `RF-004`, `RF-005`, `RF-007` · `RN-012`, `RN-014`, `RN-015` · `RNF-002`, `RNF-005`, `RNF-006`, `RNF-014`
- **Versão prevista:** `v0.17.0`
- **Tipo de mudança:** MINOR (capacidade nova compatível)

## 1. Abordagem

Novo contexto hexagonal `consent` (ADR-001) no backend:

1. **Domínio** (`consent/domain/model/consent.ts`): entidade `Consent` com
   `holderId`, `institutionId`, `connectionId`, `scope`, `createdAt`, `expiresAt`,
   `revokedAt` e a regra de ativo (`ativoEm(agora)`, RN-012/014). Porta de saída
   `ConsentRepository` (salvar, por instituição/titular, listar por titular) e
   `CredentialCipher` (cifrar/decifrar token do agregador — RNF-014).
2. **Aplicação** (`consent/application/`): casos de uso `ConnectInstitution`,
   `ListConnections`, `SyncInstitution`. A conexão substitui o consentimento
   anterior da mesma instituição (RN-014); o sync só roda com consentimento
   ativo (RN-012) e sempre filtrado pelo titular (RN-015); falha do agregador
   vira `Result` estruturado (RNF-005/006).
3. **Infra**: repositório Prisma (tabela nova) + implementação em memória para
   teste; `CredentialCipher` na borda usando a cifra AES-GCM de `HT-010`;
   controller HTTP.
4. **Porta de agregação**: estender `OpenFinanceAggregator` com `criarConexao`
   (a conexão nasce do consentimento); adaptador falso retorna id determinístico,
   o pluggy usa credencial quando presente.
5. **Contract**: DTOs `ConnectInstitutionDTO`, `ConsentDTO`, `SyncResultDTO`;
   endpoints `POST /consents`, `GET /consents`, `POST /consents/:id/sync`.
6. **Migração Prisma** para a tabela de consentimento (token cifrado).

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Consentimento dentro do contexto `aggregation` | ADR-001 cita `consentimento` como contexto próprio; separação facilita HN-012 |
| Guardar token do agregador em texto claro | Viola RNF-014; a cifra de HT-010 já existe |

## 3. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenários BDD/unit: RN-014 (substitui), RN-012 (sem consentimento nega), RN-015 (isolamento) | Vermelho antes do código |
| 2 | Domínio + aplicação + repositório em memória | Verdes |
| 3 | Infra Prisma + controller + contract | Integração verde |
| 4 | Suíte completa + fronteiras | Verdes |

## 4. Gates

QA (cenários BDD + RN), Segurança (open-finance-security-agent: consentimento, cifra, isolamento), SRE (degradação), Arquitetura (ADR-001, fronteiras), Revisão final.

## 5. Riscos

Credencial vazar (cifra + nunca em log), reconectar apagar anterior (RN-014 com evidência), escopo vazar para HN-012 (fora de escopo declarado).

## 6. Fechamento

- Commit: `feat(consent): connect institution with consent and synchronize (HN-002)`
- Tag: `v0.17.0`