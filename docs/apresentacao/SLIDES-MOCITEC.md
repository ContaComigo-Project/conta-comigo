---
name: slides-apresentacao-mocitec
description: Roteiro falado e conteúdo de cada slide da apresentação ContaComigo (MOCITEC). 9 slides, 15 minutos de fala + 5 de perguntas.
document_type: presentation
version: v1.0
max_lines: 500
---

# SLIDES — Apresentação ContaComigo (MOCITEC)

- **Apresentadores:** Raul Lize Teixeira e Thiago Rodrigues Caputi
- **Miguel Lewandowski** não participará (viagem a serviço da empresa) — citado na capa
- **Orientador:** Everton Oliveira Fernandes
- **Formato:** 10 slides · **15 min** de fala + **5 min** de perguntas
- **Timing sugerido por slide:** 1–2 min cada (Capa/Problema/Demonstração mais longos)

---

## SLIDE 1 — Capa

**Apresentador:** Raul e Caputi

**Conteúdo no slide**
- Logo ContaComigo
- Título: *"ContaComigo: democratizando a gestão financeira pessoal através do Open Finance e da Inteligência Artificial"*
- Nomes: Raul Lize Teixeira · Thiago Rodrigues Caputi · Miguel Lewandowski
- Orientador: Everton Oliveira Fernandes

**Fala — Raul**
> "Bom dia a todos, sejam bem-vindos! Somos do projeto ContaComigo: democratizando a gestão financeira pessoal através do Open Finance e da Inteligência Artificial. Eu sou o Raul, e ao meu lado está o Caputi. Também faz parte da nossa equipe o Miguel, que não pôde estar presente hoje por conta de uma viagem a trabalho."

**Fala — Caputi**
> "Bom dia, pessoal! Eu sou o Thiago Caputi. E aproveitando, gostaria de apresentar o professor Everton, nosso orientador, que nos apoiou ao longo de toda a criação e desenvolvimento do projeto."

**(Passar o slide após a apresentação da equipe.)**

---

## SLIDE 2 — Contexto

**Apresentador:** Raul

**Conteúdo no slide**
- Frase de impacto + por que o ContaComigo existe
- Ícones/ilustração: "bancos falando uma língua que ninguém ensinou"

**Fala**
> "Se entender o próprio dinheiro já é difícil, imagina quando os bancos falam uma língua que ninguém te ensinou — e a educação financeira quase não existe nas escolas e universidades. É exatamente nesse ponto que o ContaComigo entra: juntar os seus dados financeiros em um lugar só e traduzir isso em linguagem simples, com apoio de inteligência artificial e do Open Finance."

---

## SLIDE 3 — O problema (dados)

**Apresentador:** Raul

**Conteúdo no slide**
- **Endividamento**
  - 1 em cada 5 famílias (19,5%) tem mais da metade da renda comprometida com dívidas; comprometimento médio de 29,7% do orçamento. *(Agência Brasil, 06/02/2026)*
  - Entre famílias com renda de até 3 salários mínimos, o endividamento chega a 82,5%. *(Agência Brasil, 06/02/2026)*
- **Reserva e educação financeira**
  - 31% dos brasileiros não têm NENHUMA reserva financeira; nas classes D/E, 48%. Somando quem cobre menos de 1 mês, mais da metade da população está exposta a qualquer imprevisto. *(InfoMoney, 15/06/2026)*
  - Apenas 21% já participou de algum curso/palestra de educação financeira; 55% admite entender pouco ou nada do tema. *(ANBIMA e Febraban)*

**Fala**
> "Lhes apresento os seguintes dados. Um em cada cinco brasileiros compromete mais da metade da renda com dívidas, e nas famílias mais pobres o endividamento chega a 82%. Trinta e um por cento não tem nenhuma reserva para um imprevisto, e apenas um em cada cinco já recebeu algum tipo de educação financeira."
>
> **Síntese (fala):** "Ou seja: o brasileiro não entende o próprio dinheiro, não tem reserva para imprevistos e se endivida em patamar recorde. O problema não é falta de informação crua — é a falta de uma interpretação acessível que transforme os números em decisão. É aí que o ContaComigo atua."

