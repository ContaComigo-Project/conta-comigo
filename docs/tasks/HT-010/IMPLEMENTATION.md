---
name: implementation-ht-010
description: Plano técnico da persistência PostgreSQL com Prisma — modelo separado da entidade, migração no setup, teste de integração isolado do unitário e cifra AES-256-GCM na borda.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-010`

- **Requisitos ligados:** `RNF-014`, `RNF-020`, `RNF-007`
- **Versão prevista:** `v0.10.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Trocar o adaptador falso pelo real **sem tocar no domínio nem no caso de uso**
— é o teste prático de `ADR-001`: se a troca exigir mudança fora de
`infrastructure/` e do módulo, o hexágono não está funcionando.

`schema.prisma` modela a tabela `lancamentos` (`id text`, `descricao text`,
`valor_em_centavos integer`, `data_de_competencia timestamptz`). O repositório
traduz a linha para a entidade `Lancamento`; nenhum tipo de `@prisma/client`
sai de `persistence/`.

Migração: `prisma migrate dev --name inicial` gera a pasta commitada;
`setup-ambiente.mjs` roda `prisma generate` e `prisma migrate deploy`
(nunca `db push`, `ADR-002` regra 3). `DATABASE_URL` já está no `.env.example`
apontando para o compose; o `setup` a usa direto quando `.env` não existe.

Teste de integração precisa de banco, logo **não** entra em `test-unitario`:
`vitest.integracao.config.ts` com `include: **/*.integracao.test.ts`, tarefa
`test-integracao` nova no harness, chamada por `HARNESS_TEST` depois do
unitário. `vitest.config.ts` exclui `*.integracao.test.ts`.

Cifra: `cifra.ts` com `node:crypto`, AES-256-GCM, IV aleatório por chamada,
saída `iv:tag:texto` em base64; chave de 32 bytes lida de `ENCRYPTION_KEY`
(hex). Sem chave → lança erro nomeado antes de qualquer operação.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| `db push` no setup | `ADR-002` regra 3: migração versionada, sempre |
| Teste de integração dentro de `test-unitario` | Quebra a promessa "unitário sem banco" de `ADR-003` e de `HT-009` |
| Extensão `pgcrypto` para a cifra | Chave iria ao banco; `ADR-002` pede cifra na aplicação, chave em segredo |
| `@prisma/client` importado pelo módulo | O módulo pode tudo, mas a instância pertence ao adaptador; centralizar em `persistence/` mantém uma só regra |

## 3. Fronteiras e design

```
backend/prisma/schema.prisma
backend/prisma/migrations/<ts>_inicial/migration.sql
backend/src/lancamentos/infrastructure/persistence/
  prisma.ts                 PrismaClient unico (fabrica)
  repositorio-prisma.ts     RepositorioDeLancamentosPrisma + traducao
  repositorio-prisma.integracao.test.ts
  cifra.ts, cifra.test.ts
```

O módulo passa a usar `useFactory: () => new RepositorioDeLancamentosPrisma()`.
O repositório em memória **fica** — é o adaptador falso que `ADR-001` exige
para teste, e o teste HTTP de `HT-009` continua usando ele.

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | `cifra.test.ts` e `repositorio-prisma.integracao.test.ts` sobre stubs | Vermelho por asserção |
| 2 | Schema, migração, repositório, cifra | Verde |
| 3 | Refatoração | Verde mantido |
| 4 | Falhas esperadas: sem chave; Prisma em `application/` | Vermelho registrado |

| Cenário | Regra que prova | Arquivo |
| --- | --- | --- |
| Salvar e listar devolve a entidade igual | `ADR-002` regra 1 | `repositorio-prisma.integracao.test.ts` |
| Cifra ≠ texto; decifra igual; IVs diferentes; chave errada falha; sem chave recusa | `RNF-014` | `cifra.test.ts` |
| `@prisma/client` em `application/` reprova o lint | `ADR-002` regra 2 | evidência sobre código real |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Vermelho registrado; casos negativos da cifra; ida e volta real |
| SRE | Sim | `setup` em máquina limpa aplica migração; `gates` verde |
| Segurança | Sim | AES-256-GCM, chave fora do repo, recusa sem chave; gitleaks verde |
| Arquitetura | Sim | Domínio e caso de uso intocados; Prisma confinado |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Prisma 7 exigir `prisma.config.ts` ou adaptador de driver | Média | Verificar na instalação; documentar a forma escolhida |
| `prisma generate` em máquina limpa sem rede | Baixa | Engines baixam no `install`; falha alta no `setup` |
| Teste de integração flake por estado residual | Média | Limpar tabela no `beforeEach` |

## 7. Plano de reversão

`git revert`; `harness down` apaga o volume e o esquema. O módulo volta ao
repositório em memória trocando uma linha.

## 8. Fechamento

- Mensagem de commit prevista: `feat(backend): persist lancamentos with Prisma and add encryption at rest (HT-010)`
- Tag prevista: `v0.10.0`
