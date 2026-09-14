---
name: adr-002-orm-prisma
description: Decisão de usar Prisma ORM com PostgreSQL na camada de persistência do backend hexagonal do ContaComigo.
document_type: adr
adr_key: ADR-002
status: Aceita
applies_when:
  - modelar persistência ou migração no backend
  - revisar fronteiras de persistência no gate de arquitetura
max_lines: 300
---

# ADR-002 — ORM Prisma com PostgreSQL

- **Status:** Aceita
- **Data:** 2026-09-05
- **História:** `HT-004` (registro) · implementada por `HT-010`
- **Decidido por:** time do ContaComigo

## Contexto

O épico técnico fixou a persistência como PostgreSQL e exige que o domínio
hexagonal (`ADR-001`) não conheça o ORM: **entidade de domínio sem decorator**,
modelo de persistência separado em `infrastructure/persistence/`. `RNF-014`
exige cifra em repouso para token de consentimento e credencial do agregador.

Faltava escolher **qual ORM** conversa com o Postgres sem contaminar o domínio.
A primeira pessoa que modelasse uma tabela escolheria sozinha, no meio de
`HT-010`, sem registrar o porquê — o risco que `HT-004` existe para eliminar.

## Alternativas consideradas

### A — Prisma — **escolhida**

| | |
| --- | --- |
| Como funciona | Schema declarativo (`schema.prisma`), gera cliente tipado, migrações versionadas em SQL, funciona com Postgres |
| A favor | Produtividade alta; tipagem forte (bom com TypeScript); migrações previsíveis e versionadas; independe de decorator — o modelo Prisma é separado do domínio, o que casa com `ADR-001` |
| Contra | Menos controle fino sobre SQL; o cliente gerado precisa ficar atrás da porta de repositório para não vazar para o domínio |

### B — TypeORM

| | |
| --- | --- |
| Como funciona | Mapeamento via decorator nas entidades, integra bem com NestJS |
| A favor | Integração natural com NestJS; documentação abundante |
| Contra | Decorator nas entidades colide com a regra de `ADR-001` (entidade de domínio sem decorator); migração por sincronização menos previsível; histórico de quebras de versão |

### C — Drizzle

| | |
| --- | --- |
| Como funciona | SQL-first, tipagem por inferência, sem código gerado pesado |
| A favor | SQL explícito, leve, tipagem forte |
| Contra | Ecossistema e ferramentas menores; time não tem experiência consolidada; para a primeira modelagem da PoC, a curva e o suporte do Prisma pesam mais |

## Decisão

A camada de persistência usa **Prisma ORM com PostgreSQL**. O modelo Prisma
vive **exclusivamente** em `infrastructure/persistence/`; o domínio continua
sem decorator e sem importar `@prisma/client` (`ADR-001`).

Regras concretas que derivam da escolha:

1. **Modelo de persistência ≠ entidade de domínio.** O `schema.prisma` modela
   tabelas; o repositório traduz entre o modelo Prisma e a entidade de domínio.
   Nenhuma entidade de domínio carrega tipos de `@prisma/client`.
2. **O repositório é o único lugar que conhece o Prisma.** O caso de uso recebe
   a porta `RepositorioDe<Agregado>` (`ADR-001`) e nunca o `PrismaClient`.
3. **Migrações versionadas.** Schema evolui por migração commitada, nunca por
   `db push` em ambiente de dado real. `HT-010` fixa o fluxo no harness.
4. **Cifra em repouso (`RNF-014`).** Colunas com token de consentimento e
   credencial do agregador são cifradas na aplicação (campo `@db` com texto
   cifrado ou extensão de cifra na camada de persistência) antes de chegar ao
   Prisma; a chave vive em segredo, nunca no repositório.

## Consequências

**O que ganhamos:**

- Tipagem forte do cliente gerado, migrações versionadas e previsíveis.
- Separação clara entre modelo relacional e entidade de domínio — o `schema.prisma`
  é o contrato do banco, e `ADR-001` segue intacto.
- `RNF-014` tem lugar definido: cifra na borda da persistência.

**O que perdemos:**

- Controle fino sobre SQL em casos exóticos (contornável por query crua pontual
  dentro do repositório).
- O cliente gerado adiciona uma dependência de build na história de persistência.

**O que passa a ser obrigatório:**

- `@prisma/client` importado **apenas** em `infrastructure/persistence/`
  (verificado pelo `dependency-cruiser` de `HT-006`/`HT-009`).
- Nenhum decorator de ORM em `domain/` — o gate de arquitetura reprova.
- Fluxo de migração commitado, com verificação no harness (`HT-005`).

## Como verificar que a decisão está sendo respeitada

```
scripts/harness.sh lint   # dependency-cruiser: banir @prisma/client fora de infrastructure/persistence
scripts/harness.sh test   # RN de persistência testadas com Prisma em banco de teste
```

## Como reverter

Trocar por TypeORM ou Drizzle exige: novo ADR substituindo este, reescrever os
repositórios em `infrastructure/persistence/` e ajustar migrações. O domínio e
os casos de uso permanecem intactos — a fronteira de `ADR-001` é o que torna a
reversão barata.

## Requisitos relacionados

`RNF-014`, `RNF-018`, `RNF-020` · `RN-013`, `RN-014`, `RN-016`