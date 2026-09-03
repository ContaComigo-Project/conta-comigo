---
name: adr-001-arquitetura-hexagonal-no-backend
description: Decisão de adotar arquitetura hexagonal (ports & adapters) no backend do ContaComigo, com estrutura de pastas, regras de importação e forma de verificação.
document_type: adr
adr_key: ADR-001
status: Aceita
applies_when:
  - criar módulo, caso de uso ou integração externa no backend
  - revisar fronteiras no gate de arquitetura
max_lines: 300
---

# ADR-001 — Arquitetura hexagonal (ports & adapters) no backend

- **Status:** Aceita
- **Data:** 2026-09-02
- **História:** `HT-003` (registro) · implementada por `HT-009`
- **Decidido por:** time do ContaComigo

## Contexto

O épico técnico já exigia domínio isolado e integrações atrás de porta, mas
**nunca nomeou o estilo arquitetural**. "Ports/adapters" aparecia solto em cinco
documentos, e a decisão detalhada era empurrada para `HT-004` — que decide ORM,
teste, autenticação e hospedagem, e não arquitetura.

Consequência prática: `HT-009` implementaria o esqueleto do backend seguindo um
estilo que nenhuma história decidiu. Três pessoas leriam "ports/adapters" e
produziriam três coisas diferentes.

Dois fatos do produto forçam a escolha:

1. **As regras centrais são financeiras e regulatórias.** `RN-001` (faixas do
   semáforo), `RN-017` (a IA não recomenda produto financeiro) e `RN-019` (número
   exibido nunca vem do modelo) precisam de teste barato, rápido e que rode sem
   subir framework, banco ou rede. `RNF-018` exige um teste por RN.
2. **Duas integrações externas são substituíveis por premissa.** Pluggy Sandbox
   pode sair (premissa P1 da `SDD-001`) e o provedor de IA tem teto de custo
   (`RNF-009`). `RNF-020` já exige zero referência a SDK fora do adaptador.

## Alternativas consideradas

### A — NestJS idiomático (controller → service → repository)

| | |
| --- | --- |
| Como funciona | Controller recebe HTTP, service tem a regra, repository fala com o ORM. Tudo dentro de módulos NestJS, com DI por classe concreta |
| A favor | Caminho natural do framework; menos arquivos; qualquer tutorial serve; time aprende mais rápido |
| Contra | A regra de negócio gruda no framework e no ORM. Testar `RN-001` exige subir módulo NestJS. Entidade recebe decorator de ORM. Trocar Pluggy vira cirurgia |
| Por que não foi escolhida | O risco central do produto é numérico e regulatório. Um teste de regra que precisa de banco e framework é lento, frágil e acaba não sendo escrito |

### B — Clean Architecture completa (4 camadas)

| | |
| --- | --- |
| Como funciona | Entities, use cases, interface adapters e frameworks, com DTO próprio em cada travessia de fronteira |
| A favor | Isolamento máximo; fronteiras muito explícitas |
| Contra | Cerimônia alta: mapeamento em toda fronteira, muitos arquivos por funcionalidade |
| Por que não foi escolhida | Três estudantes em tempo parcial. O isolamento extra sobre hexagonal não paga o custo numa PoC |

### C — Hexagonal (ports & adapters) — **escolhida**

Entrega o isolamento que os fatos 1 e 2 exigem, com uma camada a menos de
cerimônia que a alternativa B.

## Decisão

O backend do ContaComigo é **hexagonal**: o domínio no centro, sem conhecer
nada externo; toda entrada e toda saída passam por portas; adaptadores ficam na
borda; o módulo NestJS é o único lugar que liga porta a implementação.

### Estrutura por contexto

```
backend/src/
  <contexto>/                      orcamento, consentimento, lancamentos, ia
    domain/
      model/                       entidades e objetos de valor
      port/
        entrada/                   interfaces dos casos de uso (driving)
        saida/                     interfaces de repositório e provedor (driven)
      <regra>.ts                   regra de domínio pura
    application/                   implementação dos casos de uso
    infrastructure/
      http/                        controllers NestJS (adaptador de entrada)
      persistence/                 repositórios (adaptador de saída)
      pluggy/ gemini/              adaptadores de provedor externo
    <contexto>.module.ts           wiring: porta -> adaptador
```

