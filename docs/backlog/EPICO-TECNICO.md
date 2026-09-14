---
name: epico-tecnico
description: Épico técnico do ContaComigo — requisitos não funcionais, arquitetura, segurança, observabilidade, testes, CI/CD, versionamento e operação.
document_type: epic
epic_key: EPIC-TEC-001
source: SDD-001
applies_when:
  - criar ou revisar uma história técnica
  - avaliar impacto arquitetural, de segurança ou de operação de uma demanda
max_lines: 300
---

# Épico Técnico — `EPIC-TEC-001`

- **Estado:** Ativo
- **Responsáveis:** skills `architect-reviewer-agent`, `sre-agent`, `security-specialist-agent`
- **Fonte:** [`SDD-001`](../spec-driven-development/SDD-001-contacomigo-poc.md)
- **Chaves derivadas:** `HT-000` a `HT-018`

## 1. Objetivo técnico

Sustentar o épico de negócio com um sistema que possa ser mudado com segurança
por três estudantes em tempo parcial: testável, observável, reproduzível em
qualquer máquina e defensável em revisão.

Duas restrições moldam todas as decisões: **custo zero** (só free tier) e
**dado sensível** (financeiro, mesmo simulado, tratado como se fosse real).

## 2. Requisitos não funcionais

Fonte: [`REQUISITOS-NAO-FUNCIONAIS.md`](../requisitos/REQUISITOS-NAO-FUNCIONAIS.md)

| RNF | Categoria | Alvo | História |
| --- | --- | --- | --- |
| RNF-001 a RNF-004 | Desempenho e experiência | Painel p95 ≤ 2 s; feedback ≤ 1 s; 360 px; WCAG AA | `HN-002`, `HN-003`, `HN-007`, `HT-010` |
| RNF-005, RNF-006 | Resiliência | Degradação graciosa; timeout ≤ 10 s e até 2 tentativas | `HT-011`, `HT-013` |
| RNF-007 | Reprodutibilidade | Zero passo manual fora do harness | `HT-005` |
| RNF-008 | Observabilidade | Erro rastreável sem acesso à máquina | `HT-012` |
| RNF-009 a RNF-011 | Custo | Teto de IA por pessoa/dia, cache obrigatório, R$ 0 recorrente | `HT-013`, `HT-015` |
| RNF-012 a RNF-017 | Segurança e privacidade | Zero segredo versionado; autorização no servidor; cifra em repouso; log limpo; saída de IA validada | `HT-008`, `HT-010`, `HT-012`, `HT-014`, `HN-001`, `HN-012` |
| RNF-018 a RNF-021 | Qualidade | Toda RN com teste; ≥ 80% no domínio; fronteiras verificadas; gates bloqueantes | `HT-006`, `HT-007`, `HT-009` |

## 3. Arquitetura

- **Estilo:** **arquitetura hexagonal (ports & adapters)** no backend, com a
  camada web separada como apresentação. Decidido em
  [`ADR-001`](../adr/ADR-001-arquitetura-hexagonal-no-backend.md), que define
  estrutura de pastas, regras de importação e forma de verificação.
  O frontend **não** é hexagonal: consome o contrato de `HT-017`.
- **Fronteiras:** o domínio financeiro não conhece NestJS, ORM, HTTP, Pluggy nem
  Gemini. Dependências apontam para dentro.
- **Ports/adapters obrigatórios:** agregador Open Finance, provedor de IA,
  persistência e **relógio** — o relógio é porta porque `RN-003` e `RN-005` só
  são testáveis com o tempo sob controle.
- **Decisões:** registradas como ADR em [`docs/adr/`](../adr/); decisão sem
  consequência declarada não é decisão.

