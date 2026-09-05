---
name: adr-004-autenticacao-jwt-proprio
description: Decisão de implementar autenticação própria com JWT (access + refresh) atrás de porta, sem provedor externo, atendendo RNF-013.
document_type: adr
adr_key: ADR-004
status: Aceita
applies_when:
  - implementar autenticação ou autorização no backend
  - revisar superfície de segurança no gate
max_lines: 300
---

# ADR-004 — Autenticação JWT própria

- **Status:** Aceita
- **Data:** 2026-09-05
- **História:** `HT-004` (registro) · implementada por `HN-001`
- **Decidido por:** time do ContaComigo

## Contexto

Hoje a autenticação é local e simulada no frontend. `HN-001` precisa de
autenticação real antes de existir qualquer dado além de mock. `RNF-013` exige
**autorização verificada no servidor** em toda operação sobre dado de pessoa,
com teste negativo obrigatório por rota. O produto trata dado financeiro como
sensível mesmo em Sandbox, e o projeto tem a restrição de custo **R$ 0
recorrente** (`RNF-011`).

Sem decisão, cada rota autenticaria do seu jeito — ou pior, confiaria no
cliente. O custo de errar aqui é vazamento de dado financeiro de outra pessoa
(`RN-015` — isolamento entre pessoas).

## Alternativas consideradas

### A — JWT próprio — **escolhida**

| | |
| --- | --- |
| Como funciona | Backend emite `access token` JWT (curto, ~15 min) e `refresh token` (longo, opaco, revogável). Senha com hash forte (argon2/bcrypt). A porta de autenticação (`ADR-001`) isola a implementação |
| A favor | Custo recorrente zero e garantido; sem dependência externa nem limite de free tier; controle total do ciclo de vida da sessão; educativo para o time |
| Contra | Mais superfície de segurança para errar: escolha de algoritmo, expiração, revogação de refresh, hash de senha |

### B — Provedor gerenciado (Clerk / Supabase Auth)

| | |
| --- | --- |
| Como funciona | SDK gerencia cadastro, sessão e tokens; o backend valida via API do provedor |
| A favor | Menos código e risco de implementação; auditoria e fluxos prontos |
| Contra | Dependência externa com limite de free tier (risco de `RNF-011`); mais uma integração atrás de porta; dado de cadastro trafega para terceiro |

### C — Sessão de cookie com token opaco no servidor

| | |
| --- | --- |
| Como funciona | Cookie `HttpOnly` + `SameSite` apontando para sessão armazenada no servidor |
| A favor | Simples, revogação trivial, sem JWT em localStorage |
| Contra | Estado de sessão a gerenciar (tabela/redis); mais complexo de escalar em vários processos; a API consumida pela web e por integrações futuras tende a exigir token no header |

## Decisão

A autenticação é **própria, com JWT**: `access token` JWT de curta duração
(~15 min) + `refresh token` opaco de longa duração com revogação. Senha com hash
forte (argon2 ou bcrypt cost). Implementação atrás da porta `Autenticacao`
(`ADR-001`), injetada por token — o domínio não conhece a lib de JWT.

Regras concretas que derivam da escolha:

1. **Autorização no servidor (`RNF-013`).** O guard de rota valida o `access
   token` (assinatura, expiração) e confere o **dono do recurso** — nenhuma rota
   de dado pessoal confia em `id` vindo do cliente. Todo guard tem teste
   negativo: pessoa A não lê dado da pessoa B (`RN-015`).
2. **Token nunca em `localStorage` da web.** O frontend guarda o token em
   memória/cookie seguro; a implementação detalhada é decidida com `HT-017` e
   revisada no gate de segurança de `HN-001`.
3. **Segredo do JWT** em variável de ambiente, nunca versionado (`RNF-012`);
   rotação de chave documentada.
4. **Revogação funcional.** `refresh token` é revogável (logout e `HN-012`),
   e a rota de revogação também tem teste negativo.
5. **Custo zero (`RNF-011`):** nenhuma assinatura mensal, nenhum free tier a
   estourar.

## Consequências

**O que ganhamos:**

- `RNF-011` garantido por construção (zero dependência de terceiro).
- Controle total de sessão, exigido por `RN-013`/`RN-016` (revogação, exclusão).
- A porta de autenticação permite trocar por provedor gerenciado depois sem
  tocar no domínio (`RNF-020`).

**O que perdemos:**

- Implementação de segurança que precisará passar com rigor pelo gate de
  segurança em `HN-001`.
- Não temos auditoria pronta de terceiro — a revisão é nossa.

**O que passa a ser obrigatório:**

- Guard de autorização por dono em toda rota de dado pessoal, com teste
  negativo (`RNF-013`, `RN-015`).
- Senha com hash forte e token com expiração curta.
- Segredo fora do repositório, do log e do pacote da web (`RNF-012`).

## Como verificar que a decisão está sendo respeitada

```
scripts/harness.sh test-funcional  # cenário: pessoa A recebe 403 ao ler dado da pessoa B
scripts/harness.sh security        # varredura de segredo; revisão de guard por rota
```

## Como reverter

Adotar provedor gerenciado exige: novo ADR substituindo este, implementar o
adaptador na porta `Autenticacao` e migrar sessões. Casos de uso e domínio não
mudam — a fronteira de `ADR-001` isola a troca.

## Requisitos relacionados

`RNF-011`, `RNF-012`, `RNF-013` · `RN-012`, `RN-013`, `RN-015`, `RN-016`