### Regras de importação (o coração da decisão)

| Camada | Pode importar | **Não pode importar** |
| --- | --- | --- |
| `domain/` | Só TypeScript e outros arquivos de `domain/` | `@nestjs/*`, ORM, `axios`, SDK do Pluggy, LangChain, qualquer I/O |
| `application/` | `domain/` | `infrastructure/`, `@nestjs/*` (exceto tipos puros), ORM |
| `infrastructure/` | `domain/`, `application/`, framework, SDKs | Regra de negócio — ela não mora aqui |
| `<contexto>.module.ts` | Tudo | — é o único ponto que conhece o concreto |

### Regras adicionais

1. **Entidade de domínio não tem decorator.** Nem de ORM, nem de validação de
   transporte, nem de serialização. Se precisar, existe um modelo de persistência
   separado em `infrastructure/persistence/`.
2. **Portas de saída obrigatórias:** `AgregadorOpenFinance`, `ProvedorDeIA`,
   `RepositorioDe<Agregado>` e `Relogio`. O relógio é porta porque `RN-003`
   (mês de referência) e `RN-005` (aviso único por faixa por mês) só são
   testáveis com o tempo sob controle.
3. **Injeção por token, não por classe concreta.** O NestJS resolve a porta por
   símbolo; o domínio nunca vê o nome do adaptador.
4. **Caso de uso não recebe objeto de requisição HTTP.** O controller traduz.
5. **O frontend não é hexagonal.** Ele permanece camada de apresentação,
   consumindo o contrato definido em `HT-017`. Esta decisão vale só para o backend.

## Consequências

**O que ganhamos:**

- `RN-001` e as regras de fronteira da IA são testáveis com objeto em memória,
  sem banco, sem HTTP, sem chave de API — teste rápido o bastante para rodar a
  cada salvamento, o que aumenta a chance de ele existir (`RNF-018`).
- Trocar Pluggy ou Gemini é trocar um adaptador (`RNF-020`).
- O teto de custo de IA (`RNF-009`) e o cache (`RNF-010`) vivem no adaptador,
  sem poluir a regra.
- A guarda de saída da IA (`HT-014`, `RNF-017`) tem um lugar óbvio: o adaptador.

**O que perdemos:**

- Mais arquivos e mais indireção. Para um CRUD trivial, é overhead real.
- O time precisa resistir ao caminho natural do NestJS, que empurra para
  service com ORM injetado direto.
- Curva de aprendizado inicial maior que a alternativa A.

**O que passa a ser obrigatório:**

- Verificação automática das regras de importação no gate (`RNF-021`).
- Todo adaptador externo nasce com uma implementação falsa para teste.

## Como verificar que a decisão está sendo respeitada

A checagem de fronteira roda no harness e no CI, e **bloqueia**:

```
scripts/harness.sh lint      # inclui a checagem de fronteiras de import
```

A ferramenta é escolhida em `HT-004` junto com o restante do ferramental
(dependency-cruiser e eslint-plugin-boundaries são candidatas). O critério não é
a ferramenta: é que um `import` de `@nestjs/common` dentro de `domain/` faça o
gate falhar, e que exista um teste provando que ele falha.

## Como reverter

Se a indireção se mostrar cara demais para o tamanho do time, o caminho de volta
é colapsar `application/` e `infrastructure/http/` em módulos NestJS idiomáticos,
mantendo `domain/` como está. Custo: reescrever o wiring e os controllers.

O que **não** se perde na reversão é o domínio testado — e é por isso que a
reversão é barata. Reverter exige ADR novo substituindo este.

## Requisitos relacionados

`RN-001`, `RN-003`, `RN-005`, `RN-017`, `RN-019` · `RNF-017`, `RNF-018`,
`RNF-020`, `RNF-021`
