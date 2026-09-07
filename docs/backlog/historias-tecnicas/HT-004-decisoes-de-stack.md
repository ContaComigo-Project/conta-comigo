---
name: ht-004-decisoes-de-stack
description: História técnica para fechar as quatro decisões de tecnologia em aberto e registrá-las como ADR com contexto, alternativas e consequência.
document_type: story
story_key: HT-004
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-004` — Decidir tecnologias em aberto e registrar ADRs

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Ready — próxima demanda**
- **Requisitos:** habilita `RNF-007`, `RNF-014`, `RNF-018`, `RNF-019`, `RNF-020`
- **Depende de:** `HT-003`
- **Versão prevista:** `v0.5.0`

## Problema técnico

O estilo arquitetural **já está decidido** em
[`ADR-001`](../../adr/ADR-001-arquitetura-hexagonal-no-backend.md): hexagonal,
ports & adapters. Esta história não o revisita — ela escolhe o ferramental que
precisa caber dentro dele.

Quatro decisões travam toda a fila: ORM, framework de teste, autenticação e
hospedagem. Enquanto elas estiverem em aberto, `HT-005` não consegue escrever o
harness, `HT-006` não escolhe o executor de teste, `HT-010` não modela a
persistência e `HN-001` não tem como autenticar ninguém.

Pior que decidir errado é decidir por omissão: a primeira pessoa que precisar
escolhe sozinha, no meio de outra história, sem registrar o porquê.

## Resultado esperado

As quatro decisões fechadas e registradas como ADR — com contexto, alternativas
consideradas, escolha e **consequência assumida**. Quem chegar depois entende por
que o projeto é assim, e sabe o que precisaria mudar para reverter.

## Decisões a fechar

| # | Decisão | Opções levantadas na `SDD-001` | Bloqueia |
| --- | --- | --- | --- |
| 1 | ORM (**ADR-002**) | Prisma (produtividade e tipagem, menos controle do SQL) · TypeORM (integra com NestJS, migração menos previsível) · Drizzle (SQL explícito, ecossistema menor) | `HT-010` |
| 2 | Teste e checagem de fronteira (**ADR-003**) | Vitest + Playwright (mesmo ecossistema do Vite) · Jest + Cypress (padrão NestJS, mais lento). Inclui a ferramenta que verifica as regras de importação de `ADR-001`: dependency-cruiser · eslint-plugin-boundaries · script próprio | `HT-006`, `HT-009` |
| 3 | Autenticação (**ADR-004**) | JWT próprio (sem dependência, mais superfície para errar) · provedor gerenciado (menos código, dependência externa e limite de free tier) | `HN-001` |
| 4 | Hospedagem (**ADR-005**) | Vercel+Render · Netlify+Fly.io · Railway | `HT-015` |

## Critérios de aceite

- [x] Existe um ADR por decisão em `docs/adr/`, numerados de `ADR-002` a `ADR-005`
- [x] Nenhuma decisão contraria `ADR-001`: o ORM escolhido não pode exigir
      decorator na entidade de domínio, e a ferramenta de teste precisa rodar
      caso de uso sem subir framework
- [x] A decisão de teste nomeia a ferramenta que verifica as fronteiras de
      importação e confirma que ela existe para a stack
- [x] Cada ADR registra contexto, ao menos duas alternativas, escolha e consequência
- [x] Cada ADR declara **o que precisaria acontecer para revertê-la**
- [x] Cada decisão declara o impacto no custo, e nenhuma sai do free tier (`RNF-011`)
- [x] A decisão de autenticação declara como `RNF-013` (autorização no servidor) será atendida
- [x] A decisão de ORM declara como `RNF-014` (cifra em repouso) será atendida
      e como o modelo de persistência ficará separado da entidade de domínio
- [x] A decisão de teste declara como o rastreio RN→teste (`RNF-018`) será verificável
- [x] `EPICO-TECNICO.md` seção 3 atualizado: as quatro linhas saem de "Em aberto"
- [x] `SDD-001` seção 7 atualizada: as quatro questões saem de "em aberto"
- [x] Nenhuma dependência nova é adicionada ao `package.json` nesta história
- [x] A decisão de teste considera que a camada web tem 5.930 linhas sem
      nenhum teste, e declara se ela entra ou não na medição de cobertura

```gherkin
Cenário: uma decisão fechada é rastreável até a consequência
  Dado um ADR aprovado nesta história
  Quando alguém pergunta por que a tecnologia foi escolhida
  Então o ADR responde com contexto, alternativas e consequência assumida
  E indica o que precisaria mudar para a decisão ser revertida
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-011 | R$ 0 recorrente | Cada ADR declara o custo da opção escolhida |
| RNF-020 | Adapters trocáveis | A decisão de ORM não pode acoplar o domínio ao ORM |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não ainda | Define as regras que `HT-009` vai implementar |
| Dependências externas | Decide, não instala | Instalação acontece na história que usa |
| Contratos públicos | Não | — |
| Dados e migração | Decide o ORM | Modelagem é `HT-010` |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Decidir por hype em vez de por necessidade | ADR obriga a declarar consequência, não só benefício | Novo ADR substituindo o anterior, com o motivo |
| Provedor gerenciado estourar o free tier | Custo declarado em cada ADR | Trocar por implementação própria; a porta de autenticação isola |
| ORM acoplar o domínio | `RNF-020` e gate de arquitetura | Reescrever repositórios; o domínio permanece intacto |
| Decisão travar por falta de consenso | Prazo e responsável definidos na `SDD-001` seção 7 | Registrar como premissa, seguir e revisar depois |

## Fora de escopo

- Instalar dependências ou escrever código
- Configurar o harness (é `HT-005`)
- Escrever teste (é `HT-006`)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Sim | Custo, hospedagem e reprodutibilidade |
| Segurança | Sim | A decisão de autenticação define a superfície de ataque |
| Arquitetura | Sim | ORM e teste definem fronteiras e verificabilidade |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] `ADR-002` a `ADR-005` criados e aprovados
- [x] `EPICO-TECNICO.md` e `SDD-001` atualizados
- [x] `docs/entregas/ENTREGA-HT-004-decisoes-de-stack.md` criado
- [x] `KANBAN-OFICIAL.md` atualizado, com `HT-016` movido para `Ready`
- [x] Commit semântico citando `HT-004`
- [x] Tag `v0.5.0` no mesmo hash