| Decisão | Alternativas | Escolha | Consequência |
| --- | --- | --- | --- |
| Estilo arquitetural do backend | Hexagonal / NestJS idiomático / Clean Architecture | **Hexagonal — `ADR-001`** | Domínio testável sem framework, banco ou rede; custo assumido: mais arquivos e indireção. Materializada por `HT-009` |
| Camada web | React 19 + TS 6 + Vite 8 + Tailwind 4 | **Decidida e implementada** | 41 componentes, 5.930 linhas, 9 mocks, zero testes. Mudança de stack agora custaria a PoC inteira |
| Destino do código web existente | Integrar como está / preservar UI e reescrever lógica / descartar | **Preservar a UI, reescrever a lógica** | Componentes e estilo ficam; toda regra hoje em `src/mocks/` é descartada e reimplementada no domínio, com teste antes. Executado por `HT-016`, `HT-017` e `HT-018` |
| API | NestJS + TypeScript | **Decidida, não implementada** | Um só idioma no projeto; estrutura opinativa favorece fronteiras |
| Agregador Open Finance | Pluggy Sandbox | **Decidida, não implementada** | Atrás de porta (`RNF-020`); troca continua possível |
| Provedor de IA | Google Gemini + LangChain.js | **Decidida, não implementada** | Atrás de porta; custo é o principal risco (`RNF-009`) |
| Persistência | PostgreSQL | **Decidida, não implementada** | Docker fixa a versão |
| ORM | Prisma / TypeORM / Drizzle | **Prisma + PostgreSQL — `ADR-002`** | Cliente tipado e migrações versionadas; modelo de persistência separado da entidade de domínio (`ADR-001`); cifra em repouso na borda (`RNF-014`). Materializado por `HT-010` |
| Framework de teste | Vitest+Playwright / Jest+Cypress | **Vitest + Playwright + dependency-cruiser — `ADR-003`** | Um ecossistema (Vite) para web e backend; dependency-cruiser verifica as fronteiras de `ADR-001`; cobertura ≥ 80% no domínio. Materializado por `HT-006` |
| Autenticação | JWT próprio / provedor gerenciado | **JWT próprio — `ADR-004`** | Custo zero garantido (`RNF-011`); autorização no servidor com teste negativo por rota (`RNF-013`); atrás de porta (`RNF-020`). Materializado por `HN-001` |
| Hospedagem | Vercel+Render / Netlify+Fly.io / Railway | **Adiada — dev local primeiro — `ADR-005`** | Provedores decididos em `HT-015` com termos vigentes de free tier; critério fixo de R$ 0 recorrente (`RNF-011`) |

## 4. Segurança e privacidade

| Tema | Definição | História |
| --- | --- | --- |
| Autenticação | Hoje local e simulada. Precisa virar autenticação real antes de qualquer dado além de mock | `HT-004`, `HN-001` |
| Autorização | Verificada **no servidor** em toda operação sobre dado de pessoa; teste negativo obrigatório por rota (`RNF-013`, `RN-015`) | `HT-008`, `HN-001` |
| Dados sensíveis e retenção | Dado financeiro tratado como sensível mesmo em Sandbox; retenção e prazo de exclusão declarados à pessoa (`RNF-016`, `RN-013`, `RN-016`) | `HN-012` |
| Segredos e credenciais | Chaves de Pluggy e Gemini fora do repositório, do log e do pacote da web; varredura no harness e no CI (`RNF-012`) | `HT-008` |
| Cifra em repouso | Token de consentimento e credencial de agregador cifrados (`RNF-014`) | `HT-010` |
| Saída do modelo | Tratada como entrada não confiável: validação de formato e coerência numérica antes de exibir (`RNF-017`, `RN-019`) | `HT-014` |
| Dependências | Versões fixadas e verificação de vulnerabilidade no gate | `HT-007`, `HT-008` |

## 5. Estratégia de testes

Ordem obrigatória por história com comportamento testável:

1. Cenário funcional/BDD escrito e **vermelho**;
2. Código produtivo mínimo até ficar **verde**;
3. **Refatoração** com os funcionais verdes;
4. Testes unitários para casos de borda e cobertura.

