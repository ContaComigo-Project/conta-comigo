---
name: entrega-ht-010
description: Documento de entrega da persistência PostgreSQL — Prisma 7 com migração versionada aplicada pelo setup, repositório real traduzindo modelo em entidade, e cifra AES-256-GCM em repouso.
document_type: delivery
story_key: HT-010
version: v0.10.0
max_lines: 300
---

# ENTREGA — `HT-010` — Persistência PostgreSQL, migrações e cifra em repouso

- **Data:** 2026-09-07
- **Tipo:** Técnica (persistência)
- **Versão:** `v0.10.0`
- **Commit:** `a419cf4`
- **Tag:** `v0.10.0` → `a419cf4`

## O que foi entregue

Lançamentos sobrevivem ao processo. O contexto `lancamentos` persiste no
PostgreSQL do compose via Prisma 7, com a primeira migração versionada aplicada
por `harness setup`; o módulo aponta para o adaptador real por token — e essa
troca mudou **uma linha**, a prova prática de que o hexágono de `ADR-001`
funciona. Existe um utilitário de cifra em repouso pronto para `HN-002`.

| Artefato | Papel |
| --- | --- |
| `backend/prisma.config.ts`, `backend/prisma/schema.prisma` | Modelo de persistência (`lancamentos`), separado da entidade (`ADR-002` r.1) |
| `backend/prisma/migrations/20260907172751_inicial/` | Primeira migração **commitada**; `setup` aplica com `migrate deploy` (`ADR-002` r.3) |
| `infrastructure/persistence/repositorio-prisma.ts` | Adaptador real via `@prisma/adapter-pg`; cliente gerado em `persistence/gerado/` (gitignored) — Prisma não sai daqui (`ADR-002` r.2) |
| `infrastructure/persistence/cifra.ts` | AES-256-GCM, IV aleatório, chave em `ENCRYPTION_KEY`; recusa operar sem chave (`RNF-014`) |
| `vitest.integracao.config.ts`, tarefa `test-integracao` | Integração separada do unitário, que continua sem banco |
| `package.json` → `pnpm.overrides` | `deepmerge-ts` e `mysql2` elevados: 3 CVEs transitivas do Prisma CLI |

Esta história foi executada pelo **loop autônomo** (voltas 1 a 6), uma ação
por volta, com evidência a cada passo.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-014` | Cifra autenticada; sem chave lança `ChaveDeCifraAusente`; chave errada ou texto adulterado falham na tag | `*-test-unitario-verde-cifra.txt` |
| `RNF-020` | `@prisma/client` só em `persistence/`; plantado em `application/` derruba o lint | `*-lint-prisma-fora-de-persistence.txt` |
| `RNF-007` | `down` + `setup` recria banco, gera cliente e aplica migração | `*-setup-maquina-limpa.txt` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `schema.prisma` + migração commitada | Aprovado | `backend/prisma/migrations/20260907172751_inicial/migration.sql` |
| `setup` aplica migrações; passo 6 real | Aprovado | `*-setup-maquina-limpa.txt` |
| Repositório Prisma; Prisma só em `persistence/` | Aprovado | 99 módulos sem violação |
| Entidade `Lancamento` intacta | Aprovado | arquivo não tocado; teste de decorator verde |
| Integração ida e volta no Postgres real, fora do unitário | Aprovado | `test-integracao` 3/3; `test-unitario` exclui `*.integracao.test.ts` |
| Cifra com casos negativos | Aprovado | 7 cenários |
| Falha esperada: sem `ENCRYPTION_KEY` recusa | Aprovado | cenário `sem ENCRYPTION_KEY recusa operar` |
| Falha esperada: Prisma em `application/` quebra o lint | Aprovado | 2 regras nomeadas na evidência |
| `test-unitario` sem banco | Aprovado | 30 testes sem I/O |
| Evidência por `registrar-evidencia.sh` | Aprovado | 9 arquivos |

## Evidência de testes

Vermelho antes do código, por asserção:

```
      Tests  6 failed | 24 passed (30)
      Tests  2 failed | 1 passed (3)
```

Setup em máquina limpa aplicando a migração:

```
Applying migration `20260907172751_inicial`
```

Gates finais com o módulo no repositório Prisma:

```
      Tests  30 passed (30)
      Tests  3 passed (3)
Lines        : 100% ( 7/7 )
seguranca: aprovada
harness: gates concluídos
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `harness test-unitario` | 30 passed | — |
| Integração | `harness test-integracao` | 3 passed (Postgres real) | — |
| Funcional | `harness test-funcional` | 2 passed | — |
| Cobertura (domínio) | `harness coverage` | 100% (7/7) | — |
| Estático | `harness lint` | 99 módulos, 0 violações | — |
| Segurança | `harness security` | limpo após overrides | — |

## Refatoração feita após os funcionais verdes

1. **Cliente gerado em `doNotFollow`, não `exclude`.** `sem-ciclos` acusou
   ciclos internos do cliente Prisma. Tratado como `node_modules`: a aresta
   `repositorio-prisma → gerado` fica no grafo; não entramos nele. Mesma lição
   de `HT-009`.
2. **`fronteiras.test.ts` monta o comando como string** — o `spawnSync` com
   `shell:true` e array trazia o `DEP0190` de volta.
3. **`pnpm.overrides`** para `deepmerge-ts 8.0.0` e `mysql2 3.23.1`: o
   `osv-scanner` reprovou 3 CVEs transitivas do `prisma` CLI; o primeiro
   override (`3.22.0`) ainda deixava 1 Medium.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Vermelho por asserção nos dois testes; casos negativos da cifra; ida e volta preserva instante da data |
| SRE | `sre-agent` | Aprovado | `down`+`setup` recria tudo; migração só por `migrate deploy`; API sobe contra o banco real |
| Segurança | `security-specialist-agent` | Aprovado | AES-256-GCM autenticado; chave fora do repo; gitleaks limpo; CVEs transitivas corrigidas |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Domínio e caso de uso intocados; troca de adaptador em uma linha |
| Revisão final | `final-reviewer-agent` | Aprovado | Escopo contido; MINOR |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| Prisma **7.10.0** e não `8.0.0-rc` | Alinhar com `@prisma/client`; RC não é versão fixável com segurança |
| Cliente gerado dentro de `persistence/` e gitignored | Único lugar que pode conhecer o Prisma; `setup` regenera |
| URL padrão do compose em `prisma.config.ts` e no repositório | `setup` em máquina limpa sem `.env` (`RNF-007`); é a mesma credencial local já justificada em `.gitleaks.toml` |
| `test-integracao` como tarefa própria | Unitário continua sem banco (`ADR-003`) |
| `upsert` no `salvar` | Idempotência facilita `RN-008` (duplicado do agregador) depois |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| Nenhum campo cifrado ainda | Por desenho: o utilitário existe; o primeiro uso é o token de consentimento | `HN-002` |
| `salvar` não está na porta `RepositorioDeLancamentos` | Porta só lê; escrita entra quando `HN-002` sincronizar | `HN-002` |
| `scripts/*.mjs` sem teste (herdada) | — | próxima `HT` de tooling |

## Verificação de fechamento

- [x] `scripts/verificar-fechamento.sh v0.10.0` verde
- [x] Tag `v0.10.0` aponta para o mesmo hash do commit
- [x] Evidência presente em `docs/tasks/HT-010/evidencia/` (9 arquivos)
