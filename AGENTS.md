---
name: agents-root-entrypoint
description: Ponto de entrada de agentes LLM (Trae, Claude Code, Cursor, Copilot) para o repositório ContaComigo. Ponteiros para a fonte da verdade, regras inegociáveis e próxima demanda. Este arquivo NÃO duplica conteúdo.
document_type: agents_manifest
applies_when:
  - um agente abre o repositório pela primeira vez
  - um agente precisa saber onde estão as regras oficiais
max_lines: 200
---

# AGENTS.md — Ponto de Entrada para Agentes LLM

> **Fonte da verdade MORA em `.agents/*`, versionada no git.**
> Aqui temos APENAS ponteiros na ordem correta e o resumo executivo do que NÃO PODE ser quebrado.
> Qualquer conflito entre este arquivo e `.agents/` resolve-se por `.agents/`.

---

## 1. Leitura obrigatória — 4 arquivos, nesta ordem, ANTES de qualquer ação

| # | Arquivo | O que você aprende lá |
|---|---|---|
| 1 | [`.agents/prompts/setup-inicial/PROMPT.md`](.agents/prompts/setup-inicial/PROMPT.md) | Regras 01..12b mestras — kanban, WIP, Ralph Loop, gates, língua, estrutura de artefatos |
| 2 | [`docs/WORKFLOW-AGENTICO.md`](docs/WORKFLOW-AGENTICO.md) | Ciclo operacional dos 10 passos de uma história, como iniciar, fechar e gates aplicáveis |
| 3 | [`docs/backlog/KANBAN-OFICIAL.md`](docs/backlog/KANBAN-OFICIAL.md) | **Fonte única da próxima demanda.** Coluna `Ordem` soberana. `WIP = 1`. |
| 4 | [`.agents/skills/commit-conventions/SKILL.md`](.agents/skills/commit-conventions/SKILL.md) | Commits em INGLÊS + `Generated-by-AI: <modelo exato>` quando houver assistência de IA. |

Leu estes 4? Você sabe 95 % do que precisa para atuar aqui sem quebrar nada.

---

## 2. Índice oficial dos artefatos e documentação

| Artefato | Caminho (fonte da verdade) |
|---|---|
| Skills / portas de gate / papéis | [`.agents/skills/README.md`](.agents/skills/README.md) |
| Rules / invariantes bloqueantes | [`.agents/rules/README.md`](.agents/rules/README.md) |
| Prompts mestres | [`.agents/prompts/README.md`](.agents/prompts/README.md) |
| Ciclo Ralph (Perceber → Registrar) | [`.agents/prompts/ralph-loop/PROMPT.md`](.agents/prompts/ralph-loop/PROMPT.md) |
| Épico de negócio (produto, personas) | [`docs/backlog/EPICO-NEGOCIO.md`](docs/backlog/EPICO-NEGOCIO.md) |
| Épico técnico (arq, segurança, RNF) | [`docs/backlog/EPICO-TECNICO.md`](docs/backlog/EPICO-TECNICO.md) |
| Requisitos estáveis RF / RN / RNF | [`docs/requisitos/README.md`](docs/requisitos/README.md) |
| ADRs — por que este projeto é assim | [`docs/adr/README.md`](docs/adr/README.md) |
| Spec-Driven Development (SDD-001) | [`docs/spec-driven-development/README.md`](docs/spec-driven-development/README.md) |
| Linha do tempo entregas (tag + hash) | [`docs/entregas/README.md`](docs/entregas/README.md) |
| Planos de execução por história | [`docs/tasks/README.md`](docs/tasks/README.md) |
| Scripts utilitários | [`scripts/README.md`](scripts/README.md) |
| Frontend (React + Vite) | [`frontend/README.md`](frontend/README.md) |
| Arquitetura frontend | [`docs/FRONTEND_ARCHITECTURE.md`](docs/FRONTEND_ARCHITECTURE.md) |

---

## 3. Regras inegociáveis — NÃO AS QUEBRE