---

## SLIDE 4 — Proposta

**Apresentador:** Caputi

**Conteúdo no slide**
- ContaComigo = PoC de aplicação **web responsiva** que consolida as finanças e usa **IA generativa como apoio educativo** — nunca aconselhamento
- **Princípios:**
  1. **Dados com consentimento (Open Finance):** o usuário autoriza o acesso; nada é coletado sem autorização e nada sai do sistema
  2. **IA educativa, com limites:** interpreta números e ensina conceitos, mas **não recomenda** produtos, investimentos, crédito ou instituições; os valores exibidos vêm sempre dos dados, nunca da IA
  3. **Linguagem simples:** a "fatura do banco" vira um semáforo e um diagnóstico que a pessoa entende

**Fala**
> "O ContaComigo é uma prova de conceito de aplicação web responsiva que consolida as finanças em um único ambiente e usa IA generativa como apoio à interpretação e à educação financeira — nunca como aconselhamento. Três princípios nos diferenciam: dados sempre com consentimento, via Open Finance; uma IA educativa, que interpreta e ensina mas não recomenda produto algum; e a tradução dos números em linguagem simples."

---

## SLIDE 5 — Objetivos

**Apresentador:** Caputi

**Conteúdo no slide**
- **Geral:** validar uma PoC de aplicação web que torna dados financeiros consolidados mais **didáticos e acessíveis**, com apoio de IA educativa
- **Específicos:**
  1. Consolidar em um único ambiente saldos, gastos e limites por categoria
  2. Traduzir números em linguagem simples (semáforo, diagnóstico, chat)
  3. Apoiar decisões de orçamento com simulação de impacto, sem incentivar crédito
  4. Demonstrar a viabilidade técnica da integração Open Finance (Sandbox) + IA

**Fala**
> "Nosso objetivo geral é validar uma aplicação que torna os dados financeiros mais didáticos e acessíveis. De forma específica: consolidar saldos, gastos e limites em um único ambiente; traduzir os números em linguagem simples; apoiar decisões de orçamento com simulação de impacto, sem incentivar crédito; e demonstrar a viabilidade técnica da integração entre o Open Finance, em ambiente Sandbox, e a IA."

---

## SLIDE 6 — Demonstração (ao vivo)

**Apresentadores:** Raul (navega) + Caputi (narra) · **~6 min**

**Conteúdo no slide**
- Mapa do roteiro da demo (miniaturas/lista das telas)

**Roteiro de navegação (fala narrada)**
1. **Landing page** → **Login** (conta demo)
2. **Visão Geral:** cards de saldo/gastos/fatura · Diagnóstico de IA · mapa de gastos por categoria · orçamento do mês por categoria · transações recentes · bancos conectados
3. **Despesas:**
   - *Aba Visão Geral do Mês:* cards de gastos por mês · limites por categoria (editáveis) · transações do mês
   - *Aba Histórico:* visão dos meses, maiores gastos, exportação **PDF/CSV**
4. **Investimentos:** tela com dados de exemplo (mock) que no futuro pode evoluir para uma carteira real
5. **Bancos Conectados:** integração de bancos via Open Finance (Sandbox)
6. **Configurações:** dados pessoais, alertas, segurança e revogação de dados
7. **Consultor IA:** chatbot de consulta financeira pessoal (pergunte, converse, veja o aviso educativo)
8. **Interface Responsiva:** interface responsiva para dispositivos móveis

**Fala de transição**
> "Agora vamos demonstrar o que construímos. Começando pelo acesso, pelo painel consolidado e pelas telas de orçamento, passando pela exportação de relatórios, pelas conexões bancárias, pelas configurações e pelo consultor de IA."

---

## SLIDE 7 — Próximas etapas

**Apresentador:** Raul

