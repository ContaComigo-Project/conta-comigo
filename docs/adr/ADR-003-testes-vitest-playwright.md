---
name: adr-003-testes-vitest-playwright
description: Decisão de usar Vitest para testes unitários, Playwright para testes funcionais/E2E e dependency-cruiser para checagem de fronteiras.
document_type: adr
adr_key: ADR-003
status: Aceita
applies_when:
  - escrever ou executar testes no repositório
  - verificar as fronteiras de importação do ADR-001
max_lines: 300
---

# ADR-003 — Vitest + Playwright + dependency-cruiser

- **Status:** Aceita
- **Data:** 2026-09-05
- **História:** `HT-004` (registro) · implementada por `HT-006`
- **Decidido por:** time do ContaComigo

## Contexto

`RNF-018` exige um teste por regra de negócio, `RNF-019` exige fronteiras
verificadas e `ADR-001` obriga que um `import` de `@nestjs/common` dentro de
`domain/` faça o gate falhar. A stack precisa de duas coisas: um executor de
testes que rode caso de uso **sem subir framework, banco ou rede**, e uma
ferramenta que verifique as regras de importação da arquitetura hexagonal.

Fato de contexto: a camada web tem 5.930 linhas e **zero testes**. Ela não é
hexagonal e consome o contrato de `HT-017`; decidir se ela entra na medição de
cobertura agora define a linha de base de `RNF-018`.

## Alternativas consideradas

### A — Vitest + Playwright + dependency-cruiser — **escolhida**

| | |
| --- | --- |
| Como funciona | Vitest roda testes unitários no domínio sem subir framework (transforma TS nativamente, espelha o Vite); Playwright faz o funcional/E2E no navegador; dependency-cruiser valida as regras de importação de `ADR-001` |
| A favor | Um só ecossistema (Vite) para web e backend; execução rápida; dependency-cruiser é agnóstico de framework e cobre a checagem de fronteira exigida por `ADR-001` |
| Contra | Duas ferramentas de testes (Vitest e Playwright) em vez de uma; Playwright exige baixar navegadores no harness |

### B — Jest + Cypress

| | |
| --- | --- |
| Como funciona | Jest para unitário, Cypress para E2E |
| A favor | Padrão tradicional do ecossistema NestJS |
| Contra | Execução mais lenta; ecossistema duplicado com o Vite já usado na web; configuração de TS no Jest é mais frágil; Cypress é mais pesado que Playwright para a mesma tarefa |

### C — Uma única ferramenta (ex.: Vitest para tudo)

| | |
| --- | --- |
| Como funciona | Vitest também tocaria o navegador via jsdom |
| A favor | Menos dependências |
| Contra | `jsdom` não prova comportamento real de navegador; as jornadas J1–J4 precisam ser percorríveis de ponta a ponta (critério do épico de negócio) — isso pede um navegador de verdade |

## Decisão

O repositório usa **Vitest** para testes unitários (domínio e casos de borda),
**Playwright** para testes funcionais/BDD e E2E, e **dependency-cruiser** para
verificar as fronteiras de importação de `ADR-001`.

Regras concretas que derivam da escolha:

1. **Cenário por critério de aceite, um teste por RN** (`RNF-018`): cenários
   funcionais/BDD em Playwright; regras puras e casos de borda em Vitest, no
   domínio, sem subir framework/banco/rede.
2. **Checagem de fronteira bloqueante** (`RNF-021`): dependency-cruiser é parte
   do `lint` do harness e do CI; um `import` de `@nestjs/*` ou `@prisma/client`
   dentro de `domain/` quebra o gate.
3. **Rastreio RN→teste verificável**: cada RN tem um cenário nomeado
   `RN-XXX` no teste; o gate de QA confere cobertura de RN antes de aprovar.
4. **Cobertura de código**: medição de cobertura é obrigatória no **domínio**
   (≥ 80%, `RNF-018`). A camada web (5.930 linhas, zero teste) **entra na
   medição só a partir de `HT-017`**, quando passa a consumir o contrato real —
   exigir 80% dela agora tornaria `HT-006` inviável sem reescrever a UI, que é
   exatamente o que o time decidiu evitar. A partir de `HT-017`, a web entra no
   alvo de cobertura progressivamente.

## Consequências

**O que ganhamos:**

- Teste de regra financeira rápido, sem framework nem banco — aumenta a chance
  de ele existir (`RNF-018`).
- Uma ferramenta agnóstica e determinística para as fronteiras de `ADR-001`.
- Um só ecossistema de build (Vite) entre web e testes.

**O que perdemos:**

- Duas ferramentas de teste (Vitest + Playwright) para manter no harness.
- Playwright exige baixar navegadores no setup (custo único do `HT-005`).

**O que passa a ser obrigatório:**

- dependency-cruiser no lint do harness e no CI (`HT-006`, `HT-007`).
- Cenário `RN-XXX` nomeado para cada regra, conferido no gate de QA.
- Cobertura ≥ 80% no domínio; web entra na medição a partir de `HT-017`.

## Como verificar que a decisão está sendo respeitada

```
scripts/harness.sh test-funcional   # Playwright: um cenário por critério de aceite
scripts/harness.sh test-unit        # Vitest: domínio + borda, cobertura >= 80%
scripts/harness.sh lint             # dependency-cruiser: fronteiras de ADR-001
```

## Como reverter

Trocar por Jest+Cypress ou por ferramenta única exige: novo ADR substituindo
este, reescrever a configuração do harness (`HT-005`/`HT-006`) e migrar os
cenários. Os testes de domínio em Vitest são portáveis; o custo real está na
reescrita do E2E.

## Requisitos relacionados

`RNF-018`, `RNF-019`, `RNF-021` · `RN-001` a `RN-023` (cobertura de regra)