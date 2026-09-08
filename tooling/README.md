---
name: tooling-fronteiras-indice
description: Ferramenta de checagem de fronteiras — regras executáveis do ADR-001 e ADR-002 para o dependency-cruiser, reutilizadas entre a árvore de produção e as fixtures de teste.
document_type: index
applies_when:
  - alterar as regras de importação do ADR-001/ADR-002
  - entender como o gate de fronteiras é configurado
max_lines: 300
---

# Tooling — Checagem de Fronteiras

Configuração executável do dependency-cruiser que transforma as regras de
importação de `ADR-001` (hexagonal) e `ADR-002` (Prisma confinado) em gate
bloqueante (`RNF-021`).

## Componentes

| Arquivo | Papel |
| --- | --- |
| `fronteiras/regras.cjs` | Fábrica `criarRegras(raiz)` com as 7 regras: domínio só importa domínio; domínio/application não conhecem transporte nem framework; application não conhece infra; Prisma só em `infrastructure/persistence/`; sem ciclos; sem import irresolvível |
| `fronteiras/fixtures.cjs` | Config do cruiser para as fixtures de `tests/fronteiras/fixtures/` — usa a mesma fábrica, com a raiz inferida do alvo |
| `.dependency-cruiser.cjs` (raiz) | Aplica a fábrica à árvore de produção: `depcruise backend frontend/src` |

## Por que existe

Uma única lista de regras roda sobre dois alvos diferentes:

1. **Produção** (`backend/src` e `frontend/src`) — vira o `pnpm run lint:fronteiras`,
   bloqueando no harness e no CI.
2. **Fixtures** (`tests/fronteiras/fixtures/{limpo,violacao}`) — o teste
   `tests/fronteiras/` prova que **cada regra reprova o que deveria** (árvore
   `violacao` falha, árvore `limpo` passa).

Se a regra mudar, muda num só lugar e a prova de comportamento continua cobrindo
as duas árvores. Histórico de furos corrigidos está em
`docs/tasks/HT-009/evidencia/` e `docs/tasks/HT-017/evidencia/`.