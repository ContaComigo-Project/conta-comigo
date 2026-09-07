---
name: task-hn-001
description: Recorte executável do acesso — contexto acesso, cadastro, autenticação com sessão, encerramento e substituição da identidade provisória.
document_type: task
applies_when:
  - iniciar a execução de uma história
max_lines: 300
---

# TASK — `HN-001`

- **História:** [`docs/backlog/historias/HN-001-acesso.md`](../../backlog/historias/HN-001-acesso.md)
- **Iniciada em:** 2026-09-07
- **Executor:** skill `executor-agent`

## Objetivo em uma frase

A pessoa cria conta, entra, vê só o que é dela e sai — e a senha nunca aparece
em log, resposta ou console do navegador.

## Critérios de aceite copiados da história

- [x] Cadastro cria conta; a resposta não contém senha nem hash (`RF-001`)
- [x] E-mail duplicado é recusado sem revelar que o e-mail existe (`RF-001`)
- [x] Credencial correta entra e passa a ver apenas os próprios lançamentos (`RF-002`)
- [x] Credencial incorreta recusa com a mesma mensagem de e-mail inexistente (`RF-002`)
- [x] Encerrar sessão invalida o refresh e a rota privada para de responder (`RF-003`)
- [x] Senha e hash não aparecem em log, resposta ou mensagem de erro

## Escopo desta task

**Dentro:** contexto `acesso` (domínio, portas, casos de uso, adaptadores);
`Conta` e `Email` no domínio; `HashDeSenha` (bcrypt), `EmissorDeToken` (JWT),
`RepositorioDeContas` e `RepositorioDeSessoes` (Prisma, refresh guardado em
hash); rotas `POST /acesso/contas`, `POST /acesso/sessoes`, `POST
/acesso/sessoes/renovacao`, `DELETE /acesso/sessoes`; DTOs de acesso no
contrato; migração; `IdentidadeDoToken` substituindo `IdentidadeDoCabecalho`;
`JWT_SECRET` no `.env.example` e no `setup`; remoção do `console.log` de
credenciais em `Login.tsx` e `Register.tsx`.

**Fora:** recuperação de senha, verificação de e-mail, provedor externo,
exclusão de conta (`HN-012`), consentimento (`HN-002`), armazenamento do token
na web (`HT-018`).

## Arquivos previstos

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `packages/contrato/src/acesso.ts` + teste | criar | DTOs de cadastro, credenciais e sessão |
| `backend/src/acesso/domain/**` | criar | `Conta`, `Email`, portas de entrada e saída |
| `backend/src/acesso/application/**` + testes | criar | Criar conta, autenticar, renovar, encerrar |
| `backend/src/acesso/infrastructure/cripto/**` + testes | criar | bcrypt e JWT atrás das portas |
| `backend/src/acesso/infrastructure/persistence/**` | criar | Contas e sessões no Prisma |
| `backend/src/acesso/infrastructure/http/acesso.controller.ts` + teste | criar | As quatro rotas |
| `backend/src/acesso/acesso.module.ts`, `app.module.ts` | criar/alterar | Wiring por token |
| `backend/prisma/schema.prisma` + migração | alterar/criar | `contas`, `sessoes` |
| `backend/src/lancamentos/infrastructure/http/identidade-do-token.ts` | criar | Substitui a provisória de `HT-008` |
| `frontend/src/pages/auth/{Login,Register}.tsx` | alterar | Remover `console.log` de credenciais |
| `.env.example`, `scripts/setup-ambiente.mjs` | alterar | `JWT_SECRET` obrigatório |

## Dependências

| Dependência | Estado | Bloqueia? |
| --- | --- | --- |
| `HT-008` barreira por titular | Em revisão (`v0.12.0`) | Não |
| `HT-010` persistência | Done (`v0.10.0`) | Não |
| `HT-017` contrato | Done (`v0.11.0`) | Não |

## Critério de parada

A task termina quando todos os critérios acima estão verdes com evidência —
não quando "parece pronto".
