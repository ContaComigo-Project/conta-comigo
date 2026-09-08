---
name: sdd-001-contacomigo-poc
description: Especificação inicial do ContaComigo — problema, personas, escopo da PoC, fluxos, candidatos a requisito, decisões em aberto e quebra proposta em histórias.
document_type: specification
spec_key: SDD-001
status: Aprovada
max_lines: 300
---

# SDD-001 — ContaComigo (PoC)

- **Autores:** Raul Lize Teixeira, Miguel Leonardo Strapazon Lewandowski, Thiago Rodrigues Caputi
- **Orientador:** Everton Oliveira Fernandes
- **Data:** 2026-09-02
- **Status:** Aprovada
- **Fonte:** [`docs/RESUMO-MOCITEC.md`](../RESUMO-MOCITEC.md) e `README.md`

## 1. Problema

A ausência de educação financeira funciona como barreira invisível que aprofunda
desigualdade e limita a ascensão das famílias brasileiras. Sobre essa base, o
projeto ataca quatro dores concretas:

| # | Dor | Consequência observável |
| --- | --- | --- |
| 1 | **Fragmentação** — contas e cartões espalhados por várias instituições | A pessoa nunca vê o total real; consolidar manualmente custa tempo demais para ser feito com a frequência necessária |
| 2 | **Opacidade** — extratos com siglas e códigos indecifráveis | A pessoa não reconhece o próprio gasto; não se controla o que não se entende |
| 3 | **Falta de diagnóstico** — ver os números não é saber o que eles dizem | Mesmo com os dados à vista, a pessoa não sabe se está bem nem o que fazer |
| 4 | **Ferramenta inadequada** — alternativas exigem lançamento manual ou vocabulário financeiro | Abandono do app em poucas semanas; volta ao controle por memória |

**Aposta do projeto:** o Open Finance regulamentado pelo BACEN resolve a dor 1
com consentimento; a IA generativa resolve as dores 2 e 3. A combinação é o que
justifica o produto existir.

## 2. Público e personas

> As personas abaixo são **hipóteses de trabalho** construídas a partir do
> público descrito no resumo. **Não são resultado de pesquisa com usuários.**
> Validá-las ou corrigi-las é trabalho pendente e está registrado na seção 7.

| Persona | Contexto | Objetivo | Dor principal |
| --- | --- | --- | --- |
| **Marina, 34** — auxiliar administrativa | Conta salário, uma conta digital e dois cartões. Controla por print de tela e memória | Saber quanto ainda pode gastar até o fim do mês | Descobre que estourou quando a fatura fecha, e aí já é tarde |
| **Douglas, 22** — primeiro emprego | Um cartão, limite baixo, entrou no rotativo sem entender como | Entender para onde o dinheiro foi | Não reconhece metade dos lançamentos da fatura por causa das siglas |
| **Rita, 45** — autônoma | Renda variável, mistura gasto pessoal e da atividade na mesma conta | Separar o que é dela do que é do trabalho e prever mês ruim | Meses desiguais tornam qualquer orçamento fixo inútil |

**Stakeholders que não são usuários:** banca avaliadora da MOCITEC, professor
orientador e o próprio time de desenvolvimento.

## 3. Resultado esperado

A pessoa abre o aplicativo e, em menos de um minuto, responde três perguntas que
hoje ela não consegue responder: *quanto eu tenho*, *para onde foi* e *estou bem
ou mal*.

| Indicador de produto | Como mediríamos |
| --- | --- |
| Tempo até a primeira resposta útil após conectar a instituição | Cronometragem em teste de usabilidade |
| Proporção de lançamentos que a pessoa reconhece sem ajuda | Teste com usuário comparando descrição original e descrição limpa |
| Redução do tempo de controle orçamentário | Comparação com o método atual declarado pela pessoa |

Na PoC, esses indicadores são medidos em validação simulada, não em produção.

## 4. Escopo

**Dentro:**

- Aplicação **web responsiva**, mobile-first
- Cadastro, autenticação e sessão
- Conexão a instituições via **Pluggy Sandbox**, com consentimento explícito
- Consolidação de contas, cartões e lançamentos em painel único
- Limpeza semântica das descrições de lançamento
- Categorização de lançamentos, com correção manual
- Limite mensal por categoria e **orçamento semáforo** (70% / 90%)
- Histórico de 6 meses com tendências e problemas recorrentes
- Diagnóstico de saúde financeira e insights por IA
- Chatbot educativo com barreira permanente de não aconselhamento
- Exportação de relatórios em PDF e CSV
- Revogação de consentimento e exclusão de dados (LGPD)

**Fora (explicitamente):**

1. Aplicativo **mobile nativo** — declarado como visão futura no resumo
2. **Dados bancários reais** — apenas Pluggy Sandbox nesta fase
3. **Iniciação de pagamento** (Pix, transferência, pagamento de fatura)
4. **Recomendação de investimento ou crédito** — vedado por regulação
5. **Análise preditiva avançada** — visão futura, não PoC
6. **Multiusuário / conta familiar compartilhada**
7. **Integração com instituições fora do agregador**
8. **Suporte offline**

## 5. Fluxos principais

### 5.1 Primeiro acesso (caminho feliz)

```
Cadastro -> Login -> "Conectar instituição" -> consentimento explícito
  -> sincronização assíncrona -> painel consolidado com saldo e lançamentos
  -> lançamentos com descrição legível e categoria sugerida
```

### 5.2 Orçamento semáforo

```
Definir limite mensal da categoria -> app calcula gasto do mês na categoria
  -> exibe faixa: verde (<=70%), amarelo (>70% e <=90%), vermelho (>90%)
  -> alerta ao cruzar faixa
```

