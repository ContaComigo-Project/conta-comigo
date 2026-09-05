---
name: inventario-frontend
description: Inventário da camada web existente do ContaComigo — 41 componentes, 9 mocks, regras de negócio fora do domínio, tela para requisito e destino de cada comportamento.
document_type: inventory
applies_when:
  - definir o contrato de dados entre web e API (HT-017)
  - remover a lógica e os mocks do frontend (HT-018)
  - reescrever qualquer HN como integração
max_lines: 300
---

# Inventário do Frontend Existente

- **História:** `HT-016`
- **Data:** 2026-09-05
- **Escopo analisado:** `frontend/src` — 58 arquivos `.ts`/`.tsx`, 5.930 linhas
- **Decisão do time que este documento executa:** **preservar a UI, reescrever a
  lógica.** Componentes, estilo e navegação ficam; toda regra de negócio em
  `src/mocks/` é descartada e reescrita no domínio do backend, com teste antes.
  **Não haverá teste de caracterização sobre os mocks.**

## Resumo executivo

- Frontend **100% mockado**: zero chamada de rede, zero store, zero teste.
- Toda a lógica de negócio real (faixas 70/90, `resolveStatus`,
  `recomputeCategory`, simulador de compra, gastos fixos, PRNG de transações)
  vive em `mocks/budget.mock.ts` e `mocks/chat.mock.ts`, com cópias
  re-hardcoded nas views.
- **Riscos encontrados:** `console.log` de credenciais em `Login.tsx:23` e
  `Register.tsx:53`; identidade pessoal real em `mocks/user.mock.ts:3-5`;
  rotas mortas na navegação; edição de limite sem persistência.
- **Candidatos a extração para o domínio:** `resolveStatus`, `recomputeCategory`,
  faixas 70/90, gastos fixos (moradia + 60% alimentação), simulador de compra
  (impacto > 0,25 vermelho / > 0,12 amarelo), parser de valor monetário,
  `formatBRL`, `formatCPF`, força de senha.

---

## 1. Componentes (41) — classificação e RF servido

### 1.1 `components/ui/` e `hooks/`

| Caminho | RF | Classificação | Motivo |
| --- | --- | --- | --- |
| `components/ui/AnimatedButton.tsx` | — | **Mantém** | UI pura, institucional |
| `components/ui/toast.tsx` | — | **Mantém** | UI pura (Radix), usada por forms e ações |
| `components/ui/toaster.tsx` | — | **Mantém** | UI pura (Radix) |
| `hooks/use-count-up.ts` | — | **Mantém** | Animação de contador (R5); comportamento de apresentação |
| `hooks/use-mounted-animation.ts` | — | **Mantém** | Animação |
| `hooks/use-toast.ts` | — | **Mantém** | `TOAST_LIMIT=3`, `TOAST_REMOVE_DELAY=5000` (R6) — limite de UI, não de negócio |

### 1.2 `pages/auth/`

| Caminho | RF | Classificação | Motivo |
| --- | --- | --- | --- |
| `pages/auth/AuthLayout.tsx` | — | **Mantém** | Layout |
| `pages/auth/login/Login.tsx` | RF-002 | **Adapta** | **`console.log` de credenciais (L23) e `setTimeout` mock** (R7); `HN-001` reescreve com auth real; remover vazamento |
| `pages/auth/register/Register.tsx` | RF-001 | **Adapta** | Validações zod (R4), força de senha (R3), CPF formatado (R2/R1); **`console.log` de dados (L53)** (R8); `HN-001` reescreve |

### 1.3 `pages/dashboard/`

| Caminho | RF | Classificação | Motivo |
| --- | --- | --- | --- |
| `pages/dashboard/DashboardLayout.tsx` | — | **Adapta** | Estrutura; os links herdados de `Sidebar`/`BottomDock` apontam rotas inexistentes |
| `pages/dashboard/components/Sidebar.tsx` | — | **Adapta** | Links para `/dashboard/investimentos`, `/bancos`, `/configuracoes`, `/metas` **não existem** (rotas mortas) — decisão na seção 5 |
| `pages/dashboard/components/BottomDock.tsx` | — | **Adapta** | Idem (rotas mortas) |
| `pages/dashboard/components/AIChatWidget.tsx` | RF-020, RF-021 | **Adapta** | Thresholds 70/90 e `resolveStatus` duplicados (R9), atraso de "digitando" 1100 ms; `HN-010` integra ao provedor de IA e ao aviso permanente |

