---
name: requisitos-nao-funcionais
description: Catálogo de requisitos não funcionais (RNF) do ContaComigo, com métrica, alvo numérico e forma de medição.
document_type: requirements_catalog
source: SDD-001
applies_when:
  - definir escopo de uma história técnica
  - validar gate de SRE, segurança ou arquitetura
max_lines: 300
---

# Requisitos Não Funcionais (RNF)

Derivados de [`SDD-001`](../spec-driven-development/SDD-001-contacomigo-poc.md).

RNF sem número é opinião. Todo item tem **métrica**, **alvo** e **como medir**.
Alvos marcados como _(a calibrar)_ recebem número na história que os implementa —
e a história não fecha com o número em aberto.

## Desempenho e experiência

| ID | Requisito | Métrica | Alvo | Como medir | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RNF-001 | O painel consolidado carrega rápido com dados de 6 meses | Tempo até conteúdo útil, p95 | ≤ 2 s | Medição no navegador com massa de 6 meses no Sandbox | HT-010, HN-003 | Aprovado |
| RNF-002 | A sincronização não trava a interface | Tempo até feedback visível | ≤ 1 s, com progresso assíncrono | Teste funcional de conexão de instituição | HT-011, HN-002 | Aprovado |
| RNF-003 | A interface funciona em celular | Largura mínima sem quebra de layout nem rolagem horizontal | 360 px | Teste responsivo nas telas principais | HN-003 | Aprovado |
| RNF-004 | O semáforo é compreensível sem depender de cor | Contraste e redundância de sinal | WCAG 2.1 AA; faixa indicada também por rótulo e forma | Verificação de contraste e navegação por teclado | HN-007 | Aprovado |

## Confiabilidade e operação

| ID | Requisito | Métrica | Alvo | Como medir | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RNF-005 | Falha de integração externa degrada, não derruba | Telas funcionais com provedor fora | Painel numérico 100% funcional sem IA; painel exibe dado da última sincronização sem o agregador | Teste funcional com provedor simulado indisponível | HT-011, HT-013 | Aprovado |
| RNF-006 | Chamada a provedor externo tem limite de espera e nova tentativa controlada | Timeout e tentativas | Timeout ≤ 10 s; no máximo 2 novas tentativas com espera crescente | Teste de integração com atraso simulado | HT-011, HT-013 | Aprovado |
| RNF-007 | O ambiente local é reproduzível em máquina limpa | Passos manuais fora do harness | Zero; `harness setup` sobe tudo com versões fixadas | Execução em máquina sem estado prévio | HT-005 | Aprovado |
| RNF-008 | Erro em produção é diagnosticável sem acesso à máquina | Campos do log estruturado | Log com correlação de requisição, sem dado pessoal; erro rastreável até a operação | Inspeção do log em falha provocada | HT-012 | Aprovado |

## Custo

| ID | Requisito | Métrica | Alvo | Como medir | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RNF-009 | O uso de IA cabe no free tier | Teto de chamadas por pessoa por dia | _(a calibrar em `HT-013`)_ — teto explícito e recusa educada ao ultrapassar | Contador por pessoa registrado e testado | HT-013 | Aprovado |
| RNF-010 | Resposta de IA equivalente não é paga duas vezes | Taxa de acerto de cache para a mesma pergunta sobre os mesmos dados | Cache obrigatório para diagnóstico do mesmo mês sem novos lançamentos | Teste que repete a chamada e verifica ausência de nova requisição | HT-013 | Aprovado |
| RNF-011 | A operação da PoC não gera custo recorrente | Custo mensal em reais | R$ 0 — apenas free tier | Revisão no gate de SRE antes da publicação | HT-015 | Aprovado |

## Segurança e privacidade

| ID | Requisito | Métrica | Alvo | Como medir | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RNF-012 | Segredos nunca entram no repositório, no log ou no pacote da web | Ocorrências encontradas | Zero | Varredura de segredos no harness e no CI | HT-008 | Aprovado |
| RNF-013 | Toda operação sobre dado de pessoa verifica autorização no servidor | Rotas protegidas sem verificação | Zero; cada rota tem teste negativo | Teste de acesso sem credencial e com credencial de terceiro | HT-008, HN-001 | Aprovado |
| RNF-014 | Credencial de consentimento e token de agregador ficam cifrados em repouso | Campos sensíveis em texto claro | Zero | Inspeção do esquema e do dado persistido | HT-010 | Aprovado |
| RNF-015 | Nenhum dado financeiro ou pessoal aparece em log | Ocorrências em amostra de log | Zero | Revisão de log em teste funcional completo | HT-008, HT-012 | Aprovado |
| RNF-016 | Exclusão e revogação cumprem prazo declarado à pessoa | Tempo entre pedido e exclusão efetiva | _(a definir pelo time, ver `SDD-001` seção 7)_ | Teste que verifica ausência do dado após o prazo | HN-012 | Aprovado |
| RNF-017 | Saída do modelo é tratada como entrada não confiável | Respostas exibidas sem validação | Zero; validação de formato e de coerência numérica antes de exibir | Teste com resposta adulterada do provedor simulado | HT-014 | Aprovado |

## Qualidade e manutenibilidade

| ID | Requisito | Métrica | Alvo | Como medir | Histórias | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RNF-018 | Toda regra de negócio catalogada tem teste que a prova | RN sem teste correspondente | Zero | Rastreio RN → teste no gate de QA | HT-006 | Aprovado |
| RNF-019 | Cobertura de teste sustenta mudança segura | Cobertura de linha no domínio | ≥ 80% no domínio; pipeline falha abaixo do limiar | Relatório do harness | HT-006, HT-007 | Aprovado |
| RNF-020 | Integrações externas são substituíveis e o domínio não conhece infraestrutura | Violações das regras de importação de `ADR-001` | Zero; `import` de framework, ORM ou SDK dentro de `domain/` quebra o build | Checagem automática de fronteiras em `harness lint`, com teste que prova o bloqueio | HT-009, HT-011, HT-013 | Aprovado |
| RNF-021 | Os gates rodam automaticamente e bloqueiam de fato | Gates configurados como aviso | Zero; falha de gate impede a integração | Provocar falha proposital e observar o bloqueio | HT-007 | Aprovado |

## Categorias sem RNF nesta fase

Escalabilidade horizontal, alta disponibilidade com SLA, recuperação de desastre
e internacionalização estão fora: a PoC não opera com dado real nem com carga
externa. Rever quando houver decisão de ir a produção.
