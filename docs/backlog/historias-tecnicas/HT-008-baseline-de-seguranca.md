---
name: ht-008-baseline-de-seguranca
description: Baseline de segurança — identidade do solicitante, autorização por titular com teste negativo por rota, log sem dado financeiro e varredura de segredo estendida ao pacote da web.
document_type: story
story_key: HT-008
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-008` — Baseline de segurança: segredos, autorização, varredura

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Em revisão (ordem 9)
- **Decisão que a rege:** [`ADR-004`](../../adr/ADR-004-autenticacao-jwt-proprio.md), [`ADR-001`](../../adr/ADR-001-arquitetura-hexagonal-no-backend.md)
- **Requisitos:** `RNF-012`, `RNF-013`, `RNF-015`; `RN-015`
- **Depende de:** `HT-009` — `v0.9.0`; `HT-010` — `v0.10.0`. **`HT-007` (CI) está adiada** — ver "Fora de escopo"
- **Versão prevista:** `v0.12.0`

## Problema técnico

`GET /lancamentos` responde a qualquer requisição. Não existe conceito de
titular no domínio, então `RN-015` — "dado de uma pessoa nunca é visível para
outra" — não é violável nem verificável: não há a quem o dado pertença.

`HN-001` (login) vem logo depois. Sem o padrão de autorização pronto **antes**,
ela inventaria o dela, e cada história seguinte copiaria o que encontrasse.
`ADR-004` já decidiu o mecanismo de autenticação; falta a barreira que ele
alimenta.

Log é o outro flanco: `main.ts` escreve com `console.log`, e nada impede que a
primeira exceção com um lançamento dentro despeje valor e descrição no terminal
(`RNF-015`). E sobre `RNF-012` havia uma dúvida em aberto: o **pacote compilado
da web** — onde uma chave embutida por engano acaba parando, e que nunca entra
no git — está mesmo coberto pela varredura?

## Resultado esperado

Existe uma barreira de autorização que qualquer rota nova herda, provada por
teste negativo. O domínio sabe de quem é cada lançamento. Log passa por um
redator que remove dado financeiro e credencial. A varredura de segredo alcança
o `dist/` da web, de forma verificada e guardada contra regressão. E existe a
skill `open-finance-security-agent`, que dá ao gate
um roteiro específico para consentimento, credencial de agregador e isolamento
entre titulares — o julgamento que `security-specialist-agent` não cobre.

## Critérios de aceite

Critério técnico também é verificável. Prefira comando reprodutível a descrição.

- [x] Existe `.agents/skills/open-finance-security-agent/SKILL.md` com
      frontmatter, ≤ 300 linhas, citada no índice de skills e no roteiro de
      gates do `WORKFLOW-AGENTICO.md`
- [x] Existe a porta `Identidade` no domínio; o titular vem da sessão, **nunca**
      de parâmetro de requisição
- [x] `Lancamento` tem `titularId`, com migração commitada, e o repositório
      filtra por titular **na consulta**
- [x] Falha esperada: `GET /lancamentos` **sem credencial** recusa autenticação
      e não devolve conteúdo
- [x] Falha esperada: `GET /lancamentos` com credencial de **outro titular**
      devolve lista vazia — nunca dado alheio, nunca 403 que confirme existência
- [x] Com credencial válida, a pessoa recebe **apenas** os próprios lançamentos
- [x] Existe redator de log; `harness test-unitario` prova que valor, descrição,
      token e e-mail não sobrevivem à serialização
- [x] `harness security` cobre o `dist/` da web, e a cobertura é guardada
      contra regressão silenciosa na allowlist
- [x] Falha esperada: chave plantada no bundle da web é detectada
- [x] Toda evidência registrada por `scripts/registrar-evidencia.sh`

```gherkin
Cenário: dado de uma pessoa não aparece para outra
  Dado dois titulares com lançamentos próprios
  Quando o titular B pede a lista de lançamentos
  Então ele recebe apenas os lançamentos dele
  E nenhum lançamento do titular A aparece na resposta

Cenário: requisição sem credencial não passa da borda
  Dado nenhuma credencial na requisição
  Quando ela chega em GET /lancamentos
  Então a resposta recusa a autenticação
  E nenhum lançamento é lido do banco

Cenário: log não carrega dado financeiro
  Dado um lançamento com descrição e valor
  Quando ele é registrado em log por um erro
  Então o texto do log não contém a descrição nem o valor
  E contém o identificador do lançamento
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-013` | Zero rota protegida sem verificação; cada rota com teste negativo | Guarda no servidor + os três casos negativos em teste |
| `RNF-015` | Zero dado pessoal ou financeiro em log | Redator com teste sobre entidade real |
| `RNF-012` | Zero segredo no repositório, log ou **pacote da web** | Chave plantada no bundle reprova o `security`; teste guarda a allowlist |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | Nova porta `Identidade`; guarda vive em `infrastructure/http/` |
| Dependências externas | Não | Sem biblioteca nova; JWT real é `HN-001` |
| Contratos públicos | Não | O contrato não muda: titular vem da sessão, não do DTO |
| Dados e migração | **Sim** | `titularId` em `lancamentos`, com migração commitada |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Guarda aplicada por engano a rota pública futura | Decorator explícito marca a exceção; padrão é proteger | Remover a guarda do módulo |
| Migração em base com lançamentos sem titular | Base local descartável (`harness down`); coluna nasce com valor de teste | `harness down` recria |
| Redator custar em caminho quente | Roda só na borda do log, sobre campo conhecido | Desligar o redator e registrar dívida |
| Autenticação real divergir do que a guarda espera | `ADR-004` já fixou o formato; a porta isola o mecanismo | `HN-001` ajusta a implementação da porta, não a guarda |

## Fora de escopo

- **Varredura no CI** — o `RNF-012` pede "harness **e** CI"; a metade do CI
  pertence a `HT-007`, adiada. Fica registrado como pendência na entrega
- Emissão e validação de JWT de verdade (`HN-001`, `ADR-004`)
- Cadastro, login, sessão e refresh (`HN-001`)
- Consentimento e credencial de agregador — a skill os cobre; a implementação é
  `HN-002` / `HT-011`
- Log estruturado e observabilidade (`HT-012`)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Testes negativos precisam falhar quando a guarda cai |
| SRE | Sim | `security` muda; `setup` aplica migração nova |
| Segurança | Sim | É a história de segurança |
| Open Finance | Sim | Estreia a skill: isolamento entre titulares e log de dado financeiro |
| Arquitetura | Sim | Porta nova; guarda não pode vazar para o domínio |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Comportamento testável coberto por cenário funcional antes do código
- [x] Refatoração feita após os funcionais verdes
- [x] Testes unitários onde houver lógica
- [x] Gates marcados acima executados com evidência
- [x] Documentação operacional atualizada
- [x] `docs/entregas/` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-008` e tag no mesmo hash — commit feito; **tag aguarda autorização humana**
