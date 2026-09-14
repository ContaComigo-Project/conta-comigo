---
name: requisitos-funcionais
description: Catálogo de requisitos funcionais (RF) do ContaComigo, com persona, prioridade, forma de verificação e história associada.
document_type: requirements_catalog
source: SDD-001
applies_when:
  - definir escopo de uma história de negócio
  - rastrear cobertura de teste funcional
max_lines: 300
---

# Requisitos Funcionais (RF)

Derivados de [`SDD-001`](../spec-driven-development/SDD-001-contacomigo-poc.md).

## Como escrever um RF

Formato: `Como <persona>, o sistema deve <capacidade observável> para <resultado de negócio>.`

Válido quando descreve comportamento observável, não descreve solução técnica, e
é verificável por um cenário funcional/BDD.

## Catálogo

### Acesso e conta

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-001 | Criar conta com e-mail e senha | Todas | Must | Cadastro válido cria conta; e-mail duplicado é recusado | HN-001 | Aprovado |
| RF-002 | Autenticar e manter sessão | Todas | Must | Credencial correta entra; incorreta recusa sem revelar qual campo falhou | HN-001 | Aprovado |
| RF-003 | Encerrar sessão | Todas | Must | Após sair, rota privada deixa de responder com dado | HN-001 | Aprovado |
| RF-025 | Excluir conta e todos os dados associados | Todas | Must | Após exclusão, nenhum dado da pessoa é recuperável pela aplicação | HN-012 | Aprovado |

### Open Finance e consentimento

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-004 | Conectar instituição financeira mediante consentimento explícito | Marina, Rita | Must | Sem aceite explícito, nenhuma conexão é criada | HN-002 | Aprovado |
| RF-005 | Listar instituições conectadas com data da última sincronização | Marina | Must | Lista mostra instituição, status e data | HN-002 | Aprovado |
| RF-006 | Revogar consentimento de uma instituição | Todas | Must | Após revogar, dados daquela instituição saem do painel | HN-012 | Aprovado |
| RF-007 | Sincronizar contas, cartões e lançamentos da instituição conectada | Todas | Must | Sincronização traz saldos e lançamentos do período suportado | HN-002 | Aprovado |

### Consolidação

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-008 | Exibir painel consolidado com saldo total e por instituição | Marina | Must | Total exibido é a soma dos saldos das contas ativas | HN-003 | Aprovado |
| RF-009 | Listar lançamentos do período com data, valor, categoria e origem | Todas | Must | Lista ordenada por data, com filtro por mês | HN-003 | Aprovado |

### Legibilidade e categorização

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-010 | Traduzir a descrição técnica do lançamento para linguagem reconhecível | Douglas | Must | Descrição com sigla exibe versão legível; original permanece consultável | HN-004 | Aprovado |
| RF-011 | Atribuir categoria automaticamente ao lançamento | Todas | Must | Todo lançamento recebe categoria ou o estado "não classificado" | HN-005 | Aprovado |
| RF-012 | Corrigir manualmente a categoria de um lançamento | Todas | Must | Correção persiste e passa a valer para o cálculo do orçamento | HN-005 | Aprovado |

### Orçamento semáforo

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-013 | Definir e editar limite mensal por categoria | Marina, Rita | Must | Limite salvo passa a ser a base do percentual | HN-006 | Aprovado |
| RF-014 | Exibir a faixa do semáforo por categoria no mês corrente | Marina | Must | Faixa corresponde a `RN-001` para valores de fronteira | HN-007 | Aprovado |
| RF-015 | Avisar quando o gasto da categoria cruza 70% e 90% do limite | Marina | Should | Cruzar a faixa gera aviso uma vez por faixa por mês | HN-007 | Aprovado |

### Histórico

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-016 | Exibir histórico dos últimos 6 meses por categoria | Rita | Should | Histórico traz meses fechados com gasto e faixa atingida | HN-008 | Aprovado |
| RF-017 | Destacar os três problemas orçamentários mais recorrentes | Rita | Should | Ranking derivado dos meses fechados, não de opinião do modelo | HN-008 | Aprovado |

### Inteligência

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-018 | Gerar diagnóstico de saúde financeira a partir dos dados consolidados | Todas | Must | Diagnóstico cita números que existem no painel | HN-009 | Aprovado |
| RF-019 | Apresentar insights de alerta, oportunidade e meta com ação navegável | Marina | Should | Cada insight leva a uma tela onde a ação é possível | HN-009 | Aprovado |
| RF-020 | Responder dúvidas sobre os próprios números em chat educativo | Douglas | Must | Resposta usa dado da pessoa e linguagem sem jargão | HN-010 | Aprovado |
| RF-021 | Exibir aviso permanente de não aconselhamento financeiro | Todas | Must | Aviso visível em toda superfície com saída de IA | HN-010 | Aprovado |
| RF-022 | Simular plano de compra dentro do orçamento | Douglas | Could | Simulação mostra impacto no semáforo, sem recomendar crédito | HN-011 | Aprovado |

### Relatórios

| ID | Requisito | Persona | Prioridade | Verificação | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RF-023 | Exportar relatório do mês ou do histórico em PDF | Rita | Could | Arquivo gerado abre e contém os mesmos números do painel | HN-011 | Aprovado |
| RF-024 | Exportar lançamentos em CSV | Rita | Could | CSV importa em planilha sem quebra de coluna | HN-011 | Aprovado |

## Cobertura de interface já existente

A camada web foi construída antes deste catálogo, com dados simulados. As telas
abaixo **já existem** e serão preservadas; o que falta é a lógica real por trás
delas. Inventário completo é entregue por `HT-016`.

| RF | Tela / componente atual | O que falta |
| --- | --- | --- |
| RF-001, RF-002 | `pages/auth/register`, `pages/auth/login` | Autenticação real; hoje `Login.tsx` faz `console.log` e `setTimeout` |
| RF-005 | `overview/ConnectedBanksWidget` | Conexão real e status de sincronização |
| RF-008 | `overview/MetricsCards`, `overview/SpendingChart` | Dados consolidados reais |
| RF-009 | `expenses/TransactionsListView`, `expenses/QuickFilterBar`, `expenses/MonthPicker` | Lançamentos vindos do agregador |
| RF-013, RF-014 | `expenses/CategoryCard`, `overview/BudgetProgressChart`, `overview/BudgetAtAGlance` | Persistência do limite e cálculo no domínio |
| RF-016, RF-017 | `expenses/HistoricalOverview` | Histórico real |
| RF-018, RF-019 | `overview/AIInsightPanel` | Integração com o provedor de IA e guarda de saída |
| RF-020, RF-021 | `components/AIChatWidget` | Chat real e aviso permanente verificado |
| RF-023, RF-024 | `expenses/ExportDropdown` | Geração de arquivo |

Sem tela hoje: `RF-003`, `RF-004`, `RF-006`, `RF-007`, `RF-010`, `RF-011`,
`RF-012`, `RF-015`, `RF-022`, `RF-025`.

## Legenda de status

`Rascunho` → `Aprovado` → `Em execução` → `Entregue` → `Obsoleto`

## Fora do catálogo

Iniciação de pagamento, recomendação de investimento ou crédito, análise
preditiva, conta compartilhada e aplicativo nativo estão fora do escopo por
decisão registrada na seção 4 da `SDD-001`.