| Camada | Ferramenta | Escopo | Gate |
| --- | --- | --- | --- |
| Funcional/BDD | Playwright em Chromium (`ADR-003`) | Um cenário por critério de aceite; um teste por RN | Bloqueante |
| Unitário | Vitest (`ADR-003`) | Domínio e casos de borda; ≥ 80% no domínio | Bloqueante |
| Estático/lint | ESLint 9 + typescript-eslint (web); mesma base na API | Todo o repositório | Bloqueante |
| Segurança | Varredura de segredo e de dependência | Todo o repositório | Bloqueante |
| Acessibilidade | Verificação de contraste e teclado | Telas com semáforo e formulários | Bloqueante em `HN-007` |

**Regra que não se negocia:** para cada RN existe um teste que ficaria vermelho
se a regra fosse invertida (`RNF-018`). Sem isso, o gate de QA reprova.

## 6. Harness e ambiente local

Um comando por tarefa, o mesmo local e em CI. Ver
[`scripts/README.md`](../../scripts/README.md).

`HT-005` preenche `scripts/harness.env` e sobe PostgreSQL por docker compose com
versão fixada. Até lá o harness falha explicitamente — comportamento intencional.

## 7. CI/CD e publicação

| Etapa | Gatilho | Gates | Artefato |
| --- | --- | --- | --- |
| Verificação | Push em qualquer branch e abertura de PR | lint, testes, cobertura, segurança | Relatório |
| Integração | Merge em `develop` | Todos acima | Build |
| Publicação | Merge em `main` com tag | Todos acima | PoC publicada |

Gate configurado como aviso não é gate (`RNF-021`). Ferramenta e hospedagem
decididas em `HT-007` e `HT-015`.

## 8. Observabilidade e operação

| Sinal | O que responde | Ferramenta |
| --- | --- | --- |
| Log estruturado | O que aconteceu, em qual requisição, sem dado pessoal (`RNF-008`, `RNF-015`) | Definida em `HT-012` |
| Métrica de custo | Quantas chamadas de IA por pessoa por dia (`RNF-009`) | Contador próprio, `HT-013` |
| Erro | Qual falha, onde, com correlação até a operação | Definida em `HT-012` |
| Integração externa | Latência e taxa de falha de Pluggy e Gemini | `HT-011`, `HT-013` |

## 9. Versionamento

Versionamento semântico por entrega: `MAJOR.MINOR.PATCH`.

- `MAJOR`: quebra de contrato percebida por consumidor;
- `MINOR`: capacidade nova compatível;
- `PATCH`: correção ou ajuste interno sem mudança de contrato.

Enquanto a PoC estiver em `0.x`, capacidade nova incrementa `MINOR`. Cada
entrega fecha com commit semântico citando a chave e tag no **mesmo hash**.

## 10. Riscos técnicos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Custo de IA estourar o free tier | Paralisa o projeto | Teto por pessoa/dia e cache obrigatório (`RNF-009`, `RNF-010`) |
| Regra de negócio vazar para controlador ou ORM | Torna a regra intestável e o sistema caro de mudar | `ADR-001` + checagem de fronteira que quebra o build (`HT-009`) |
| Time contornar a fronteira por pressa do prazo | Hexagonal exige resistir ao caminho natural do NestJS | A violação falha no gate, não depende de disciplina |
| Acoplamento ao SDK do Pluggy ou do Gemini | Impede troca de provedor | Adapters atrás de porta (`RNF-020`) |
| Segredo versionado por engano | Exposição de credencial | Varredura no harness e no CI (`RNF-012`) |
| Backend nascer sem teste porque "é só PoC" | Dívida que inviabiliza as histórias de IA | `HT-006` antes de `HT-010`; ordem do kanban protege isso |
| Regra duplicada entre `frontend/src/mocks/` e o domínio | Divergência silenciosa: a tela mostra um número, e é o errado | `HT-017` cria a fronteira, `HT-018` apaga a cópia; até lá o mock é observação, não especificação |
| Formato acidental dos mocks moldar a API | Contrato desenhado pela conveniência da tela, não pelo domínio | `HT-016` separa requisito de acidente antes de `HT-017` desenhar o contrato |
| Time parcial e intermitente | Entrega pela metade | Histórias pequenas, WIP 1, entrega documentada por história |