### 1.4 `pages/dashboard/overview/`

| Caminho | RF | Classificação | Motivo |
| --- | --- | --- | --- |
| `overview/Overview.tsx` | RF-008, RF-009 | **Mantém** | Montagem das seções do painel |
| `overview/WelcomeHeader.tsx` | — | **Mantém** | Saudação |
| `overview/MetricsCards.tsx` | RF-008 | **Adapta** | Contador animado (R24); dados reais via contrato (`HN-003`) |
| `overview/SpendingChart.tsx` | RF-008 | **Adapta** | Somatório/percentual (R24); dados reais via contrato (`HN-003`) |
| `overview/BudgetAtAGlance.tsx` | RF-013, RF-014 | **Adapta** | `resolveStatus` e somatório (R11); regra sai para o domínio (`HN-007`) |
| `overview/BudgetProgressChart.tsx` | RF-013, RF-014 | **Adapta** | Faixas 70/90 **hardcoded na UI** (R12) — violação; domínio vira fonte (`HN-007`) |
| `overview/ConnectedBanksWidget.tsx` | RF-005 | **Adapta** | Soma de saldos (R24); consentimento e sincronização reais (`HN-002`) |
| `overview/RecentActivity.tsx` | RF-009 | **Adapta** | `type === 'credit'` (R24); lançamentos via contrato (`HN-003`) |
| `overview/AIInsightPanel.tsx` | RF-018, RF-019 | **Adapta** | Rotação de insights 6 s (R10), insights fixos; provedor de IA + guarda (`HN-009`) |

### 1.5 `pages/dashboard/expenses/`

| Caminho | RF | Classificação | Motivo |
| --- | --- | --- | --- |
| `expenses/Expenses.tsx` | RF-013, RF-014 | **Adapta** | Somatório de limites sugeridos (R21); cálculo no domínio (`HN-006`) |
| `expenses/components/CategoryCard.tsx` | RF-013 | **Adapta** | Cálculo de % com cap 200 e nudge ±50 duplicados do mock (R18); regra no domínio (`HN-006`) |
| `expenses/components/ExportDropdown.tsx` | RF-022, RF-023, RF-024 | **Adapta** | **Não gera arquivo** (menu vazio); geração real em `HN-011` |
| `expenses/components/HistoricalOverview.tsx` | RF-016, RF-017 | **Adapta** | Média, trend e top 3 problemas (R20); cálculo no domínio (`HN-008`) |
| `expenses/components/MonthPicker.tsx` | RF-014 | **Mantém** | Navegação de mês; integra com mês de referência (`RN-003`) |
| `expenses/components/QuickFilterBar.tsx` | RF-009 | **Mantém** | Filtro de exibição (a regra de ordenação/status fica no domínio) |
| `expenses/components/SegmentedViewToggle.tsx` | — | **Mantém** | Alternância de visualização |
| `expenses/components/TransactionsListView.tsx` | RF-009 | **Adapta** | `PAGE_SIZE=5`, soma de saídas (R19); paginação/soma via contrato (`HN-003`) |
| `expenses/hooks/use-expenses-state.ts` | RF-013 | **Adapta** | Ordenação vermelho→amarelo→verde (R13), edição inline (R14), **overrides sem persistência** (R15); regra e persistência no domínio (`HN-006`) |

### 1.6 `pages/landing/` — sem RF (institucional)

