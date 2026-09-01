---
name: requisitos-indice
description: Índice dos catálogos de requisitos funcionais, não funcionais e regras de negócio do projeto.
document_type: index
applies_when:
  - consultar identificador de requisito antes de escrever uma história
  - preencher escopo após o spec-driven-development
max_lines: 300
---

# Requisitos

Esta pasta é o catálogo estável de identificadores. Histórias **citam** estes
identificadores; elas não os redefinem.

| Catálogo | Prefixo | Arquivo |
| --- | --- | --- |
| Requisitos funcionais | `RF-` | [REQUISITOS-FUNCIONAIS.md](./REQUISITOS-FUNCIONAIS.md) |
| Requisitos não funcionais | `RNF-` | [REQUISITOS-NAO-FUNCIONAIS.md](./REQUISITOS-NAO-FUNCIONAIS.md) |
| Regras de negócio | `RN-` | [REGRAS-DE-NEGOCIO.md](./REGRAS-DE-NEGOCIO.md) |

## Regras do catálogo

- Identificador nunca é reutilizado nem renumerado; requisito descartado vira `Obsoleto`.
- Todo requisito precisa ser verificável por teste, métrica ou evidência.
- Requisito sem história associada fica em `Backlog`; história sem requisito citado não entra em `Ready`.
- Quem edita este catálogo é a skill `product-manager` (RF/RN) e `architect-reviewer-agent` + `sre-agent` (RNF).

## Estado atual

Catálogos vazios por decisão do time: os requisitos serão definidos após a
sessão de spec-driven-development. Ver `docs/spec-driven-development/`.
