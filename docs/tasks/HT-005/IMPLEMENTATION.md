---
name: implementation-ht-005
description: Plano técnico do harness local reprodutível — workspace pnpm, PostgreSQL por compose e registro dos comandos do projeto.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-005`

- **Requisitos ligados:** `RNF-007`, `RNF-012`, `RNF-021`
- **Versão prevista:** `v0.7.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Transformar a raiz do repositório no ponto único de execução, sem tocar em
código de produto.

O `harness.sh` já é agnóstico: lê `scripts/harness.env` e falha explicitamente
quando a variável está vazia. Esta história **preenche** esse registro; não
reescreve o harness, exceto pela correção de paridade descrita abaixo.

Restrição descoberta na execução: `harness.sh` usa `eval` em bash e
`harness.ps1` usa `& cmd.exe /c`. O valor de cada variável precisa ser válido
nos **dois** interpretadores. Verificado nesta máquina que `&&` encadeia e
propaga código de saída em ambos, e que `=` dentro do valor sobrevive ao parser
do `.ps1` (`Split("=", 2)` preserva o resto). Não são portáteis: `$(...)`,
`${VAR}`, aspas simples, `;` e `||`.

Consequência de projeto: **todo valor de `harness.env` é `pnpm run <script>`**.
A complexidade real (múltiplos passos, detecção de sistema, condicionais) vive
em `package.json` da raiz e em `scripts/*.mjs`, que são idênticos em Linux e
Windows por construção — o que satisfaz a exigência de paridade melhor que um
par `.sh`/`.ps1` que pode divergir.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Manter `frontend/` isolado, sem workspace na raiz | O harness precisaria de `cd`, que não é portátil no subconjunto bash∩cmd; e o lint precisa cobrir o repositório inteiro |
| Escrever os comandos diretamente em `harness.env` | Estoura o subconjunto portátil na primeira flag com aspas ou condicional |
| Preencher `HARNESS_TEST*` com `echo ok` até `HT-006` | Harness que finge sucesso é pior que harness ausente; contraria o próprio `scripts/README.md` |
| SQLite no dev local em vez de Postgres | `ADR-002` fixou PostgreSQL; divergir do banco de produção quebra `RNF-007` |
| Instalar gitleaks como binário na máquina | Docker já é pré-requisito; contêiner com versão fixada não exige instalação por pessoa |

## 3. Fronteiras e design

Nenhuma fronteira de módulo é criada — não há código de produto nesta história.
`backend/package.json` nasce como stub vazio apenas para o workspace ter o
membro declarado; a estrutura hexagonal de `ADR-001` é responsabilidade de
`HT-009`.

Arquivos criados na raiz: `package.json`, `pnpm-workspace.yaml`, `.npmrc`,
`.nvmrc`, `docker-compose.yml`, `.env.example`, `.gitleaks.toml`,
`scripts/harness.env`, `scripts/setup-ambiente.mjs`, `scripts/seguranca.mjs`,
`backend/package.json`.

## 4. Estratégia de testes

História operacional: a prova é execução do harness, não teste unitário. A
ordem do ciclo é respeitada registrando o **vermelho antes** de preencher cada
comando — o estado atual do repositório já é o vermelho natural.

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | `registrar-evidencia.sh HT-005 AGIR lint ... --esperar-falha` antes de qualquer arquivo | Vermelho: "harness.env não existe" |
| 2 | Criar workspace, compose e `harness.env` | `setup`, `lint`, `build`, `security` verdes |
| 3 | Refatoração: comandos longos migram para `scripts/*.mjs` | Tarefas continuam verdes |
| 4 | Provar que tarefa não configurada ainda falha | `test-unitario` sai com exit 3 |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| Ambiente sobe do zero | `RNF-007` | evidência de `harness setup` |
| Tarefa sem comando falha explícita | `RNF-021` | evidência de `harness test-unitario` |
| Paridade de código de saída | `RNF-007` | evidência comparando `.sh` e `.ps1` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Não | Sem comportamento de produto |
| SRE | Sim | `harness setup`, `gates`, `down` em máquina limpa, com evidência |
| Segurança | Sim | `harness security`; revisão da credencial local versionada |
| Arquitetura | Não | Nenhuma fronteira criada |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Divergência de exit code entre `.sh` e `.ps1` | **Confirmada** — 2 contra 1 no mesmo erro | Corrigir nesta história; é pré-requisito do CI de `HT-007` |
| Senha de dev versionada acusada pelo gate | Alta | Allowlist justificada em `.gitleaks.toml`, registrada como dívida |
| Imagem de varredura exigir rede na primeira execução | Média | Versão fixada e cache local; fallback `pnpm audit` documentado |
| `pnpm install` na raiz quebrar o build do frontend | Média | `build` e `lint` verificados antes do fechamento |

## 7. Plano de reversão

`git revert` do commit de fechamento devolve o estado anterior: sem
`harness.env`, o harness volta a falhar explicitamente — que é o comportamento
documentado hoje. `docker compose down -v` remove o contêiner e o volume. Nenhum
dado de produção é tocado porque não existe produção (`ADR-005`).

## 8. Fechamento

- Mensagem de commit prevista: `build(harness): make the local environment reproducible (HT-005)`
- Tag prevista: `v0.7.0` apontando para o commit de fechamento