| Caminho | RF | Classificação | Motivo |
| --- | --- | --- | --- |
| `landing/Landing.tsx` | — | **Mantém** | Página institucional pública |
| `landing/components/Header.tsx` | — | **Mantém** | Institucional |
| `landing/components/Hero.tsx` | — | **Mantém** | Contador duplica `useCountUp` (R22) — ajuste cosmético, não regra de produto |
| `landing/components/Benefits.tsx` | — | **Mantém** | Institucional |
| `landing/components/Features.tsx` | — | **Mantém** | Institucional |
| `landing/components/Ecosystem.tsx` | — | **Mantém** | Institucional |
| `landing/components/FAQ.tsx` | — | **Mantém** | Institucional |
| `landing/components/CTA.tsx` | — | **Mantém** | Institucional |
| `landing/components/Footer.tsx` | — | **Mantém** | Institucional |
| `landing/components/BackToTop.tsx` | — | **Mantém** | `scrollY > 300` (R23) — comportamento de UI |
| `landing/components/LandingChatMock.tsx` | — | **Mantém** | Demonstração na landing; `BASE_TS` hardcoded (R) — não é produto |

**Componentes "sem requisito" (decisão registrada):** os 11 arquivos de
`landing/` não servem a nenhum `RF` — são a página institucional pública do
produto, fora do catálogo de requisitos. Não viram RF novo; permanecem como
apresentação de marketing. As rotas mortas de `Sidebar`/`BottomDock`
(`/dashboard/investimentos`, `/bancos`, `/configuracoes`, `/metas`) são bug de
navegação — ver seção 5.

---

## 2. Arquivos de mock (9) — destino

| Caminho | Contém regra de negócio? | Classificação | Motivo |
| --- | --- | --- | --- |
| `mocks/index.ts` | Não | **Descarta** | Barrel; a fronteira de `HT-018` remove |
| `mocks/user.mock.ts` | Não | **Massa de teste** (fictícia) | ⚠️ **Identidade pessoal real** (`name: 'Raul Lize'`, `email: 'raul@contacomigo.app'`) — substituir por identidade fictícia |
| `mocks/metrics.mock.ts` | Não | **Descarta** | Saldos/trends estáticos; dados reais via contrato (`HN-003`) |
| `mocks/spending-categories.mock.ts` | Não | **Massa de teste** | Categorias de exemplo |
| `mocks/transactions.mock.ts` | Não | **Massa de teste** | Formato de lançamento; **valores já pré-formatados** — o contrato (`HT-017`) deve separar número e formatação (`RN-006`) |
| `mocks/connected-banks.mock.ts` | Não | **Massa de teste** | Saldo **duplicado** (número + string formatada) — contrato entrega número; formatação na borda |
| `mocks/ai-insights.mock.ts` | Não | **Descarta** | Insights fixos; `HN-009` usa provedor de IA + guarda |
| `mocks/budget.mock.ts` | **Sim** | **Vira contrato de dados + massa de teste** | Schema de categorias/orçamento alimenta `HT-017`; as regras (faixas 70/90, `resolveStatus`, `recomputeCategory`, trend, PRNG) são **reescritas no domínio** (`HN-006`, `HN-007`) |
| `mocks/chat.mock.ts` | **Sim** | **Vira contrato de dados + massa de teste** | Simulador de compra, gastos fixos, parser de valor e motor de intenção são **promovidos ao domínio** (`HN-010`, `HN-011`); restante vira massa |

---

## 3. Regras de negócio em `src/` (arquivo e linha)

### 3.1 Dentro dos mocks — promovidas ao domínio

