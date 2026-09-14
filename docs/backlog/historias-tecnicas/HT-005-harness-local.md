---
name: ht-005-harness-local
description: Harness local reprodutível — workspace pnpm, PostgreSQL por docker compose com versão fixada e os comandos do projeto registrados em scripts/harness.env.
document_type: story
story_key: HT-005
story_type: tecnica
epic: EPIC-TEC-001
status: Done
max_lines: 300
---

# `HT-005` — Harness local reprodutível com docker compose

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Done (ordem 6) — `v0.7.0` → `3f57b53`
- **Decisão que a rege:** [`ADR-005`](../../adr/ADR-005-hospedagem-adiada.md)
- **Requisitos:** `RNF-007`; habilita `RNF-021`
- **Depende de:** `HT-004` (stack decidida) — concluída
- **Versão prevista:** `v0.7.0`

## Problema técnico

`scripts/harness.env` não existe, então **toda** tarefa do harness sai com
"comando não configurado" (exit 3) ou "harness.env não existe" (exit 2). O
projeto não tem um único comando que prove qualquer coisa: não há como rodar
lint, teste, cobertura ou varredura de segurança pelo caminho oficial.

A consequência atinge o processo inteiro. Os gates de QA e SRE hoje são
julgamento sobre prosa — a `ENTREGA-HT-004` declara que "os critérios foram
conferidos linha a linha na revisão final", que é o melhor possível sem
execução. Sem harness, o ciclo Ralph nunca chega aos passos 3 a 6.

Além disso `frontend/` é uma ilha: tem seu próprio `pnpm-lock.yaml` e nenhum
ponto de entrada na raiz, e `backend/` contém apenas um `README.md`.

## Resultado esperado

Qualquer pessoa clona o repositório, roda um comando e tem ambiente completo;
roda outro e tem o veredito de qualidade. O mesmo comando serve para o CI em
`HT-007`, sem divergência — é isso que `ADR-005` chama de contrato mínimo de
reprodutibilidade.

Tarefas que dependem de código ainda inexistente continuam **falhando de forma
explícita**, nunca fingindo sucesso.

## Critérios de aceite

Critério técnico também é verificável. Prefira comando reprodutível a descrição.

- [x] `scripts/harness.sh setup` retorna sucesso em máquina limpa e deixa o
      PostgreSQL saudável
- [x] `scripts/harness.sh lint`, `build` e `security` retornam sucesso
- [x] `docker compose ps` mostra o serviço `postgres` com estado `healthy`, na
      versão fixada por tag exata
- [x] `scripts/harness.sh down` derruba o ambiente e remove o volume
- [x] Falha esperada é detectada: `scripts/harness.sh test-unitario` sai com
      **exit 3** e a mensagem "comando não configurado", porque o alvo ainda não
      existe — o harness não finge sucesso
- [x] Falha esperada é detectada: `harness.sh` e `harness.ps1` retornam o
      **mesmo código de saída** para o mesmo erro
- [x] `git status --porcelain` fica limpo após `setup` — nada não-ignorado é
      gerado
- [x] Toda evidência acima registrada por `scripts/registrar-evidencia.sh`

```gherkin
Cenário: ambiente sobe do zero em máquina limpa
  Dado um clone novo do repositório e nenhum contêiner em execução
  Quando executo scripts/harness.sh setup
  Então as dependências são instaladas com o lockfile congelado
  E o PostgreSQL responde a pg_isready na versão fixada
  E o comando retorna código de saída zero

Cenário: tarefa sem comando configurado falha de forma explícita
  Dado que HARNESS_TEST_UNIT ainda não tem comando
  Quando executo scripts/harness.sh test-unitario
  Então a saída diz "comando não configurado (HARNESS_TEST_UNIT)"
  E o código de saída é 3
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-007` | Zero passo manual fora do harness | `setup` em máquina limpa, com evidência registrada |
| `RNF-012` | Nenhum segredo versionado | Varredura de segredo no `security`; senha local declarada em allowlist justificada |
| `RNF-021` | Gates bloqueiam de fato | `gates` para no primeiro erro; `HT-007` leva o mesmo comando ao CI |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Nenhum código de produto é escrito |
| Dependências externas | Sim | PostgreSQL por docker compose; ferramentas de varredura via contêiner |
| Contratos públicos | Não | — |
| Dados e migração | Não | O fluxo de migração pertence a `HT-010`, quando o Prisma existir |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Docker indisponível na máquina | `setup` verifica e aborta com instrução acionável | Remover `docker-compose.yml`; harness volta a falhar explicitamente |
| Senha de dev versionada acusada pelo gate de segurança | Allowlist explícita por caminho, justificada e registrada como dívida | Mover para `.env` e aceitar o passo manual |
| Workspace na raiz quebra o build do frontend | `build` e `lint` verificados antes do fechamento | `git revert`; `frontend/` volta a ser autônomo |
| Ferramenta de varredura exigir rede | Imagem fixada e cacheada após o primeiro uso | Trocar por `pnpm audit`, registrado como ressalva |

## Fora de escopo

- Instalar Vitest, Playwright ou dependency-cruiser — é `HT-006`
- Escrever qualquer teste — é `HT-006`
- Pipeline de CI — é `HT-007`
- Esquema Prisma, migração ou qualquer código de backend — é `HT-009`/`HT-010`
- Decidir hospedagem — é `HT-015`

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento de produto; a prova é operacional |
| SRE | Sim | Ambiente, reprodutibilidade, versões fixadas e reversão |
| Segurança | Sim | Varredura de segredo e credencial local versionada |
| Arquitetura | Não | Nenhuma fronteira de módulo é criada |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Comportamento testável coberto por cenário funcional antes do código
- [x] Refatoração feita após os funcionais verdes
- [ ] Testes unitários onde houver lógica — **não feito**: os scripts `.mjs` têm lógica, mas não existe executor de teste até `HT-006`. Dívida registrada na entrega
- [x] Gates marcados acima executados com evidência
- [x] Documentação operacional atualizada
- [x] `docs/entregas/` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [x] Commit semântico citando `HT-005` e tag no mesmo hash
