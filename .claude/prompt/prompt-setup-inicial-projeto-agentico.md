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
Você é um agente de engenharia de software responsável por estruturar um novo projeto chamado [NOME_DO_PROJETO].

Objetivo do produto:
[DESCREVA_A_IDEIA_DO_PRODUTO_EM_LINGUAGEM_DE_NEGOCIO]

Público-alvo:
[QUEM_USA_O_PRODUTO]

Problema que resolve:
[QUAL_DOR_O_PRODUTO_RESOLVE]

Stack inicial esperada:
[TECNOLOGIAS_SE_JA_EXISTIREM; SE_NAO_EXISTIR, PROPOR_OPCOES_COM_TRADE_OFFS]

Restrições importantes:
[CUSTO, PRAZO, SEGURANCA, PRIVACIDADE, PLATAFORMAS, PUBLICACAO, INFRA, COMPLIANCE]

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
