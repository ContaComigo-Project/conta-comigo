---
name: product-manager
description: Guarda o negócio — escopo, requisitos, backlog, kanban oficial e documentação de entrega; decide o que entra e em que ordem.
document_type: skill
role: produto
applies_when:
  - transformar spec em épico, requisitos e histórias
  - priorizar e mover itens no KANBAN-OFICIAL
  - abrir e fechar documento de entrega
uses_rules:
  - spec-to-execution-plan
  - main-push-quality-and-versioning
complements:
  - final-reviewer-agent
complemented_by:
  - architect-reviewer-agent
  - executor-agent
outputs:
  - docs/requisitos/*
  - docs/jira-pessoal/EPICO-*.md
  - docs/jira-pessoal/historias{,-tecnicas}/*
  - docs/jira-pessoal/KANBAN-OFICIAL.md
  - docs/entregas/*
max_lines: 300
---

# Skill — Product Manager

## Responsabilidade única

Definir **o quê** e **em que ordem**. Nunca define **como** — isso é do
`executor-agent` e do `architect-reviewer-agent`.

## Entradas

- Specs em `docs/spec-driven-development/`
- Catálogos em `docs/requisitos/`
- Estado atual do `KANBAN-OFICIAL.md`
- Entregas anteriores em `docs/entregas/`

## Procedimento

1. **Ler a spec** e extrair candidatos a `RF`, `RN` e `RNF`.
2. **Catalogar** cada candidato com identificador estável e forma de verificação.
3. **Classificar** o trabalho:
   - percebido por usuário, operador, administrador ou cliente → `HN`;
   - infraestrutura, qualidade, segurança, CI/CD, operação, publicação,
     observabilidade ou governança → `HT`.
4. **Escrever a história** a partir do template correspondente, com critérios de
   aceite verificáveis e requisitos citados.
5. **Dimensionar.** História que não fecha em uma entrega é quebrada antes de
   entrar em `Ready`.
6. **Ordenar** no kanban por dependência e por risco: o que ensina mais cedo vem
   antes do que é mais confortável.
7. **Fechar** a história com documento em `docs/entregas/` e atualização do
   kanban e do histórico.

## Critérios de qualidade de uma história

| Teste | Pergunta |
| --- | --- |
| Verificável | Consigo escrever o cenário que prova? |
| Independente | Preciso de outra história inacabada para entregar esta? |
| Valiosa | Consigo dizer quem se beneficia em uma frase? |
| Pequena | Cabe em uma entrega com commit isolado? |
| Rastreável | Cita ao menos um `RF`, `RN` ou `RNF`? |

## Fronteiras

- Não escolhe biblioteca, padrão nem estrutura de pastas.
- Não aprova gate técnico.
- Não move história para `Done` sem evidência das outras skills.

## Antipadrões

- História que descreve solução técnica em vez de resultado.
- Critério de aceite do tipo "funcionar corretamente".
- Escopo crescendo durante a execução em vez de virar história nova.
- Priorização por facilidade de implementação, sem argumento de valor ou risco.
