---
name: roteiro-apresentacao-mocitec
description: Roteiro da apresentação da PoC ContaComigo para a MOCITEC. Estrutura, roteiro falado, dados com referências, captura de telas e divisão entre os apresentadores.
document_type: presentation
version: v1.0 (resumo fechado)
max_lines: 500
---

# ROTEIRO — Apresentação ContaComigo (MOCITEC)

- **Apresentadores:** Raul Lize Teixeira e Thiago Rodrigues Caputi
  *(Miguel Leonardo Strapazon Lewandowski não participará — viagem a serviço da empresa)*
- **Formato:** demonstração ao vivo no localhost (sem deploy), narrada com apoio
  de capturas de tela como plano B
- **Duração:** 15 minutos de apresentação + 5 minutos de perguntas

> O resumo oficial já está **fechado como versão final** (`docs/apresentacao/RESUMO-MOCITEC.md`).
> Este roteiro NÃO altera o resumo — apenas organiza a fala e os dados.

---

## 0. Antes da apresentação (checklist)

- [ ] Subir o ambiente do zero: `docker compose up -d` → `db:seed` → API (`:3000`) → frontend (`:5173`)
- [ ] Login demo funcionando: `demo@contacomigo.com` / `demo123`
- [ ] Testar a navegação no navegador que será usado (projetor)
- [ ] Capturar as telas/vídeo (ver seção 6) como plano B se o ao vivo falhar
- [ ] Deixar a janela do navegador em **metade desktop + modo responsivo (390px)** para mostrar a responsividade

---

## 1. Contexto (1 min)

O ContaComigo nasce de uma observação: **gerir o próprio dinheiro é difícil, e
as ferramentas existentes não conversam com quem precisa aprender.**

- Educação financeira quase não existe na escola/universidade → a complexidade
  do orçamento e a falta de ferramentas acessíveis induzem decisões de crédito
  desfavoráveis.
- O Open Finance brasileiro (regulamentado pelo Banco Central) liberou, com
  consentimento do usuário, o acesso a dados bancários — mas isso só tem valor
  se houver quem ajude a pessoa a **entender** o próprio número.

**Frase de abertura sugerida:**
> "Se entender o próprio dinheiro já é difícil, imagina quando os bancos falam
> uma língua que ninguém te ensinou. É exatamente nesse ponto que o ContaComigo
> entra: juntar os seus números em um lugar só e traduzir isso em linguagem
> simples, com apoio de inteligência artificial educativa."

---

## 2. O problema — dados que validam (2 min)

> Números com referência para a banca. Escolha 3–4 para citar; os demais ficam
> de apoio para perguntas.

### Endividamento (CNC — Pesquisa de Endividamento e Inadimplência do Consumidor)