### 5.3 Diagnóstico e conversa

```
Painel -> "Diagnóstico" -> IA lê dados consolidados (não o extrato bruto)
  -> alertas, oportunidades e metas com aviso de não aconselhamento
  -> chatbot responde dúvidas sobre os próprios números
```

### 5.4 Caminhos alternativos relevantes

| Situação | Comportamento esperado |
| --- | --- |
| Instituição indisponível na sincronização | Painel mostra dado da última sincronização, com data e aviso; não some com a tela |
| Sem dados suficientes para diagnóstico | Estado explícito "dados insuficientes", nunca um diagnóstico inventado |
| Provedor de IA indisponível | Painel numérico continua funcionando; bloco de IA degrada com aviso |
| Pessoa revoga consentimento | Dados daquela instituição saem do painel e entram em exclusão |
| Pessoa pede recomendação de investimento ao chatbot | Recusa educada + redirecionamento educativo, sempre |

## 6. Candidatos a requisito

| Tema | Vira |
| --- | --- |
| Cadastro, login, sessão, exclusão de conta | `RF-001` a `RF-003`, `RF-025` |
| Consentimento, conexão, sincronização, revogação | `RF-004` a `RF-007` |
| Painel consolidado e lançamentos | `RF-008`, `RF-009` |
| Limpeza semântica e categorização | `RF-010` a `RF-012` |
| Limite, semáforo e alerta | `RF-013` a `RF-015` |
| Histórico e tendências | `RF-016`, `RF-017` |
| Diagnóstico, insights, chatbot, simulação | `RF-018` a `RF-022` |
| Exportação | `RF-023`, `RF-024` |
| Faixas do semáforo, não aconselhamento, procedência do número, consentimento | `RN-001` a `RN-023` |
| Desempenho, acessibilidade, segurança, custo de IA, LGPD, reprodutibilidade | `RNF-001` a `RNF-021` |

Catálogos completos em [`docs/requisitos/`](../requisitos/).

## 7. Decisões em aberto

| Questão | Opções | Quem decide | Prazo |
| --- | --- | --- | --- |
| Personas são hipótese; falta validação | Teste com 3 a 5 pessoas do perfil / seguir por hipótese declarada | Time | Antes de `HN-007` (semáforo) |
| ~~ORM da camada de persistência~~ | **Resolvida:** Prisma + PostgreSQL — `ADR-002` | `HT-004` | Feito |
| ~~Framework de teste funcional e E2E~~ | **Resolvida:** Vitest + Playwright + dependency-cruiser — `ADR-003` | `HT-004` | Feito |
| ~~Autenticação real~~ | **Resolvida:** JWT próprio — `ADR-004` | `HT-004` | Feito |
| Teto de custo por usuário/dia na IA | Definir número | `HT-012` | Antes de `HN-009` |
| Prazo de exclusão após revogação | ~~Imediato / até 24h / até 15 dias~~ | **Resolvida:** exclusão definitiva em até **24h** (`RN-013`) — `HN-012` | Time + orientador | Feito |
| ~~Hospedagem~~ | **Adiada por decisão:** dev local primeiro; provedores em `HT-015` — `ADR-005` | `HT-004`/`HT-015` | Antes da publicação |

## 8. Riscos e premissas

| Risco / Premissa | Impacto | Mitigação |
| --- | --- | --- |
| **R1** — IA gerar número errado e a pessoa acreditar | Alto: destrói a confiança e pode induzir decisão ruim | `RN-019`: número exibido nunca vem do modelo; IA só interpreta o dado já consolidado |
| **R2** — IA cruzar a fronteira do aconselhamento regulado | Alto: risco regulatório e reputacional | `RN-017` e `RN-018`, com teste negativo obrigatório no gate de segurança |
| **R3** — Custo de token estourar o free tier | Médio: paralisa o projeto sem orçamento | `RNF-009` e `RNF-010`: teto por pessoa/dia e cache de resposta |
| **R4** — Sandbox não representar a realidade dos dados | Médio: limpeza semântica pode parecer melhor do que é | Declarar a limitação na entrega; não prometer acurácia de produção |
| **R5** — Escopo grande demais para 3 estudantes em tempo parcial | Alto: nada fica pronto | Fila cronológica com WIP 1 e histórias pequenas |
| **P1** — Pluggy Sandbox permanece gratuito e disponível | — | Adapter atrás de porta (`RNF-020`) permite troca |
| **P2** — Free tier do Gemini atende o volume da PoC | — | Monitorar consumo desde a primeira integração |

## 9. Quebra proposta

| Item | Tipo | Épico | Justificativa |
| --- | --- | --- | --- |
| Stack, testes, harness, CI, segurança, observabilidade | `HT-004` a `HT-009` | Técnico | Nada de produto é confiável sem isso primeiro |
| Esqueleto do backend e fronteiras | `HT-010` | Técnico | Domínio isolado antes da primeira regra |
| Adapters Pluggy, Gemini e persistência | `HT-011` a `HT-013` | Técnico | Integração externa atrás de porta |
| Guarda de saída da IA | `HT-014` | Técnico | Implementa `RN-017`, `RN-018`, `RN-019` |
| Publicação | `HT-015` | Técnico | Fecha a PoC apresentável |
| Acesso, consentimento, painel, legibilidade, orçamento, histórico, IA, exportação, LGPD | `HN-001` a `HN-012` | Negócio | Comportamento percebido pela pessoa |

Ordem detalhada em [`KANBAN-OFICIAL.md`](../backlog/KANBAN-OFICIAL.md).