1.  **WIP = 1.** Puxe SEMPRE o item `Ready` com **menor `Ordem`**. A chave HT/HN não é ordem.
2.  **Commitar em INGLÊS.** Tipo, escopo, descrição, corpo e rodapés. Apenas chaves HT/HN, nomes de pessoas e paths já existentes em pt permanecem.
3.  **Rodapé `Generated-by-AI: <modelo exato>` obrigatório** se um modelo sugerir, escrever, refinar, revisar ou validar **qualquer pedaço** do commit ou do diff. 1 modelo por linha. Linha ausente = garantia formal de 100 % humano.
4.  **Staging seletivo, sempre.** `git add -A` e `git commit -am` são **proibidos** no commit de entrega.
5.  **Amend proibido em commit publicado.** `HEAD` que já chegou ao `origin/*` nunca recebe `--amend`.
6.  **Push, tag e release SÓ com autorização humana explícita nesta conversa.** Nenhum deles automático.
7.  **Estrutura de artefato agêntico é 1 pasta = 1 artefato:**
    ```
    Skills  →  .agents/skills/<nome>/SKILL.md
    Rules   →  .agents/rules/<nome>/RULE.md
    Prompts →  .agents/prompts/<nome>/PROMPT.md
    ```
    `assets/` dentro de cada pasta é OPCIONAL e só existe se tiver conteúdo real.
8.  **Nenhum `Refs:`, `Depende de:` ou link de entrega aponta para caminhos LOCAIS de IDE particular.** Esses diretórios são propriedade da instalação de cada pessoa e nunca são versionados. Tudo que deve ser compartilhado com a equipe mora OBRIGATORIAMENTE em `.agents/*` ou `docs/*`.

---

## 4. Próxima demanda hoje

Em `docs/backlog/KANBAN-OFICIAL.md`, a coluna `Ready` está **vazia**. Nada é
puxável agora — puxar algo de `Backlog` direto quebra o fluxo de estados.

Último item concluído: `HT-016` (Ordem 5) — `v0.6.0` → `5ebeb8a`, corrigido em
`v0.6.1` → `c3bfb55`.

Próximo da fila:

> **`HT-005` — Harness local reprodutível com docker compose** (Ordem 6, estado
> `Backlog`, depende de `HT-004` — já concluída).

Ela ainda **não tem arquivo de história**: pela regra de grooming, o arquivo é
criado quando o item entra em `Ready`. Então a próxima ação do time é groomar
`HT-005` (criar `docs/backlog/historias-tecnicas/HT-005-harness-local.md` com
critérios verificáveis) e movê-la para `Ready` — só depois ela é puxada.

`HT-005` destrava a fila inteira: hoje `scripts/harness.env` não existe, então
toda tarefa de gate falha com "comando não configurado".

---

## 5. Idiomas do repositório

| Assunto | Idioma |
|---|---|
| Specs, docs de design, ADRs, tests, código, commits, CI, infra, pipelines | INGLÊS |
| README apresentação ao público, UI strings do React, RESUMO-MOCITEC.md, cards, banners, tela de chatbot | **PT-BR** |
| Comunicação com o usuário final (você neste chat) | **PT-BR** |

---

## 6. Receita rápida de como agir aqui

| Situação | O que fazer |
|---|---|
| Começar uma história | `scripts/nova-historia.sh HT-XXX`; atualiza Kanban para *Em execução* **antes** de codar. |
| Fechar uma história | Ordem: QA / SRE / Security / Arquitetura gates → **final-reviewer** → **git-operator** (commit + tag, só com OK humano). |
| Nova skill / rule / prompt | 1 pasta por artefato + nome fixo. Se precisar de anexos, cria `assets/` na mesma hora. |
| Dúvida sobre formato de commit | Lê `commit-conventions/SKILL.md` inteiro. |
| Dúvida sobre o porquê de uma decisão | Busca o ADR. Sem ADR = cria ADR durante a história que consome a decisão. |

---

*Conflito entre instruções? Aplicar sempre neste ordem:*
`.agents/prompts/setup-inicial/PROMPT.md` → `RULEs` bloqueantes → `KANBAN-OFICIAL.md` → este `AGENTS.md`.