- **82%** das famílias brasileiras estavam endividadas em julho/2026 — recorde
  histórico, o 6º em 12 meses. ([Valor Econômico, 06/08/2026](https://valor.globo.com/brasil/noticia/2026/08/06/endividamento-das-famlias-volta-a-bater-recorde-e-atinge-82-pontos-percentuais-em-julho-diz-cnc.ghtml))
- **29,7%** das famílias inadimplentes (contas em atraso). ([CNN Brasil, 08/05/2026](https://www.cnnbrasil.com.br/economia/financas/endividamento-sobe-a-recorde-de-809-em-abril-diz-cnc-inadimplencia-avanca-a-297))
- **1 em cada 5** famílias (19,5%) tem **mais da metade da renda comprometida**
  com dívidas; comprometimento médio de 29,7% do orçamento. ([Agência Brasil, 06/02/2026](https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/percentual-de-familias-com-dividas-cresce-mas-inadimplencia-cai))
- Entre famílias com renda de até 3 salários mínimos, o endividamento chega a
  **82,5%**. ([Agência Brasil, 06/02/2026](https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/percentual-de-familias-com-dividas-cresce-mas-inadimplencia-cai))

### Reserva de emergência e educação financeira (ANBIMA/Datafolha — Raio X do Investidor, 2026)

- **31% dos brasileiros não têm NENHUMA reserva financeira**; nas classes D/E,
  48%. Somando quem cobre menos de 1 mês, mais da metade da população está
  exposta a qualquer imprevisto. ([InfoMoney, 15/06/2026](https://www.infomoney.com.br/colunistas/embaixadores-xp-b2b/97-dos-brasileiros-nao-tem-reserva-financeira-suficiente-e-o-mercado-esta-olhando-para-o-lado-errado))
- **63%** têm reserva para menos de 3 meses (o mínimo recomendado); só **3%** têm
  reserva para 5 anos+. ([ANBIMA/Datafolha — Raio X do Investidor](https://www.anbima.com.br/pt_br/especial/raio-x-do-investidor-brasileiro.htm))
- **Apenas 21%** da população já participou de algum curso/palestra de educação
  financeira; **55%** admite entender pouco ou nada do tema. ([ANBIMA](https://www.anbima.com.br/pt_br/especial/raio-x-do-investidor-brasileiro.htm) e [Febraban](https://portal.febraban.org.br/noticia/4324/pt-br))
- Só **33%** conseguiram poupar em 2025 — e, desses, apenas 12% investiram de fato. ([CNN Brasil, 08/05/2026](https://www.cnnbrasil.com.br/economia/financas/brasileiros-poupam-mas-ainda-nao-investem-segundo-anbima))

### A síntese do problema

> As pessoas **não entendem** o próprio dinheiro, **não têm reserva** para
> imprevistos e **endividam-se em escala recorde**. Falta não informação crua —
> falta **interpretação** acessível do que os números significam.

---

## 3. A proposta (2 min)

**ContaComigo** — uma prova de conceito (PoC) de aplicação **web responsiva** que
consolida as finanças em um ambiente único e usa **Inteligência Artificial
generativa como apoio à interpretação e à educação financeira** — nunca como
aconselhamento.

Princípios que diferenciam:

- **Dados com consentimento (Open Finance):** o usuário autoriza o acesso às
  contas; nada é coletado sem autorização e nada sai do sistema.
- **IA educativa, com limites:** a IA interpreta os números e ensina conceitos,
  mas **não recomenda produtos, investimentos, crédito ou instituições**
  (regra de produto) — e os valores exibidos vêm sempre dos dados, nunca da IA.
- **Linguagem simples:** a "fatura do banco" vira um semáforo e um diagnóstico
  que a pessoa entende.

### Features para citar (com a tela)

| Feature | O que mostra | Tela |
|---|---|---|
| Painel consolidado | Saldo, gastos do mês, fatura do cartão | Visão Geral |
| Semáforo de orçamento | Gasto × limite por categoria, faixa verde/amarela/vermelha | Visão Geral / Despesas |
| Histórico de 6 meses | Evolução mensal + os 3 problemas mais recorrentes | Despesas → Histórico |
| Diagnóstico de IA | Texto em linguagem simples sobre a saúde financeira | Visão Geral |
| Chat educativo | Respostas usando os próprios números, com aviso permanente | Widget Consultor IA |
| Simulação de compra | Impacto de um gasto planejado no orçamento | Despesas |
| Exportação | Relatório PDF e planilha CSV dos lançamentos | Despesas → Exportar |

---

## 4. Objetivos (1 min)

- **Objetivo geral:** validar uma PoC de aplicação web que torna dados
  financeiros consolidados mais **didáticos e acessíveis**, com apoio de IA
  educativa.
- **Objetivos específicos:**
  1. Consolidar em um único ambiente saldos, gastos e limites por categoria.
  2. Traduzir números em linguagem simples (semáforo, diagnóstico, chat).
  3. Apoiar decisões de orçamento com simulação de impacto, sem incentivar crédito.
  4. Demonstrar a viabilidade técnica da integração Open Finance (Sandbox) + IA.
- **Fora de escopo da PoC:** aconselhamento financeiro, recomendação de produtos
  e processamento de dados bancários reais (a demo usa **dados sintéticos**).

---

## 5. Tecnologia e infraestrutura (1 min — breve, banca não técnica)

> Objetivo: passar confiança técnica sem afundar em detalhes.

- **Frontend:** React + Tailwind — interface limpa e **responsiva** (celular,
  tablet e desktop).
- **Backend:** NestJS (TypeScript) — monólito modular; concentra as regras de
  negócio e a comunicação com os serviços externos.
- **Integrações:** API da **Pluggy** (ambiente Sandbox, dados sintéticos) para
  a agregação estilo Open Finance; API do **Google Gemini** para a IA generativa,
  com uma camada de **guarda** que bloqueia saídas que recomendem produtos ou
  inventem números.
- **Dados:** 100% sintéticos na PoC — nenhum dado bancário real é processado.
- **Qualidade:** mais de **400 testes** (unitários + integração + funcionais),
  pipeline de CI no GitHub e auditoria de repositório.

**Mensagem-chave para a banca:**
> "A PoC provou que a arquitetura aguenta a integração real (Sandbox) e que as
> saídas de IA são seguras e educativas — prontas para evoluir para dados reais
> com consentimento."

---

## 6. Solução proposta — demonstração ao vivo (4–5 min)

> Roteiro de fala narrando as telas. **Sempre alternar desktop ↔ modo responsivo.**

### 6.1 Abertura do app (desktop)
- Landing page + tela de **cadastro/login** → entrar com a conta demo.
- Fala: consentimento e segurança desde o primeiro acesso.

### 6.2 Visão Geral (desktop → depois responsivo)
- **Métricas:** saldo, gastos do mês, fatura do cartão.
- **Diagnóstico de IA** (bloco verde): a IA resume a saúde financeira em
  linguagem simples + aviso de não aconselhamento.
- **Mapa de gastos** por categoria.
- **Semáforo de orçamento:** alimentação em **vermelho**, moradia/saúde em
  **amarelo** — "aqui a pessoa vê, de um relance, onde está o problema".
- **Atividade recente** e **bancos conectados**.
- Trocar para **modo responsivo (390px)** e mostrar que **tudo se reorganiza**,
  com navegação inferior (dock) e o Consultor IA flutuante.

### 6.3 Despesas e Orçamento (desktop)
- **Semáforo por categoria** (limites, gastos, faixas).
- **Editar um limite** ao vivo (ex.: subir o limite de transporte) → persistir.
- **Histórico de 6 meses** → barras mensais + **top 3 problemas recorrentes**.

### 6.4 IA educativa (desktop)
- **Chat educativo:** perguntar "Onde estou gastando mais?" → resposta usando os
  próprios números + aviso permanente.
- **Simulação de compra:** simular um valor em uma categoria e mostrar o impacto
  no semáforo (sem sugerir crédito).

### 6.5 Exportação (desktop)
- Gerar o **relatório PDF** (cabeçalho, tabela por mês, faixas coloridas) e a
  **planilha CSV** — abrir os arquivos para a banca ver.

### 6.6 Responsividade (fechar o ciclo)
- Finalizar mostrando **mais uma tela em modo responsivo** (ex.: Configurações
  com as sub-seções) para reforçar que a aplicação é mobile-first-friendly.

---

## 7. Capturas de tela / vídeo (plano B)

> Mesmo com ao vivo, grave um vídeo curto (2–3 min) ou capture as telas abaixo.
> Se a internet/projetor falhar, a apresentação continua narrada sobre as imagens.

Checklist de capturas:
- [ ] Landing + login
- [ ] Visão Geral (desktop)
- [ ] Visão Geral (responsivo 390px)
- [ ] Despesas — semáforo com edição de limite
- [ ] Despesas — histórico com problemas recorrentes
- [ ] Chat educativo (pergunta + resposta + aviso)
- [ ] Simulação de compra (impacto no semáforo)
- [ ] Exportação PDF (abrir o arquivo) e CSV
- [ ] Configurações (sub-seções) responsivo

---

## 8. Divisão da apresentação (2 apresentadores — 15 minutos)

| Bloco | Apresentador | Min |
|---|---|---|
| Contexto + Problema (dados) | Raul | 3 |
| Proposta + Objetivos | Thiago | 2 |
| Tecnologia/Infraestrutura | Thiago | 2 |
| Demonstração ao vivo | Raul (navega) + Thiago (narra) | 6 |
| Encerramento | Ambos | 2 |

**Total:** 15 min · **Perguntas:** 5 min (a banca decide a ordem)

---

## 9. Encerramento (1 min)

**Frase de fechamento sugerida:**
> "O ContaComigo não inventa conselho — ele **organiza o que já é seu** e traduz
> em linguagem simples, com apoio educativo de IA. Numa população em que 82% das
> famílias estão endividadas e 31% não têm nenhuma reserva, acreditamos que
> entender o próprio dinheiro é o primeiro passo — e a tecnologia pode ajudar."

- Agradecer, citar o orientador (Everton Oliveira Fernandes) e os 3 autores.
- Oferecer: "Podemos mostrar qualquer tela ou responder dúvidas sobre a
  arquitetura e a camada de segurança da IA."

---

## 10. Perguntas prováveis da banca (preparo)

- **"Isso usa dados reais?"** → Não. A PoC usa dados sintéticos (Sandbox Pluggy);
  a arquitetura está pronta para dados reais com consentimento (Open Finance).
- **"Como a IA não inventa número?"** → Camada de guarda: a IA só recebe valores
  agregados e a resposta é validada antes de aparecer; número exibido vem do
  dado, nunca do modelo.
- **"Por que não é aconselhamento financeiro?"** → Regra de produto: a IA educa
  e interpreta, mas não recomenda produtos/investimentos/crédito/instituições.
- **"O que diferencia de um banco?"** → O banco mostra o número; o ContaComigo
  mostra o número **e o que ele significa**, com orçamento, diagnóstico, chat e
  simulação em um só lugar.
- **"Quão grande é o projeto?"** → ~400+ testes, frontend e backend separados,
  pipeline CI; é uma PoC com arquitetura de monólito modular pensada para crescer.