---
name: prompt-setup-inicial-projeto-agentico
description: Prompt esqueleto para iniciar qualquer projeto com workflow agêntico baseado em kanban oficial, épicos, histórias, rules, skills, harness, spec-driven-development, Ralph Loop e versionamento semântico.
document_type: reusable_prompt
applies_when:
  - iniciar um projeto novo
  - padronizar workflow agêntico
  - criar backlog com épico, histórias de negócio e histórias técnicas
  - configurar governança de entrega assistida por IA
max_lines: 300
---

# Prompt Setup Inicial De Projeto Agêntico

Use este prompt para iniciar um projeto novo com o mesmo padrão de execução agêntica quando se trata de desenvolvimento assistido por IA, independente da tecnologia escolhida.

Copie o bloco abaixo e preencha os campos entre colchetes.

```text
Você é um agente de engenharia de software responsável por estruturar um novo projeto chamado ContaComigo.

Objetivo do produto:
Oferecer uma Prova de Conceito (PoC) de aplicação web responsiva que consolide, em um único ambiente, os dados bancários que a pessoa tem espalhados por várias instituições — via Open Finance regulamentado pelo BACEN — e use Inteligência Artificial generativa como motor ativo de consultoria e educação financeira, transformando extrato bruto em conhecimento prático.

Capacidades que definem o produto:
- consolidação de contas e cartões de múltiplas instituições em um só painel;
- orçamento semáforo por categoria: verde até 70% do limite, amarelo entre 70% e 90%, vermelho acima de 90%;
- limpeza semântica das descrições de fatura, decodificando siglas que a pessoa não reconhece como gasto próprio;
- diagnóstico automático de saúde financeira, com alertas, oportunidades e metas;
- chatbot educativo que orienta metas orçamentárias;
- histórico de meses anteriores e exportação de relatórios para acompanhamento ao longo do tempo.

O produto é educativo e preventivo: ele explica à pessoa o próprio dinheiro dela. Não recomenda investimento, não intermedeia crédito e não substitui profissional certificado — a fronteira do "não aconselhamento" é parte do produto, não um aviso legal decorativo.

Público-alvo:
Usuário primário: pessoa adulta brasileira, bancarizada, com pouca ou nenhuma educação financeira formal, que hoje controla o orçamento de cabeça, por planilha ou não controla.

Recortes que caracterizam esse usuário:
- tem contas e cartões em mais de uma instituição e nunca vê o total real;
- não reconhece parte dos próprios lançamentos por causa de siglas e descrições opacas;
- está exposta a decisões de crédito desfavoráveis e a risco de superendividamento;
- abandona aplicativos de finanças que exigem lançamento manual ou que pressupõem letramento financeiro que ela não tem;
- usa principalmente o celular.

Stakeholders que não são usuários: banca avaliadora da MOCITEC, professor orientador e o próprio time de desenvolvimento.

Problema que resolve:
A ausência de educação financeira funciona como barreira invisível que aprofunda desigualdade e limita a ascensão das famílias brasileiras. Sobre essa base, quatro dores concretas:

1. Fragmentação: os dados estão dispersos entre instituições, e consolidar manualmente custa tempo demais para ser feito com a frequência necessária.
2. Opacidade: extratos e faturas usam siglas e códigos que impedem a pessoa de reconhecer o próprio gasto — não dá para controlar o que não se entende.
3. Falta de diagnóstico: mesmo vendo os números, a pessoa não sabe dizer se está bem ou mal, nem o que fazer a respeito.
4. Ferramentas inadequadas: as alternativas exigem disciplina de lançamento manual ou vocabulário financeiro que o público-alvo não domina, e por isso são abandonadas.

O Open Finance resolve a fragmentação com consentimento; a IA generativa resolve a opacidade e a falta de diagnóstico. A combinação das duas é a aposta do projeto.

Stack inicial esperada:
Já existe e está implementado (camada web, no repositório):
- React 19 + TypeScript 6, com Vite 8 como build e servidor de desenvolvimento;
- TailwindCSS 4 com tokens via @theme inline, sem arquivo de configuração;
- React Router 7 para rotas aninhadas e proteção de rotas privadas;
- Zod 4 + React Hook Form 7 para validação de formulários;
- Radix Toast, Lucide React, class-variance-authority, clsx e tailwind-merge;
- ESLint 9 com typescript-eslint, react-hooks e react-refresh;
- Node 22 ou superior e pnpm 9 ou superior.

Já decidido, ainda não implementado (camada de servidor):
- NestJS em TypeScript para regras de negócio e API;
- Pluggy API em ambiente Sandbox como agregador Open Finance;
- Google Gemini orquestrado por LangChain.js para contexto e prompts;
- PostgreSQL para persistência;
- Docker e docker compose para ambiente reproduzível.

Em aberto — decidir com trade-offs explícitos antes de implementar:
- ORM: Prisma (produtividade e tipagem forte, menos controle sobre SQL) contra TypeORM (integração nativa com NestJS, migrações menos previsíveis) contra Drizzle (SQL explícito, ecossistema menor).
- Testes: Vitest (rápido, mesmo ecossistema do Vite) contra Jest (padrão do NestJS, mais lento); Playwright contra Cypress para ponta a ponta; Cucumber apenas se o time realmente escrever Gherkin junto com quem entende do negócio.
- CI/CD: GitHub Actions (gratuito no repositório público, integrado) — alternativa só se houver motivo concreto.
- Hospedagem: Vercel ou Netlify para a web; Render, Fly.io ou Railway para a API; free tier em todos, com limite de hibernação a avaliar.
- Observabilidade: log estruturado com Pino mais Sentry no free tier, contra apenas log em arquivo — decidir pelo custo de diagnosticar um erro relatado por terceiro.
- Autenticação: hoje é local e simulada; produção exige decisão entre JWT próprio e provedor gerenciado.
- Cache e custo de IA: definir estratégia de cache de resposta e limite de tokens por usuário antes de qualquer uso não simulado.

Restrições importantes:
Escopo e maturidade:
- É uma PoC acadêmica apresentada na MOCITEC do IFSul Campus Charqueadas, não um produto em produção.
- Web responsiva é a única plataforma no escopo. Aplicativo mobile nativo é visão futura declarada e está fora.
- Hoje apenas a camada web existe no repositório; ela opera com dados simulados.

Dados e compliance:
- Somente Pluggy Sandbox. Nenhum dado bancário real de pessoa física entra no sistema nesta fase.
- Operar com dados reais exigiria conformidade e credenciamento no ecossistema Open Finance regulado pelo BACEN — isso não está no escopo.
- LGPD: dado financeiro pessoal exige consentimento explícito, minimização, retenção definida, revogação e exclusão.
- Não aconselhamento: o produto não pode emitir recomendação de investimento ou crédito reservada a agentes regulados por CVM e BACEN. O aviso é permanente na interface e a restrição vale também para a saída do modelo de IA.

Segurança:
- Credenciais de Pluggy e Gemini nunca no repositório, nunca em log, nunca no bundle da web.
- Nenhum dado bancário, mesmo simulado, em log de depuração.
- A autenticação atual é local e simulada; precisa virar autenticação real com autorização verificada no servidor antes de qualquer integração com dado real.
- Saída de modelo generativo é entrada não confiável: precisa ser validada antes de virar número exibido como se fosse extrato.

Custo e prazo:
- Time de três estudantes e um professor orientador, em tempo parcial, sem orçamento.
- Tudo precisa caber em free tier: Pluggy Sandbox, Gemini, hospedagem e CI.
- Chamada de IA é o principal risco de custo — cada funcionalidade que chama o modelo precisa declarar limite e estratégia de cache.
- Entregas pequenas e fechadas, porque a disponibilidade do time é intermitente.

Infraestrutura e publicação:
- Ambiente local reproduzível por Docker e docker compose, com versões fixadas.
- Repositório público no GitHub; trabalho em develop, integração para main.
- Nenhum push para main com teste quebrado.

Quero que o projeto nasça com um workflow agêntico completo, independente da stack, contendo:

1. Spec-driven-development como base inicial de entendimento.
2. Épico de negócio com visão, personas, fluxos, requisitos funcionais e regras de negócio.
3. Épico técnico com requisitos não funcionais, arquitetura, segurança, observabilidade, testes, CI/CD e operação.
4. Kanban oficial único como fonte de verdade de execução cronológica.
5. Histórias de negócio separadas de histórias técnicas.
6. Documentação cronológica de cada entrega concluída.
7. Plano de execução por história antes de implementar.
8. Testes funcionais/BDD antes de código produtivo quando houver comportamento testável.
9. Refatoração obrigatória depois dos funcionais verdes.
10. Testes unitários depois dos funcionais verdes para maximizar cobertura.
11. Gates de QA, SRE, Segurança, Arquitetura e Revisão Final.
12. Skills e rules com frontmatter, responsabilidade única e no máximo 300 linhas.
12a. ESTRUTURA OBRIGATÓRIA DE DIRETÓRIO (1 artefato = 1 pasta):
    - Skills: NÃO crie <nome>.md solto. Crie sempre:
      `.agents/skills/<nome-skill-kebab-case>/SKILL.md`
      O arquivo principal SEMPRE se chama `SKILL.md` dentro da pasta.
    - Rules: `.agents/rules/<nome-rule-kebab-case>/RULE.md`
    - Prompts: `.agents/prompts/<nome-prompt-kebab-case>/PROMPT.md`
13. Skills podendo complementar outras skills.
14. Rules podendo complementar skills e outras rules.
15. Harness local para comandos reprodutíveis, preferencialmente via Docker quando fizer sentido.
16. Versionamento semântico por entrega.
17. Commit semântico com o nome ou identificador da história entregue.
18. Tag semântica apontando para o mesmo commit da entrega.

Crie ou proponha a seguinte estrutura inicial:

- docs/spec-driven-development/
- docs/requisitos/
- docs/jira-pessoal/
- docs/jira-pessoal/historias/
- docs/jira-pessoal/historias-tecnicas/
- docs/tasks/
- docs/entregas/
- .agents/rules/
- .agents/skills/
- .agents/prompts/
- scripts/
- artifacts/ somente se houver artefatos locais necessários

Regras centrais do workflow:

- O KANBAN-OFICIAL.md será a única fonte oficial da próxima demanda.
- O spec-driven-development inicial não será uma fila paralela; ele será quebrado em épico, histórias e padrões de qualidade.
- Cada história deve ter critérios de aceite verificáveis.
- Cada história deve citar requisitos funcionais, regras de negócio ou requisitos não funcionais relacionados.
- Histórias técnicas devem existir quando houver infraestrutura, qualidade, segurança, CI/CD, operação, publicação, observabilidade ou governança.
- Histórias de negócio devem existir quando houver comportamento percebido pelo usuário, operador, administrador ou cliente.
- Toda entrega concluída deve gerar documento em docs/entregas/.
- Nenhuma história deve ir para Done sem evidência de validação.
- Nenhum push para main deve acontecer com testes quebrando.
- Nenhum commit de entrega deve misturar arquivos de outra história.
- Nenhuma tag semântica deve apontar para commit diferente do commit de fechamento.

Rules obrigatórias:

- main-push-quality-and-versioning: bloqueia push na main sem testes/gates verdes, commit semântico e tag no mesmo hash.
- tdd-bdd-before-implementation: exige cenário funcional/BDD antes de código produtivo quando houver comportamento testável.
- test-evidence-quality: garante que testes provem regra de negócio e não apenas pipeline.
- refactor-after-functional-green: exige limpeza e refatoração depois dos funcionais passarem.
- clean-code-readable-names: impõe nomes claros, linguagem de domínio e ausência de labels técnicas.
- architecture-boundaries-and-solid: protege SOLID, fronteiras, ports/adapters e design pragmático.
- spec-to-execution-plan: registra que a execução segue o KANBAN-OFICIAL e que SDD complementa a história oficial.

Skills recomendadas:

- product-manager: guarda negócio, escopo, backlog, kanban e documentação de entrega.
- executor-agent: implementa com TDD, respeitando rules e plano da história.
- qa-agent: valida testes, coverage, evidências e anti-reward hacking.
- sre-agent: valida ambiente, CI/CD, Docker, observabilidade e operação.
- security-specialist-agent: valida autenticação, autorização, privacidade e proteção de dados.
- architect-reviewer-agent: valida arquitetura, SOLID, padrões e manutenibilidade.
- final-reviewer-agent: cruza critérios de aceite, código, testes, documentação e versionamento.
- git-operator: faz staging seletivo, commit semântico e tag semântica.
- especialistas adicionais devem ser criados conforme o domínio do projeto.

Ralph Loop:

Use o ciclo Perceber, Orientar, Decidir, Agir e Registrar.

Para cada história:

1. Perceber: ler KANBAN-OFICIAL.md, história oficial e entregas relacionadas.
2. Orientar: comparar critérios de aceite, rules, riscos e dependências.
3. Decidir: escolher subagente ou próxima ação.
4. Agir: implementar, testar, revisar ou documentar.
5. Registrar: atualizar plano, progresso, kanban, entrega, commit e tag.

Antes de implementar qualquer história:

- Criar docs/tasks/[KEY]/TASK.md quando aplicável.
- Criar docs/tasks/[KEY]/IMPLEMENTATION.md com frontmatter.
- Criar docs/tasks/[KEY]/progress.txt.
- Registrar critérios de aceite, estratégia de testes, gates e riscos.

Ao finalizar qualquer história:

- Executar testes e gates aplicáveis.
- Refatorar depois dos funcionais verdes.
- Registrar evidências.
- Criar documento em docs/entregas/.
- Atualizar KANBAN-OFICIAL.md.
- Criar commit semântico.
- Criar tag semântica.
- Validar que commit e tag apontam para o mesmo hash.

Primeira entrega esperada:

1. Criar o épico de negócio.
2. Criar o épico técnico.
3. Criar o KANBAN-OFICIAL.md inicial.
4. Criar templates de história de negócio, história técnica, task, plano de implementação, progresso e entrega.
5. Criar as rules base com frontmatter e no máximo 300 linhas.
6. Criar as skills base com frontmatter e no máximo 300 linhas.
7. Criar README operacional explicando como iniciar a primeira história.
8. Não implementar produto ainda, a menos que eu peça explicitamente.

Critério de sucesso desta etapa:

- Existe um backlog inicial em ordem cronológica.
- O projeto possui épico de negócio e épico técnico.
- O workflow de execução está documentado.
- Rules e skills possuem frontmatter, responsabilidade única e referências complementares.
- O próximo passo executável está claro no KANBAN-OFICIAL.md.
```

## Como Usar

1. Cole o prompt em uma nova conversa ou projeto.
2. Preencha os campos entre colchetes.
3. Peça primeiro a criação dos artefatos de governança.
4. Só depois peça a execução da primeira história.

## Adaptação Por Tecnologia

O workflow não presume stack.

Ao escolher tecnologia, crie histórias técnicas específicas para:

- ambiente local;
- build;
- testes;
- lint;
- análise estática;
- segurança;
- CI/CD;
- publicação;
- observabilidade;
- custos e operação.

## Regra De Ouro

O produto muda conforme o domínio. O workflow não muda: kanban oficial, história pequena, teste primeiro, refatoração, gates, entrega documentada, commit semântico e tag no mesmo hash.
