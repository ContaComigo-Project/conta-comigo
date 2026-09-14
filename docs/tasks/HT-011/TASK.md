---
name: task-ht-011
description: Recorte executável da porta de agregação — porta obrigatória, adaptador falso, decorador de resiliência e adaptador Pluggy Sandbox.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HT-011`

- **História:** [`docs/backlog/historias-tecnicas/HT-011-adaptador-pluggy.md`](../../backlog/historias-tecnicas/HT-011-adaptador-pluggy.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent` (loop autônomo)

## Objetivo em uma frase

A porta obrigatória de `ADR-001` existe, com política de falha única e testada,
para que `HN-002` consuma um contrato em vez de começar pelo SDK.

## Critérios de aceite copiados da história

- [x] `AgregadorOpenFinance` em `domain/port/saida/`; lint prova que SDK não entra em `domain/`
- [x] `AgregadorFalso` determinístico, sem rede
- [x] `AgregadorPluggy` com credencial do ambiente, nunca do repositório
- [x] Falha esperada: provedor lento interrompido em ≤ 10 s, com erro tratável
- [x] Falha esperada: transitório tentado no máximo 2 vezes mais, com espera crescente
- [x] Erro permanente não é tentado de novo
- [x] Falha esperada: consulta de lançamentos responde com o agregador fora
- [x] Credencial e token não aparecem em log
- [x] Sem credencial, o Pluggy recusa operar
- [x] Evidência por `registrar-evidencia.sh`

## Escopo desta task

**Dentro:** contexto `agregacao`; `ContaExterna` e `LancamentoExterno` no
domínio; `ResultadoDaAgregacao` com motivo classificado; porta
`AgregadorOpenFinance`; `AgregadorFalso`; `AgregadorResiliente` (decorador com
timeout e retry); `AgregadorPluggy` (Sandbox, `fetch`); módulo com wiring por
token; `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` no `.env.example`.

**Fora:** consentimento, conexão e sincronização (`HN-002`); persistir o que
vem do agregador (`HN-002`); tela (`HN-002`); cifra do token (primeiro uso é
`HN-002`).

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `backend/src/agregacao/domain/model/*.ts` | criar | Conta e lançamento externos; resultado com motivo |
| `backend/src/agregacao/domain/port/saida/agregador-open-finance.ts` | criar | A porta obrigatória de `ADR-001` |
| `backend/src/agregacao/infrastructure/agregador/agregador-falso.ts` + teste | criar | Determinístico, sem rede |
| `backend/src/agregacao/infrastructure/agregador/agregador-resiliente.ts` + teste | criar | Timeout e retry, testados com relógio falso |
| `backend/src/agregacao/infrastructure/agregador/agregador-pluggy.ts` + teste | criar | Sandbox; recusa sem credencial |
| `backend/src/agregacao/agregacao.module.ts`, `app.module.ts` | criar/alterar | Wiring por token |
| `tests/fronteiras/fixtures/violacao/**` | alterar | Fixture provando que SDK em `domain/` reprova |
| `.env.example` | alterar | Credenciais do Pluggy documentadas |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-009` esqueleto e portas | Done (`v0.9.0`) | Não |
| `HT-008` redator de log | Em revisão (`v0.12.0`) | Não |
| Credencial do Pluggy Sandbox | **Ausente** | Não — o falso cobre os testes; o teste do Pluggy pula com aviso |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
