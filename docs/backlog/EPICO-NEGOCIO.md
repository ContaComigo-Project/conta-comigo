---
name: epico-negocio
description: Épico de negócio do ContaComigo — visão, personas, jornadas, requisitos funcionais e regras de negócio que originam as histórias de negócio.
document_type: epic
epic_key: EPIC-NEG-001
source: SDD-001
applies_when:
  - criar ou revisar uma história de negócio
  - avaliar se uma demanda pertence ao escopo de produto
max_lines: 300
---

# Épico de Negócio — `EPIC-NEG-001`

- **Estado:** Ativo
- **Responsável:** skill `product-manager`
- **Fonte:** [`SDD-001`](../spec-driven-development/SDD-001-contacomigo-poc.md)
- **Chaves derivadas:** `HN-001` a `HN-012`

## 1. Visão

> Para **a pessoa bancarizada que nunca teve educação financeira formal** e que
> hoje controla o próprio dinheiro de cabeça, o **ContaComigo** é uma
> **aplicação web de gestão financeira pessoal** que **consolida as contas de
> várias instituições via Open Finance e usa IA generativa para explicar o que
> os números querem dizer**. Diferente das planilhas e dos aplicativos de
> lançamento manual, ele **não exige disciplina nem vocabulário financeiro:
> traduz o extrato, mostra a faixa de risco do orçamento e responde perguntas
> em linguagem comum**.

O produto é educativo e preventivo. Ele explica à pessoa o dinheiro dela — não
recomenda investimento, não intermedeia crédito e não substitui profissional
certificado.

## 2. Resultado de negócio esperado

| Indicador | Baseline | Alvo | Prazo | Como medimos |
| --- | --- | --- | --- | --- |
| Tempo até a primeira resposta útil depois de conectar a instituição | Controle manual: minutos a horas | < 1 minuto | Fim da PoC | Cronometragem em teste de usabilidade |
| Lançamentos que a pessoa reconhece sem ajuda | Fatura crua: reconhecimento parcial | Maioria dos lançamentos reconhecida | Após `HN-004` | Comparação entre descrição original e limpa, com pessoa do perfil |
| Pessoa sabe dizer se está bem ou mal no mês | Não sabe | Sabe, e sabe por quê | Após `HN-009` | Pergunta direta em teste de usabilidade |

Na PoC os indicadores são medidos em validação simulada, não em produção com
usuário real.

## 3. Personas

> **Hipóteses de trabalho**, derivadas do público descrito no resumo MOCITEC.
> Não vieram de pesquisa com usuários — validá-las é decisão aberta na seção 7
> da `SDD-001`.

| Persona | Quem é | Objetivo | Dor | Prioridade |
| --- | --- | --- | --- | --- |
| **Marina, 34** | Auxiliar administrativa; conta salário, conta digital e dois cartões; controla por print e memória | Saber quanto ainda pode gastar no mês | Descobre o estouro quando a fatura fecha | Primária |
| **Douglas, 22** | Primeiro emprego, primeiro cartão, entrou no rotativo sem entender | Entender para onde o dinheiro foi | Não reconhece os próprios lançamentos por causa das siglas | Primária |
| **Rita, 45** | Autônoma, renda variável, mistura gasto pessoal e da atividade | Prever mês ruim e separar o que é dela | Meses desiguais tornam orçamento fixo inútil | Secundária |

## 4. Jornadas e fluxos principais

### J1 — Da instalação ao primeiro valor

Cadastro → login → conectar instituição com consentimento explícito →
sincronização assíncrona → painel consolidado com saldo, cartões e lançamentos
já legíveis e categorizados.

**Momento de valor:** a pessoa vê, pela primeira vez, o total real dela.

### J2 — Controlar o mês

Definir limite por categoria → acompanhar a faixa do semáforo → receber aviso ao
cruzar 70% e 90% → ajustar o gasto antes do fim do mês.

**Momento de valor:** o aviso chega enquanto ainda dá para agir.

### J3 — Entender e aprender

Diagnóstico de saúde financeira → insights com ação navegável → conversa no chat
sobre os próprios números, sempre com o aviso de não aconselhamento.

**Momento de valor:** a pessoa entende o porquê, não só o quanto.

### J4 — Manter o controle dos próprios dados

Ver instituições conectadas → revogar consentimento → excluir conta e dados.

**Momento de valor:** a pessoa percebe que o dado continua sendo dela.

## 4.1 Nota sobre o estado da interface

As telas destas quatro jornadas **já existem**, construídas com dados simulados
antes deste épico. As histórias `HN-001` a `HN-012` são majoritariamente de
**integração**: a tela está pronta, falta o comportamento real por trás dela.

