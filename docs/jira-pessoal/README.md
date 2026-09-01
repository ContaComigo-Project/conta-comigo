---
name: jira-pessoal-indice
description: Índice do backlog do projeto — kanban oficial, épicos, histórias de negócio e histórias técnicas.
document_type: index
applies_when:
  - localizar uma história pela chave
  - entender a separação entre negócio e técnico
max_lines: 300
---

# Jira Pessoal

| Artefato | Caminho | Papel |
| --- | --- | --- |
| Kanban oficial | [KANBAN-OFICIAL.md](./KANBAN-OFICIAL.md) | Fonte única da próxima demanda |
| Épico de negócio | [EPICO-NEGOCIO.md](./EPICO-NEGOCIO.md) | Visão, personas, RF, RN |
| Épico técnico | [EPICO-TECNICO.md](./EPICO-TECNICO.md) | RNF, arquitetura, segurança, CI/CD |
| Histórias de negócio | [historias/](./historias/) | `HN-XXX` |
| Histórias técnicas | [historias-tecnicas/](./historias-tecnicas/) | `HT-XXX` |

## Qual tipo usar

| Pergunta | Resposta |
| --- | --- |
| Alguém (usuário, operador, administrador, cliente) percebe a mudança? | **História de negócio** `HN-XXX` |
| A mudança é infraestrutura, qualidade, segurança, CI/CD, operação, publicação, observabilidade ou governança? | **História técnica** `HT-XXX` |
| Ambos? | Duas histórias. Uma história nunca mistura os dois valores. |

## Convenções

- Arquivo: `HN-001-titulo-em-kebab-case.md` / `HT-001-titulo-em-kebab-case.md`.
- Chave nunca é reutilizada, mesmo se a história for cancelada.
- História grande demais para uma entrega é quebrada antes de entrar em `Ready`.
- Toda história cita pelo menos um `RF`, `RN` ou `RNF`.
