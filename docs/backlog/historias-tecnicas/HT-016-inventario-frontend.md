---
name: ht-016-inventario-frontend
description: História técnica para inventariar a camada web existente, mapear tela para requisito e decidir o destino de cada comportamento hoje implementado nos mocks.
document_type: story
story_key: HT-016
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-016` — Inventário do frontend existente

- **Tipo:** História técnica (governança)
- **Épico:** `EPIC-TEC-001`
- **Estado:** Backlog
- **Requisitos:** afeta `RF-001` a `RF-024`, `RN-001`, `RN-006`, `RN-024`, `RN-025`
- **Depende de:** `HT-004`
- **Versão prevista:** `v0.6.0`

## Problema técnico

A camada web foi construída antes do catálogo de requisitos: **5.930 linhas**,
41 componentes React, 9 arquivos de mock e **nenhum teste**. O backlog foi
escrito como se o produto começasse do zero, e isso está errado de duas formas.

Primeiro: a maioria das histórias de negócio é integração, não construção — a
tela já existe.

Segundo, e mais grave: **há regra de negócio morando na camada de mock.**
`frontend/src/mocks/budget.mock.ts:78` implementa a `RN-001`:

```ts
const BUDGET_RULES = { verdeMax: 70, amareloMax: 90 } as const;
export function resolveStatus(percentage: number): BudgetStatus { ... }
```

Ninguém aprovou esse código como especificação. Ele contém pelo menos duas
decisões que o time nunca tomou — o teto de 200% e o arredondamento para uma
casa antes de decidir a faixa (`RN-024` e `RN-025`, hoje em `Rascunho`). Se
essas decisões forem preservadas por acidente, o produto passa a ter regras que
ninguém consegue justificar.

## Resultado esperado

Um inventário que responde, para cada componente e cada mock: a qual `RF` ele
serve, se é **mantido, adaptado ou descartado**, e qual comportamento hoje
implementado precisa ser promovido a requisito antes de ser reescrito.

## Decisão já tomada que esta história executa

O time decidiu: **preservar a UI, reescrever a lógica.** Componentes, estilo e
navegação ficam; toda regra de negócio hoje em `src/mocks/` é descartada e
reescrita no domínio do backend, com teste antes.

Consequência: **não haverá teste de caracterização sobre os mocks.** Testar
código que será apagado é trabalho jogado fora. O papel dos mocks aqui é servir
de fonte de observação — não de especificação.

## Critérios de aceite

- [x] Existe `docs/inventario-frontend.md` listando os 41 componentes com:
      caminho, `RF` servido, classificação (mantém / adapta / descarta) e motivo
- [x] Todo componente sem `RF` correspondente está explicitamente marcado como
      "sem requisito" — e vira decisão: promover a `RF` ou descartar
- [x] Os 9 arquivos de mock estão classificados: vira contrato de dados, vira
      massa de teste, ou é descartado
- [x] Toda regra de negócio encontrada em `src/` está listada com o arquivo e a linha
- [x] `RN-024` e `RN-025` saem de `Rascunho`: aprovadas ou descartadas, com motivo registrado
- [x] Nenhum comportamento observado permanece em estado indefinido
- [x] `KANBAN-OFICIAL.md` atualizado se o inventário mudar o escopo de alguma `HN`

```gherkin
Cenário: nenhuma regra de negócio fica escondida no frontend
  Dado o inventário concluído
  Quando alguém procura onde uma regra de negócio está implementada
  Então o inventário aponta o arquivo e a linha
  E diz se a regra foi promovida a RN ou marcada para descarte
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-020 | Integrações e regras substituíveis | Localiza tudo que precisa sair da camada de apresentação |
| RNF-018 | Toda RN tem teste que a prova | Impede que uma regra não catalogada escape do rastreio |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não ainda | Documenta a violação; a correção é `HT-017` e `HT-018` |
| Dependências externas | Não | — |
| Contratos públicos | Não | Insumo para o contrato definido em `HT-017` |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Inventário virar lista morta | Cada linha exige classificação e motivo, não só descrição | Reexecutar; nenhum código foi tocado |
| Time preservar regra por inércia | `RN-024` e `RN-025` obrigam decisão explícita | Reabrir a RN |
| Descobrir escopo escondido nas telas | Componente sem `RF` vira decisão registrada | Novo `RF` ou descarte, ambos rastreáveis |

## Fora de escopo

- Alterar qualquer código do frontend
- Escrever teste
- Definir o contrato de dados (é `HT-017`)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Sim | O inventário pode revelar dado sensível ou credencial em mock |
| Arquitetura | Sim | Localiza regra de negócio fora do domínio |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] `docs/inventario-frontend.md` criado e completo
- [x] `RN-024` e `RN-025` resolvidas no catálogo
- [x] `docs/entregas/ENTREGA-HT-016-inventario-frontend.md` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [x] Commit semântico citando `HT-016`
- [x] Tag `v0.6.0` no mesmo hash
