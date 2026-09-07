---
name: entrega-ht-005
description: Documento de entrega do harness local reprodutível — workspace pnpm, PostgreSQL por docker compose e os comandos do projeto registrados.
document_type: delivery
story_key: HT-005
version: v0.7.0
max_lines: 300
---

# ENTREGA — `HT-005` — Harness local reprodutível

- **Data:** 2026-09-07
- **Tipo:** Técnica (ambiente e operação)
- **Versão:** `v0.7.0`
- **Commit:** `3f57b53`
- **Tag:** `v0.7.0` → `3f57b53`

## O que foi entregue

O repositório passou a ter um ponto único de execução. Antes, **toda** tarefa do
harness saía com "harness.env não existe"; agora `setup` sobe o ambiente
completo e `lint`, `build` e `security` dão veredito real.

| Artefato | Papel |
| --- | --- |
| `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.nvmrc` | Workspace pnpm com `frontend` e `backend`; Node e pnpm fixados e verificados no `setup` |
| `docker-compose.yml` | PostgreSQL `17.6-alpine` — tag exata — com healthcheck e volume nomeado, em `localhost:5433` |
| `scripts/harness.env` | Registro dos comandos do projeto, versionado e sem segredo |
| `scripts/setup-ambiente.mjs` | Setup em máquina limpa, com pré-requisitos verificados e falha acionável |
| `scripts/seguranca.mjs` | Varredura de segredo (gitleaks) e de dependência (osv-scanner), por contêiner com versão fixada |
| `.gitleaks.toml` | Allowlist explícita e justificada |
| `.env.example` | Variáveis documentadas, valor de exemplo separado do obrigatório |

O lockfile do frontend foi promovido à raiz: agora há um `pnpm-lock.yaml` único,
que é o que torna `pnpm install --frozen-lockfile` uma prova de
reprodutibilidade.

`HARNESS_TEST_FUNCTIONAL`, `HARNESS_TEST_UNIT`, `HARNESS_TEST` e
`HARNESS_COVERAGE` permanecem **vazios de propósito** — as ferramentas chegam em
`HT-006`. Enquanto isso essas tarefas falham com código 3, e `gates` para nelas.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-007` — reprodutibilidade em máquina limpa | `setup` verifica Node, pnpm, Docker e o motor, instala com lockfile congelado e sobe o banco | `evidencia/20260907-111811-setup-verde.txt` |
| `RNF-012` — nenhum segredo versionado | gitleaks varre árvore de trabalho **e** histórico; allowlist justificada por caminho | `evidencia/20260907-111835-security-verde.txt` |
| `RNF-021` — gate bloqueia de fato | `gates` para no primeiro erro; tarefa não configurada sai com 3 | `evidencia/20260907-111848-test-unitario-falha-esperada.txt` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| `setup` retorna sucesso em máquina limpa com Postgres saudável | Aprovado | `20260907-111811-setup-verde.txt` |
| `lint`, `build` e `security` retornam sucesso | Aprovado | três arquivos `*-verde.txt` |
| `postgres` saudável na versão fixada por tag exata | Aprovado | healthcheck aprovado na saída do `setup` |
| `down` derruba o ambiente e remove o volume | Aprovado | Volume `conta-comigo_contacomigo-pgdata` removido; `setup` seguinte recriou do zero (`*-maquina-limpa.txt`) |
| Falha esperada: `test-unitario` sai com 3 e "comando não configurado" | Aprovado | `20260907-111848-test-unitario-falha-esperada.txt` |
| Falha esperada: paridade de código de saída entre `.sh` e `.ps1` | Aprovado | 2 e 3 idênticos nos dois após correção |
| `git status --porcelain` limpo após `setup` | Aprovado | Nada não-ignorado é gerado |
| Evidência registrada por `registrar-evidencia.sh` | Aprovado | 7 arquivos em `docs/tasks/HT-005/evidencia/` |

## Evidência de testes

```
=== 4. Subindo o PostgreSQL
 Container conta-comigo-postgres  Running
 Container conta-comigo-postgres  Waiting
 Container conta-comigo-postgres  Healthy
  [OK]    PostgreSQL saudavel (healthcheck aprovado)

=== 5. Conferindo a conexao com o banco
  [OK]    /var/run/postgresql:5432 - accepting connections