Duas exceções, sem tela hoje: `HN-012` (revogação e exclusão) e a correção
manual de categoria dentro de `HN-005`.

O mapa tela→requisito está em
[`REQUISITOS-FUNCIONAIS.md`](../requisitos/REQUISITOS-FUNCIONAIS.md), seção
"Cobertura de interface já existente"; o inventário completo é entregue por `HT-016`.

## 5. Requisitos funcionais cobertos

Fonte: [`REQUISITOS-FUNCIONAIS.md`](../requisitos/REQUISITOS-FUNCIONAIS.md)

| RF | Descrição curta | História |
| --- | --- | --- |
| RF-001 a RF-003 | Cadastro, autenticação e sessão | `HN-001` |
| RF-004, RF-005, RF-007 | Conectar instituição, listar conexões, sincronizar | `HN-002` |
| RF-008, RF-009 | Painel consolidado e lista de lançamentos | `HN-003` |
| RF-010 | Descrição legível do lançamento | `HN-004` |
| RF-011, RF-012 | Categorização automática e correção manual | `HN-005` |
| RF-013 | Limite mensal por categoria | `HN-006` |
| RF-014, RF-015 | Semáforo e aviso de faixa | `HN-007` |
| RF-016, RF-017 | Histórico de 6 meses e problemas recorrentes | `HN-008` |
| RF-018, RF-019 | Diagnóstico e insights | `HN-009` |
| RF-020, RF-021 | Chatbot educativo e aviso permanente | `HN-010` |
| RF-022, RF-023, RF-024 | Simulação de compra e exportação | `HN-011` |
| RF-006, RF-025 | Revogação e exclusão de dados | `HN-012` |

## 6. Regras de negócio

Fonte: [`REGRAS-DE-NEGOCIO.md`](../requisitos/REGRAS-DE-NEGOCIO.md)

| RN | Invariante | História |
| --- | --- | --- |
| RN-001 a RN-005 | Faixas do semáforo, ausência de limite, mês de referência, não acumulação, aviso único por faixa | `HN-006`, `HN-007` |
| RN-006 a RN-011 | Moeda e arredondamento, estorno, duplicidade, composição do saldo, preservação do original, prevalência da correção manual | `HN-003`, `HN-004`, `HN-005` |
| RN-012 a RN-016 | Consentimento ativo, revogação, unicidade, isolamento entre pessoas, exclusão | `HN-002`, `HN-012` |
| RN-017 a RN-021 | Não aconselhamento, aviso permanente, procedência do número, dado mínimo para diagnóstico, degradação sem IA | `HN-009`, `HN-010` |
| RN-022, RN-023 | Janela de 6 meses e ranking calculado, não gerado | `HN-008` |

**Três regras dominam o produto** e todo gate de negócio começa por elas:

1. `RN-019` — número exibido nunca vem do modelo de IA;
2. `RN-017` — a IA não recomenda produto financeiro, nem quando solicitada;
3. `RN-012` — sem consentimento ativo, nada é sincronizado nem exibido.

## 7. Fora de escopo

Iniciação de pagamento, recomendação de investimento ou crédito, análise
preditiva, conta familiar compartilhada, aplicativo mobile nativo, integração
direta com instituições fora do agregador e uso de dado bancário real.

Justificativa completa na seção 4 da `SDD-001`.

## 8. Critérios de conclusão do épico

- Todos os RF `Must` estão `Entregue`.
- Toda RN de `RN-001` a `RN-023` tem pelo menos um teste que a prova.
- As quatro jornadas (J1 a J4) são percorríveis de ponta a ponta no Sandbox.
- Toda história derivada tem documento em `docs/entregas/`.

## 9. Riscos de negócio

| Risco | Impacto | Probabilidade | Mitigação |
| --- | --- | --- | --- |
| A pessoa acreditar em um número que a IA inventou | Alto | Média sem controle | `RN-019` e a guarda técnica de `HT-014` |
| A IA cruzar para aconselhamento regulado | Alto | Média sem controle | `RN-017`, `RN-018` e teste negativo no gate de segurança |
| Personas erradas levarem a um produto que ninguém usa | Alto | Média | Validar com 3 a 5 pessoas do perfil antes de `HN-007` |
| Sandbox não representar a realidade dos dados brasileiros | Médio | Alta | Declarar a limitação na entrega; não prometer acurácia de produção |
| Escopo maior que a capacidade de 3 estudantes em tempo parcial | Alto | Alta | Fila cronológica com WIP 1; `Could` sai primeiro se faltar tempo |