**Conteúdo no slide**
- Aplicativo **Mobile**
- **Integração real** com o Open Finance
- Aperfeiçoar a **experiência visual** do usuário
- Encontrar maneiras de **viabilizar financeiramente** a aplicação

**Fala**
> "Como próximas etapas, vislumbramos: um aplicativo mobile; a integração real com o Open Finance, saindo do Sandbox; o aperfeiçoamento da experiência visual; e a busca por um modelo que viabilize financeiramente a aplicação."

---

## SLIDE 8 — Encerramento

**Apresentador:** Raul

**Conteúdo no slide**
- Frase de fechamento + logo

**Fala**
> "Com esta prova de conceito, o ContaComigo não inventa conselho — ele organiza o que já é seu e traduz em linguagem simples, com apoio educativo de IA. Numa população em que 82% das famílias estão endividadas e 31% não têm nenhuma reserva, acreditamos que entender o próprio dinheiro é o primeiro passo — e a tecnologia pode ajudar."

---

## SLIDE 9 — Referências

**Apresentador:** Pular (apenas exibir o slide de fontes, sem falar)

**Conteúdo no slide**
- Fontes citadas (com links):
  - Agência Brasil / CNC — Pesquisa de Endividamento e Inadimplência do Consumidor (PEIC), 2026
  - ANBIMA/Datafolha — Raio X do Investidor Brasileiro, 2026
  - InfoMoney (com base na ANBIMA), 2026
  - Febraban, 2025
  - Valor Econômico (CNC/PEIC), 2026

**Fala**
> "Todos os dados que apresentamos têm fonte pública: a Pesquisa de Endividamento e Inadimplência da CNC, o Raio X do Investidor da ANBIMA com o Datafolha, além da Febraban e do Valor Econômico. As referências completas estão no nosso relatório."

---

## SLIDE 10 — Dúvidas

**Apresentador:** Caputi

**Conteúdo no slide**
- "Dúvidas?" + contatos/logo

**Fala**
> "Ficamos à disposição para tirar qualquer dúvida."

---

## Anexo — perguntas prováveis da banca (preparo)

- **"Isso usa dados reais?"** → Não na PoC; usamos dados sintéticos (Sandbox Pluggy); a arquitetura está pronta para dados reais com consentimento (Open Finance).
- **"Como a IA não inventa número?"** → Camada de guarda: a IA só recebe valores agregados e a resposta é validada; número exibido vem do dado, nunca do modelo.
- **"Por que não é aconselhamento?"** → Regra de produto: a IA educa e interpreta, mas não recomenda produtos, investimentos, crédito ou instituições.
- **"O que diferencia de um banco?"** → O banco mostra o número; o ContaComigo mostra o número e o que ele significa, com orçamento, diagnóstico, chat e simulação em um só lugar.
- **"Qual é o público-alvo da aplicação?"** → Pessoas físicas que querem entender e organizar as próprias finanças, com foco em quem tem pouco acesso a educação financeira e em quem se sente perdido com a linguagem dos bancos — do jovem que começa a trabalhar à família que precisa organizar o orçamento.
- **"Como vocês avaliam a viabilidade financeira da aplicação?"** → A arquitetura de monólito modular e a infraestrutura têm custo baixo de manutenção; a PoC usou serviços gratuitos (Gemini no tier gratuito, dados Sandbox). A viabilidade passa por validar o valor percebido com os usuários antes de qualquer custo relevante.
- **"Qual seria a monetização?"** → Modelos possíveis, sem nunca recomendar produto: (1) assinatura de planos premium (relatórios avançados, histórico maior, múltiplas contas); (2) modelo B2B2C — bancos e fintechs pagarem para oferecer a experiência educativa aos clientes; (3) API/white-label. Decisão de negócio, não de produto — a regra RN-017 (não recomendar produtos) continua valendo em qualquer modelo.
- **"Quanto tem de projeto?"** → Backend e frontend separados, ~350+ testes, pipeline de CI; PoC com arquitetura de monólito modular pronta para crescer.