| Regra | Onde está | História dona |
| --- | --- | --- |
| Faixas 70/90 (`BUDGET_RULES`) | `mocks/budget.mock.ts:78-81` | `RN-001` → `HN-007` |
| `resolveStatus(percentage)` | `mocks/budget.mock.ts:83-87` | `RN-001` → `HN-007` |
| `recomputeCategory` (cap 200, `remaining`, status) | `mocks/budget.mock.ts:89-94` | `RN-001`, `RN-024` → `HN-006`/`HN-007` |
| Trend % vs mês anterior, percentual, remaining por mês | `mocks/budget.mock.ts:243-262` | `HN-008` |
| Somatório de saldos/categorias, % consolidado, contagem por status, `topCategory` | `mocks/budget.mock.ts:273-306` | `RN-009` → `HN-003` |
| PRNG determinístico (`randInt`) e geração de transações | `mocks/budget.mock.ts:353-413` | Massa de teste (`HT-006`) |
| Formatação BRL (cópia de `utils/formatters.ts`) | `mocks/chat.mock.ts:58-59` | `RN-006` |
| Agregados de orçamento e `topAlert` | `mocks/chat.mock.ts:61-81` | `HN-007` |
| **Gastos fixos = moradia + 60% da alimentação** | `mocks/chat.mock.ts:89-96` | `RN-009` → `HN-009` |
| **Simulador de compra**: impacto `>0,25` vermelho / `>0,12` amarelo; parcelamento 12x; receita fallback 8500 | `mocks/chat.mock.ts:98-139` | `HN-011` |
| Parser de valor monetário (`R$ 3.500` → 3500) | `mocks/chat.mock.ts:141-147` | `HN-011` |
| Classificador por palavra-chave (tv, celular, notebook...) | `mocks/chat.mock.ts:149-156` | `HN-011` |
| Motor de intenção do chat (`generateMockReply`) | `mocks/chat.mock.ts:158-224` | `HN-010` |

### 3.2 Fora dos mocks (views/hooks/utils) — candidatas a extração ou remoção

| Regra | Onde está | Destino |
| --- | --- | --- |
| R1 `formatCPF` / `unformat` | `utils/formatters.ts:1-12` | Domínio/validação (`HN-001`) |
| R2 `formatBRL` | `utils/formatters.ts:14-19` | Bordas (`RN-006`) |
| R3 Força de senha (score 0–4) | `utils/password.ts:7-28` | `HN-001` |
| R4 Schemas zod de auth (senha min 8 no cadastro; CPF sem dígito verificador) | `validations/auth.schema.ts:3-35` | `HN-001` |
| R5 Contador animado (1200 ms, 2 casas, clamp) | `hooks/use-count-up.ts:3-14` | Mantém (UI) |
| R6 Toast (limite 3, 5 s) | `hooks/use-toast.ts:8-9` | Mantém (UI) |
| R7 **Login mockado — `console.log` de credenciais** | `pages/auth/login/Login.tsx:23,26-33` | **Remover/reescrever em `HN-001`** |
| R8 **Registro mockado — `console.log` de dados** | `pages/auth/register/Register.tsx:53,56-64` | **Remover/reescrever em `HN-001`** |
| R9 Thresholds 70/90 + `resolveStatus` duplicados | `pages/dashboard/components/AIChatWidget.tsx:25-29,36-37,85,95` | Domínio (`HN-010`) |
| R10 Rotação de insights (6 s) | `overview/AIInsightPanel.tsx:27,102` | Mantém (UI) |
| R11 Resumo de orçamento (`resolveStatus`, alerta top 2 não-verde) | `overview/BudgetAtAGlance.tsx:10-23` | Domínio (`HN-007`) |
| R12 **Faixas 70/90 hardcoded na UI** (marcadores, cor, ordem) | `overview/BudgetProgressChart.tsx:89-90,105-113,151,181-185` | **Violação — domínio (`HN-007`)** |
| R13 Ordenação vermelho→amarelo→verde e % desc | `expenses/hooks/use-expenses-state.ts:122-131` | Domínio (`HN-005`/`HN-007`) |
| R14 Edição inline de limite (`nudgeDraft` ±50, override por mês) | `expenses/hooks/use-expenses-state.ts:145-196` | `HN-006` |
| R15 ⚠️ **Overrides só em `useState` — perdem no refresh** | `expenses/hooks/use-expenses-state.ts:60-62,84-116` | Persistência em `HN-006` |
| R16 Âncora `#transacoes` (scroll) | `expenses/hooks/use-expenses-state.ts:71-77` | Mantém (UI) |
| R17 Navegação entre meses (default `'jun'`, limites) | `expenses/hooks/use-expenses-state.ts:58,198-208` | `HN-003` |
| R18 Cálculo de % duplicado do mock (cap 200, overflow) | `expenses/components/CategoryCard.tsx:34-41,126-139` | Domínio (`HN-006`) |
| R19 Paginação (5) e soma de saídas | `expenses/components/TransactionsListView.tsx:14-15,29` | Contrato (`HN-003`) |
| R20 Estatísticas históricas (média, trend, top 3 problemas) | `expenses/components/HistoricalOverview.tsx:18-28,72,102-108` | Domínio (`HN-008`) |
| R21 Somatório de limites sugeridos | `expenses/Expenses.tsx:145,156` | Domínio (`HN-006`) |
| R22 Contador do Hero duplica `useCountUp` | `landing/components/Hero.tsx:6,9-24` | Mantém (ajuste cosmético) |
| R23 BackToTop `scrollY > 300` | `landing/components/BackToTop.tsx:8` | Mantém (UI) |
| R24 Somatórios/percentuais em MetricsCards, SpendingChart, ConnectedBanksWidget, RecentActivity | `overview/*.tsx` | Domínio (`HN-003`) |

