---
name: adr-indice
description: Índice dos registros de decisão de arquitetura (ADR) do ContaComigo.
document_type: index
applies_when:
  - registrar uma decisão estrutural
  - entender por que o projeto é como é
max_lines: 300
---

# ADR — Registros de Decisão de Arquitetura

Um ADR responde uma pergunta que o código não responde: **por que**.

Decisão sem consequência declarada não é decisão, é preferência. Por isso todo
ADR aqui declara o que se ganha, o que se perde, e o que precisaria acontecer
para a decisão ser revertida.

| ADR | Decisão | Status | História |
| --- | --- | --- | --- |
| [ADR-001](./ADR-001-arquitetura-hexagonal-no-backend.md) | Arquitetura hexagonal (ports & adapters) no backend | Aceita | `HT-003` |
| ADR-002 | ORM da camada de persistência | Pendente | `HT-004` |
| ADR-003 | Framework de teste funcional e unitário | Pendente | `HT-004` |
| ADR-004 | Autenticação | Pendente | `HT-004` |
| ADR-005 | Hospedagem | Pendente | `HT-015` |

## Convenções

- Arquivo: `ADR-XXX-<assunto-em-kebab-case>.md`, numeração sequencial e imutável.
- Base: [ADR-000-template.md](./ADR-000-template.md).
- Status: `Proposta` → `Aceita` → `Substituída por ADR-XXX` | `Descartada`.
- ADR **não se edita para mudar de ideia**. Cria-se um novo que substitui o
  anterior, e o antigo passa a `Substituída por`. O histórico do raciocínio é o
  valor do registro.
- Toda decisão estrutural relevante entra aqui: fronteiras, dependência externa
  nova, contrato público, estratégia de persistência, autenticação.

## Quando um ADR é obrigatório

O gate de arquitetura (`architect-reviewer-agent`) reprova a entrega se a
história introduziu qualquer um destes sem ADR:

| Situação | Exemplo |
| --- | --- |
| Módulo ou fronteira nova | Um contexto novo no backend |
| Dependência externa nova | Uma biblioteca que passa a ser estrutural |
| Contrato público novo ou alterado | O contrato de `HT-017` |
| Padrão que se repetirá | Como todo caso de uso é escrito |
| Escolha entre alternativas com custo real | Qualquer decisão de `HT-004` |
