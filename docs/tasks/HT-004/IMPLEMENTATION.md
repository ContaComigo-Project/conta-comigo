---
name: implementation-ht-004
description: Plano técnico da história HT-004 — como as quatro decisões de stack são fechadas e registradas como ADR, sem instalar dependência.
document_type: implementation_plan
applies_when:
  - executar tecnicamente a história HT-004
max_lines: 300
---

# IMPLEMENTATION — `HT-004`

- **Requisitos ligados:** `RNF-007`, `RNF-011`, `RNF-013`, `RNF-014`, `RNF-018`, `RNF-019`, `RNF-020`, `RNF-021`
- **Versão prevista:** `v0.5.0`
- **Tipo de mudança:** MINOR (capacidade nova compatível em `0.x`)

## 1. Abordagem

A história não instala nada nem escreve código — decide e documenta. As quatro
decisões foram tomadas pelo time nesta conversa e são registradas como ADR em
`docs/adr/`, seguindo `ADR-000-template.md`. Cada ADR fixa contexto, duas ou
mais alternativas, escolha, consequência, custo, forma de verificação
automatizável e caminho de reversão. Depois, os três artefatos que citam essas
decisões (índice de ADRs, épico técnico seção 3 e SDD-001 seção 7) são
atualizados para refletir que estão fechadas, e o kanban move `HT-004` para
`Done` com `HT-016` liberada como `Ready`.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| TypeORM | Migração menos previsível; acopla mais ao NestJS; decorator na entidade contamina o domínio (`ADR-001`) |
| Drizzle | SQL explícito e leve, mas ecossistema menor; time já valida produtividade do Prisma |
| Jest + Cypress | Padrão NestJS, porém mais lento e ecossistema duplicado com o Vite da web |
| Provedor gerenciado de auth (Clerk/Supabase) | Dependência externa com limite de free tier; risco de custo recorrente (`RNF-011`); decisão é adiada para troca posterior pela porta |
| Vercel+Render / Railway / Netlify+Fly.io já | Hospedagem de homolog/prod fica adiada (`HT-015`); a PoC foca o ambiente de dev agora |

## 3. Fronteiras e design

- Módulos tocados: `docs/adr/`, `docs/backlog/`, `docs/spec-driven-development/`, `docs/entregas/`, `docs/tasks/HT-004/`
- Contratos novos ou alterados: nenhum contrato de software; ADRs são contratos de decisão
- Dependências que entram: **nenhuma** no `package.json` — critério de aceite da história

## 4. Estratégia de testes

Sem comportamento executável nesta história: o único cenário é documental
("uma decisão fechada é rastreável até a consequência"). A verificação é feita
pelos critérios de aceite conferidos manualmente no gate de revisão final, e a
ferramenta de fronteira escolhida (`dependency-cruiser`) passa a ser obrigatória
a partir de `HT-006`/`HT-009`.

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Conferir critérios de aceite da história contra os artefatos produzidos | Todos marcados |
| 2 | Rodar `bash scripts/verificar-fechamento.sh` após commit+tag | Verde |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| ADR responde contexto/alternativas/consequência/reversão | — (documental) | `docs/adr/ADR-002..005` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Sim | Custo declarado em cada ADR; hospedagem adiada de forma explícita |
| Segurança | Sim | `ADR-004` declara `RNF-013`; senha/token tratados como segredo |
| Arquitetura | Sim | `ADR-002/003` respeitam `ADR-001`; fronteiras nomeadas |
| Revisão final | Sim | Critérios de aceite + evidências |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Decidir por hype em vez de necessidade | Baixa | ADR obriga consequência e custo declarados |
| Prisma acoplar o domínio | Média | `RNF-020` + modelo de persistência separado + gate de fronteira |
| JWT próprio errar em segurança | Média | Teste negativo por rota (`RNF-013`), hash de senha forte, gate de segurança em `HN-001` |
| Free tier do Neon/Render mudar até `HT-015` | Média | Decisão de hospedagem adiada e revisitada antes da publicação |

## 7. Plano de reversão

Nada é instalado nem publicado. Se uma decisão se mostrar errada, um ADR novo
substitui o anterior (o antigo vira `Substituída por ADR-XXX`). Custo de
reversão: reescrever o ADR e revisar o artefato que o cita — não há código a
desfazer.

## 8. Fechamento

- Mensagem de commit prevista: `docs(adr): register stack decisions ADR-002..ADR-005 (HT-004)`
- Tag prevista: `v0.5.0` apontando para o commit de fechamento