=== 6. Migracoes
  [PULA]  nenhum esquema ainda — o fluxo de migracao chega em HT-010.

=== Ambiente pronto
  Node    24.11.0
  pnpm    10.32.1
  Docker version 28.5.1, build e180ab8
  Postgres  localhost:5433  (usuario e base: contacomigo)
```

Falha esperada, provando que o harness não finge sucesso:

```
harness: comando não configurado (HARNESS_TEST_UNIT).
harness: defina-o em scripts/harness.env antes de usar esta tarefa.
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Funcional/BDD | `harness test-funcional` | Não configurado (exit 3) — `HT-006` | — |
| Unitário | `harness test-unitario` | Não configurado (exit 3) — `HT-006` | — |
| Estático | `harness lint` | Verde | — |
| Segurança | `harness security` | Verde | 256 pacotes, 73 commits |

## Refatoração feita após os funcionais verdes

Duas, ambas com os verdes preservados e reverificadas depois:

1. **Execução de subprocesso.** A primeira versão usava `shell: true` com
   argumentos em array, o que dispara o aviso `DEP0190` do Node. A tentativa de
   remover o shell resolvendo `pnpm.cmd` **quebrou o verde**: desde a correção
   do CVE-2024-27980 o Node recusa executar `.cmd` sem shell. A forma final
   monta uma única string já citada — sem aviso, sem args soltos, e caminho com
   espaço continua funcionando.
2. **Paridade de código de saída.** `harness.ps1` usava `Write-Error`, que não
   define código de saída: o mesmo erro dava 2 no bash e 1 no PowerShell.
   Corrigido para 2 e 3 nos dois, propagando o código real da ferramenta.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Não aplicável | Sem comportamento de produto |
| SRE | `sre-agent` | Aprovado | `setup` em ambiente sem estado prévio, versões fixadas por tag exata, reversão por `down -v` testada, custo zero. Falha acionável quando o motor do Docker está desligado |
| Segurança | `security-specialist-agent` | Aprovado com ressalva | Varredura cobre árvore e histórico e foi **provada** por segredo plantado. Ressalva: senha do Postgres local versionada — ver Dívida |
| Arquitetura | `architect-reviewer-agent` | Não aplicável | Nenhuma fronteira de módulo criada |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência em disco; sem escopo extra; incremento MINOR coerente |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| Todo valor de `harness.env` é `pnpm run <script>` | O valor é executado por bash **e** por `cmd.exe`; só o subconjunto comum é seguro. A complexidade migra para `package.json` e `scripts/*.mjs`, idênticos nos dois sistemas |
| Varredura por contêiner com versão fixada | Docker já é pré-requisito; não acrescenta ferramenta a instalar por pessoa e a versão é a mesma no CI |
| `gitleaks dir` **e** `gitleaks git` | Descoberto no teste: `detect` lê só o histórico e deixava passar arquivo não commitado — exatamente o caso que o gate precisa barrar |
| Porta 5433 no host | Evita colisão com um PostgreSQL já instalado na máquina |
| `backend/package.json` stub | O workspace precisa do membro declarado; a estrutura hexagonal é de `HT-009` |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| Senha do Postgres local versionada no compose | Sem ela, `setup` em máquina limpa exigiria passo manual e violaria `RNF-007`. Não protege nada: banco local, sem ambiente remoto até `HT-015`. Allowlist justificada em `.gitleaks.toml` | `HT-008` revisa a política |
| `--with-deps` omitido no Playwright | Exige root no Linux e não existe no Windows | `HT-007` (libs do runner) |
| Passo de migração é um slot vazio | `ADR-002` atribuiu a verificação a `HT-005`, mas o Prisma só nasce em `HT-010` | `HT-010` |
| `gates` ainda não fecha verde de ponta a ponta | `test` e `coverage` não existem até `HT-006` | `HT-006` |
| `setup-ambiente.mjs` e `seguranca.mjs` sem teste unitário | Têm lógica (resolução de binário, agregação de códigos de saída), mas não existe executor de teste até `HT-006`. Verificados por execução, não por teste | `HT-006` |

## Verificação de fechamento

- [x] `scripts/verificar-fechamento.sh v0.7.0` verde
- [x] Tag `v0.7.0` aponta para o mesmo hash do commit
- [x] Evidência presente em `docs/tasks/HT-005/evidencia/` (7 arquivos)
