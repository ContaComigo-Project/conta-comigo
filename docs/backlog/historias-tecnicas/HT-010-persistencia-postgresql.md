---
name: ht-010-persistencia-postgresql
description: Persistência real com Prisma e PostgreSQL — schema, migração versionada no harness, repositório que traduz modelo em entidade, e cifra em repouso na borda da persistência.
document_type: story
story_key: HT-010
story_type: tecnica
epic: EPIC-TEC-001
status: Done
max_lines: 300
---

# `HT-010` — Persistência PostgreSQL, migrações e cifra em repouso

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Done (ordem 11) — `v0.10.0` → `a419cf4`
- **Decisão que a rege:** [`ADR-002`](../../adr/ADR-002-orm-prisma.md), [`ADR-001`](../../adr/ADR-001-arquitetura-hexagonal-no-backend.md)
- **Requisitos:** `RNF-014`; `RNF-020`; `RNF-007`
- **Depende de:** `HT-009` (esqueleto e porta `RepositorioDeLancamentos`) — `v0.9.0`; `HT-004` (Prisma decidido) — `v0.5.0`
- **Versão prevista:** `v0.10.0`

## Problema técnico

O único repositório do backend é `RepositorioDeLancamentosEmMemoria`: tudo
some quando o processo morre. O PostgreSQL que `HT-005` sobe está de pé sem
nenhum esquema, e o passo 6 do `setup-ambiente.mjs` ("Migrações") é um slot
vazio que declara a própria ausência.

`ADR-002` fixou Prisma e quatro regras — modelo ≠ entidade, Prisma só no
repositório, migração versionada, cifra em repouso — e nenhuma delas existe em
código. `RNF-014` exige que credencial de consentimento e token de agregador
fiquem cifrados em repouso; sem o mecanismo pronto agora, `HN-002` nasceria
gravando texto claro.

## Resultado esperado

O contexto `lancamentos` persiste de verdade: `schema.prisma`, primeira
migração commitada, `RepositorioDeLancamentosPrisma` traduzindo o modelo
gerado para a entidade de domínio, e o módulo escolhendo o adaptador real por
token. O `setup` aplica migrações. Existe um utilitário de cifra em repouso na
borda da persistência, com chave vinda de variável de ambiente, provado por
teste — pronto para `HN-002` usar sem inventar nada.

## Critérios de aceite

Critério técnico também é verificável. Prefira comando reprodutível a descrição.

- [x] `backend/prisma/schema.prisma` existe com o modelo `Lancamento`, e
      `backend/prisma/migrations/` tem a primeira migração **commitada**
- [x] `scripts/harness.sh setup` aplica as migrações (`prisma migrate deploy`)
      no Postgres do compose; o passo 6 deixa de ser slot vazio
- [x] `RepositorioDeLancamentosPrisma` implementa `RepositorioDeLancamentos`,
      e `@prisma/client` aparece **apenas** em `infrastructure/persistence/`
      (`harness lint` verde com o código real)
- [x] A entidade `Lancamento` não muda e não importa nada de `@prisma/client`
- [x] Teste de integração do repositório roda contra o Postgres real do compose
      e prova ida e volta (salvar → listar) — não roda em `test-unitario`
- [x] Utilitário de cifra em repouso (`cifrar`/`decifrar`, AES-256-GCM, chave
      em `ENCRYPTION_KEY`) em `infrastructure/persistence/`, com teste: mesmo
      texto cifrado duas vezes produz saídas diferentes; decifra de volta;
      chave errada falha
- [x] Falha esperada é detectada: sem `ENCRYPTION_KEY`, o utilitário recusa
      operar com mensagem clara, em vez de gravar texto claro
- [x] Falha esperada é detectada: `@prisma/client` importado em
      `application/` quebra `harness lint`
- [x] `HARNESS_TEST_UNIT` continua sem banco: os testes de integração ficam
      em tarefa própria ou marcados para rodar só em `test` completo
- [x] Toda evidência registrada por `scripts/registrar-evidencia.sh`

```gherkin
Cenário: lançamento sobrevive ao processo
  Dado o Postgres do compose com as migrações aplicadas
  Quando salvo um lançamento pelo repositório Prisma e listo todos
  Então o lançamento volta com os mesmos campos da entidade de domínio

Cenário: dado sensível não chega ao banco em texto claro
  Dado ENCRYPTION_KEY definida
  Quando cifro "token-do-agregador"
  Então o texto cifrado não contém "token-do-agregador"
  E decifrar com a mesma chave devolve "token-do-agregador"
  E decifrar com outra chave falha
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-014` | Zero campo sensível em texto claro | Utilitário de cifra testado; recusa operar sem chave |
| `RNF-020` | Zero SDK fora do adaptador | `@prisma/client` só em `persistence/`, verificado pelo lint |
| `RNF-007` | Zero passo manual | `setup` aplica migrações |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Usa a porta que `HT-009` definiu |
| Dependências externas | Sim | `prisma` (CLI) e `@prisma/client` no `backend/` |
| Contratos públicos | Não | — |
| Dados e migração | **Sim** | Primeiro esquema; migração versionada é a partir daqui |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Teste de integração exigir banco e quebrar `test-unitario` | Tarefa separada; unitário segue sem I/O | Marcar integração como `skip` só com registro |
| Cliente Prisma gerado não versionado quebrar clone limpo | `setup` roda `prisma generate` | — |
| Chave de cifra no repositório | `.env.example` com valor vazio; gitleaks | Rotacionar chave |
| `db push` acidental em dado real | Só `migrate deploy` no harness; `db push` fora do `package.json` | — |

## Fora de escopo

- Qualquer campo cifrado real (consentimento é `HN-002`) — aqui só o utilitário
- Autenticação e autorização (`HN-001`, `HT-008`)
- Backup, réplica, hospedagem (`HT-015`)
- Modelos além de `Lancamento`

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Ida e volta no banco; cifra com casos negativos |
| SRE | Sim | Migração no `setup`; reprodutibilidade em máquina limpa |
| Segurança | Sim | Cifra em repouso, chave em segredo, `RNF-014` |
| Arquitetura | Sim | Modelo ≠ entidade; Prisma confinado |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Comportamento testável coberto por cenário funcional antes do código
- [x] Refatoração feita após os funcionais verdes
- [x] Testes unitários onde houver lógica
- [x] Gates marcados acima executados com evidência
- [x] Documentação operacional atualizada (`scripts/README.md`, `.env.example`)
- [x] `docs/entregas/` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [x] Commit semântico citando `HT-010` e tag no mesmo hash