---

## 4. Resolução de `RN-024` e `RN-025`

| ID | Regra observada | Onde | Decisão | Motivo |
| --- | --- | --- | --- | --- |
| RN-024 | Percentual limitado a 200% | `budget.mock.ts:91` | **Descartada como regra de domínio** | Truncar o dado esconde a gravidade do estouro. O domínio calcula o percentual real (sem cap); a **limitação de exibição** da barra (altura máx. 100%, overflow ≤ 40px) é implementação de UI, não invariante de negócio. `RN-001` e `RN-006` operam sobre o valor real |
| RN-025 | Percentual arredondado a 1 casa antes da faixa | `budget.mock.ts:91` | **Descartada como regra de domínio** | Arredondar antes de decidir a faixa cria fronteira ambígua: 70,04% viraria verde, contrariando `RN-001` (verde até 70% **inclusive**). O domínio compara contra os limites exatos (≤70, ≤90, >90); arredondamento é só de exibição. O caso de borda de `RN-001` (70,04% → amarelo) fica determinístico |

As duas linhas do catálogo saem de `Rascunho` para `Descartada` com este
registro. Nenhuma regra do mock é promovida por inércia: o único estado de
faixa aprovado é o de `RN-001`.

---

## 5. Achados que afetam o escopo das histórias

| Achado | Evidência | Impacto no backlog |
| --- | --- | --- |
| **Rotas mortas** na navegação do dashboard | `Sidebar.tsx`, `BottomDock.tsx` apontam para `/dashboard/investimentos`, `/bancos`, `/configuracoes`, `/metas` — rotas inexistentes | **Decisão:** remover os links mortos em `HN-003` (painel consolidado); se uma página nascer (ex.: gestão de conexões), o link volta. Registrado no kanban |
| **`console.log` de credenciais e dados pessoais** | `Login.tsx:23`, `Register.tsx:53` | Risco de segurança; remover na reescrita de `HN-001`. Evidência para o gate de segurança |
| **Identidade pessoal real em mock** | `mocks/user.mock.ts:3-5`, `chat.mock.ts:235` ("Olá Raul!") | Substituir por identidade fictícia em `HT-018` (remoção dos mocks) — dado pessoal não deve sobreviver à PoC |
| **Edição de limite sem persistência** | `use-expenses-state.ts:60-62` | Confirma que `HN-006` precisa de persistência real (já prevista) |
| **Cobertura da web** | 5.930 linhas, zero teste | Conforme `ADR-003`: a web entra na medição de cobertura a partir de `HT-017` |

---

## 6. Conclusão

- **38 componentes .tsx + 3 hooks de comportamento** inventariados; a UI é
  **preservada** (mantém/adapta), nenhum componente é descartado por razão de
  design — apenas `mocks/` são descartados como fonte de regra.
- **Nenhum comportamento observado ficou indefinido:** cada regra aponta para
  arquivo+linha e para a história que a consome, ou está marcada como decisão
  registrada (landing, rotas mortas).
- **Insumo para `HT-017`:** o contrato deve entregar número e formatação
  separados (`RN-006`), saldo único (sem duplicação número+string), e
  categorias/orçamento com schema derivado de `budget.mock.ts`.
- **Insumo para `HT-018`:** a remoção dos mocks deve apagar `mocks/`, os
  `console.log`, a identidade real e as cópias de regra nas views.