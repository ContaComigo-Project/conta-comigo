---
name: architecture-boundaries-and-solid
description: Protege fronteiras de módulo, SOLID e ports/adapters, exigindo design pragmático e justificado em vez de abstração especulativa.
document_type: rule
severity: bloqueante
applies_when:
  - introduzir módulo, dependência externa ou contrato novo
  - revisar impacto arquitetural no gate de arquitetura
complements:
  - clean-code-readable-names
  - refactor-after-functional-green
complemented_by:
  - spec-to-execution-plan
max_lines: 300
---

# Regra — Fronteiras Arquiteturais e SOLID

## Intenção

Arquitetura aqui tem um objetivo prático: manter barato mudar de ideia. Toda
regra abaixo existe para reduzir o custo da próxima história, não para satisfazer
um diagrama.

## Obrigações

1. **Dependências apontam para dentro.** O domínio não conhece framework, banco,
   HTTP, fila nem provedor externo. O inverso é permitido.
2. **Toda integração externa entra por porta explícita.** Cliente HTTP, SDK de
   terceiro e driver de banco ficam atrás de uma interface do domínio, com
   adaptador na borda.
3. **Uma razão para mudar por unidade (SRP).** Se duas mudanças de motivos
   diferentes tocam o mesmo arquivo com frequência, a unidade está errada.
4. **Aberto para extensão, fechado para modificação (OCP)** onde há variação
   real e recorrente — não onde alguém imagina que talvez haja.
5. **Substituição sem surpresa (LSP).** Implementação alternativa não pode
   quebrar a expectativa do contrato nem lançar "não suportado".
6. **Interface enxuta (ISP).** Quem depende não deve ser forçado a conhecer
   métodos que não usa.
7. **Depender de abstração (DIP)** nos pontos de troca provável; depender do
   concreto é aceitável onde a troca é improvável e o custo da indireção é real.

## Pragmatismo obrigatório

| Situação | Decisão esperada |
| --- | --- |
| Uma implementação, troca improvável | Sem interface. Abstração especulativa é custo sem receita |
| Regra de negócio | Domínio, sempre — nunca no controlador nem no repositório |
| Duplicação com 2 ocorrências | Espere. Duplicação é mais barata que abstração errada |
| Duplicação com 3+ ocorrências e mesmo motivo de mudança | Extraia |

## Registro de decisão

Toda escolha estrutural relevante vira ADR com: contexto, alternativas,
decisão e consequência. Decisão sem consequência declarada não é decisão, é
preferência.

## Decisões já tomadas neste projeto

As regras acima são genéricas. O que elas significam concretamente aqui está em
[`docs/adr/`](../../docs/adr/):

| ADR | O que fixa |
| --- | --- |
| `ADR-001` | Backend hexagonal: estrutura de pastas, quais camadas podem importar o quê, e a checagem que quebra o build na violação |

Conflito entre esta rule e um ADR resolve-se pelo ADR — ele é a decisão
específica, e declara a consequência assumida.

## Sinais de violação

- `import` de framework dentro do domínio.
- Entidade de domínio com anotação de ORM ou serialização de transporte.
- Caso de uso recebendo objeto de requisição HTTP.
- Interface com uma única implementação criada "por padrão", sem troca prevista.
