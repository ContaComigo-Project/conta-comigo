---
name: epico-tecnico
description: Épico técnico — requisitos não funcionais, arquitetura, segurança, observabilidade, testes, CI/CD e operação que originam as histórias técnicas.
document_type: epic
applies_when:
  - criar ou revisar uma história técnica
  - avaliar impacto arquitetural, de segurança ou de operação de uma demanda
max_lines: 300
---

# Épico Técnico — `EPIC-TEC-001`

- **Estado:** Esqueleto — conteúdo a definir pelo time após `HT-003` e `HT-004`
- **Responsáveis:** skills `architect-reviewer-agent`, `sre-agent`, `security-specialist-agent`
- **Chaves derivadas:** `HT-XXX`

## 1. Objetivo técnico

Sustentar o épico de negócio com um sistema que possa ser mudado com segurança:
testável, observável, entregável de forma repetível e defensável em revisão.

## 2. Requisitos não funcionais

Fonte: [`docs/requisitos/REQUISITOS-NAO-FUNCIONAIS.md`](../requisitos/REQUISITOS-NAO-FUNCIONAIS.md)

| RNF | Categoria | Alvo | História |
| --- | --- | --- | --- |
| _(a definir)_ | | | |

## 3. Arquitetura

- **Estilo:** _(a definir — decidido em `HT-004`)_
- **Fronteiras:** domínio isolado de infraestrutura; dependências apontam para dentro.
- **Ports/adapters:** toda integração externa entra por porta explícita.
- **Decisões:** registradas como ADR em `docs/spec-driven-development/` ou `docs/adr/`.

| Decisão | Alternativas | Escolha | Consequência |
| --- | --- | --- | --- |
| _(a definir)_ | | | |

## 4. Segurança e privacidade

| Tema | Definição | História |
| --- | --- | --- |
| Autenticação | _(a definir)_ | |
| Autorização | _(a definir)_ | |
| Dados sensíveis e retenção | _(a definir)_ | |
| Segredos e credenciais | _(a definir)_ | |
| Dependências e supply chain | _(a definir)_ | |

## 5. Estratégia de testes

Ordem obrigatória por história com comportamento testável:

1. Cenário funcional/BDD escrito e **vermelho**.
2. Código produtivo mínimo até ficar **verde**.
3. **Refatoração** com os funcionais verdes.
4. Testes unitários para maximizar cobertura e casos de borda.

| Camada | Ferramenta | Escopo | Gate |
| --- | --- | --- | --- |
| Funcional/BDD | _(a definir)_ | | Bloqueante |
| Unitário | _(a definir)_ | | Bloqueante |
| Estático/lint | _(a definir)_ | | Bloqueante |
| Segurança | _(a definir)_ | | Bloqueante |

## 6. Harness e ambiente local

Um comando por tarefa, mesmo comando local e em CI. Ver [`scripts/README.md`](../../scripts/README.md).

## 7. CI/CD e publicação

| Etapa | Gatilho | Gates | Artefato |
| --- | --- | --- | --- |
| _(a definir)_ | | | |

## 8. Observabilidade e operação

| Sinal | O que responde | Ferramenta |
| --- | --- | --- |
| Logs | _(a definir)_ | |
| Métricas | _(a definir)_ | |
| Erros | _(a definir)_ | |

## 9. Versionamento

Versionamento semântico por entrega: `MAJOR.MINOR.PATCH`.

- `MAJOR`: quebra de contrato percebida por consumidor.
- `MINOR`: capacidade nova compatível.
- `PATCH`: correção ou ajuste interno sem mudança de contrato.

Cada entrega fecha com commit semântico citando a chave da história e tag
apontando para **o mesmo hash**.

## 10. Riscos técnicos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| _(a definir)_ | | |
