---
name: ht-020-backend-english-standard
description: História técnica para padronizar o código e a estrutura do backend em inglês — pastas de contexto, port/driving|driven, arquivos, símbolos, DTOs do contrato e modelos Prisma, sem mudança de comportamento.
document_type: story
story_key: HT-020
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-020` — Padronizar código e estrutura do backend em inglês

- **Tipo:** História técnica (refactor)
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Ready — puxada antes da ordem natural**
- **Requisitos:** `RNF-019` (fronteiras verificadas), `RNF-021` (gates bloqueiam)
- **Depende de:** `HT-009`, `HT-010`, `HT-011`, `HN-001` (código existente estável)
- **Versão prevista:** `v0.16.0`

## Problema técnico

O `AGENTS.md` §5 define código em INGLÊS, mas o backend nasceu em português:
contextos `acesso`, `agregacao`, `lancamentos`, `orcamento`; pastas
`port/entrada` e `port/saida`; arquivos (`criar-conta.ts`, `autenticar.ts`,
`guarda-de-titular.ts`), símbolos (`cadastrar()`, `titular()`) e DTOs do
`@contacomigo/contract` (`CriarContaDTO`, `SessaoDTO`, `LancamentoDTO`). O
ecossistema (TypeScript, NestJS, Prisma, zod) é todo em inglês — o PT vira
ruído diário e viola a regra do próprio repositório.

O custo de migrar cresce com o código: as próximas histórias de negócio
(`HN-002`, `HN-003`) escrevem exatamente nesses módulos e no contrato. Migrar
agora, com ~2.600 linhas e o contrato pequeno, é o preço mínimo.

## Resultado esperado

Código e estrutura do backend 100% em inglês, com **zero mudança de
comportamento** — a suíte verde antes e depois é a prova. Estrutura de pastas
atualizada no `ADR-001`. Modelos Prisma renomeados com `@@map` preservando as
tabelas existentes (migrações intactas).

## Mapa de renomeação (decisão)

| PT | EN |
| --- | --- |
| `acesso` | `access` |
| `agregacao` | `aggregation` |
| `lancamentos` | `transactions` |
| `orcamento` | `budget` |
| `port/entrada` | `port/driving` |
| `port/saida` | `port/driven` |
| DTOs do contrato | `CriarContaDTO`→`CreateAccountDTO`, `CredenciaisDTO`→`CredentialsDTO`, `ContaDTO`→`AccountDTO`, `SessaoDTO`→`SessionDTO`, `RenovacaoDTO`→`RefreshDTO`, `LancamentoDTO`→`TransactionDTO`, `Resultado`→`Result` |
| Modelos Prisma | `Lancamento`→`Transaction`, `Conta`→`Account`, `Sessao`→`Session` (com `@@map` para as tabelas atuais) |

## Critérios de aceite

- [ ] Pastas de contexto renomeadas para `access`, `aggregation`, `transactions`, `budget`
- [ ] `port/driving` e `port/driven` no lugar de `port/entrada` e `port/saida`
- [ ] Nenhum token em português em nomes de arquivo, classe, função ou variável do backend
- [ ] DTOs do `@contacomigo/contract` em inglês e `frontend/src/data` atualizado
- [ ] Modelos Prisma em inglês com `@@map` preservando as tabelas atuais
- [ ] `pnpm run typecheck` verde no backend e na web
- [ ] Suíte completa verde **antes e depois** (comportamento inalterado)
- [ ] `pnpm run lint:fronteiras` verde
- [ ] `ADR-001` atualizado com a nova estrutura de pastas
- [ ] Nenhuma mudança de comportamento: só renomeação

```gherkin
Cenário: o código do backend é consistente com a regra de idioma
  Dado o refactor concluído
  Quando alguém navega pela árvore do backend
  Então pastas, arquivos e símbolos estão em inglês
  E a suíte completa continua verde (nenhuma regra mudou)
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-019` | Fronteiras verificadas | `lint:fronteiras` verde após a renomeação |
| `RNF-021` | Gates bloqueiam | Suíte + typecheck verdes antes e depois |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Renomeia | Nomes de pastas e `port/driving|driven`; estrutura lógica igual |
| Dependências externas | Não | — |
| Contratos públicos | Renomeia DTOs | `@contacomigo/contract` renomeado; frontend atualizado na mesma entrega |
| Dados e migração | Não | `@@map` preserva as tabelas; nenhuma migration muda |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Import quebrado em renomeação | `typecheck` + testes apontam o erro exato | Corrigir o import; `git mv` preserva histórico |
| Contrato renomeado quebrar o frontend | `frontend/src/data` atualizado na mesma entrega | Atualizar o import |
| Renomear sem querer uma tabela | `@@map` explicita a tabela atual | Ajustar o `@@map` |

## Fora de escopo

- Mudar qualquer regra de negócio ou contrato (valores/semântica)
- Renomear as tabelas do banco
- Alterar o frontend além dos imports de `src/dados`
- Alterar commits/entregas passadas (registro histórico)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Suíte verde antes/depois prova zero mudança de comportamento |
| SRE | Sim | Build/typecheck reproduzível |
| Segurança | Sim | Nenhum segredo/credencial toca renomeação; código revisado |
| Arquitetura | Sim | `ADR-001` atualizado; fronteiras intactas |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Renomeação aplicada e suíte verde
- [ ] `ADR-001` atualizado
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HT-020-backend-english-standard.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-020` e tag `v0.16.0` no mesmo hash