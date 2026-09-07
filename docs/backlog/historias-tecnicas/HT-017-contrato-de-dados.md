---
name: ht-017-contrato-de-dados
description: História técnica para definir o contrato de dados entre a camada web e a API, de modo que a UI existente seja preservada quando a lógica sair dos mocks.
document_type: story
story_key: HT-017
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-017` — Contrato de dados entre a web e a API

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Em revisão (ordem 12)
- **Requisitos:** habilita `RF-008`, `RF-009`, `RF-013`, `RF-014`, `RF-016` a `RF-021`
- **Depende de:** `HT-016` — `v0.6.0`; `HT-009` — `v0.9.0`
- **Versão prevista:** `v0.11.0`

## Problema técnico

A decisão do time é preservar a UI e reescrever a lógica. Isso só funciona se
existir um contrato: os componentes hoje consomem estruturas definidas dentro
de `src/mocks/`, e essas estruturas foram desenhadas para a conveniência da
tela, não para representar o domínio.

Sem contrato definido antes, acontece uma de duas coisas ruins: ou a API é
moldada pelo formato acidental dos mocks, ou cada história de integração
renegocia o formato e a UI quebra repetidas vezes.

## Resultado esperado

Um contrato explícito — tipos de transporte e o significado de cada campo —
que permite trocar a origem do dado sem alterar os componentes, e que não
carrega para a API decisões que eram só de apresentação.

## Critérios de aceite

- [x] Cada estrutura consumida pela UI tem um tipo de transporte definido e documentado
- [x] Nenhum campo do contrato existe apenas para conveniência visual
      (classe CSS, ícone, rótulo) — esses permanecem no frontend
- [x] O campo derivado de regra de negócio (ex.: a faixa do semáforo) é
      **calculado no domínio** e transportado pronto, nunca recalculado na tela
- [x] O contrato cobre o estado de erro e o estado "dados insuficientes"
      (`RN-020`, `RN-021`), não só o caminho feliz
- [x] Os componentes atuais compilam contra o novo contrato sem mudança visual
- [x] Existe uma implementação de origem falsa que satisfaz o contrato, usada
      pelos testes e pelo ambiente local

```gherkin
Cenário: trocar a origem do dado não muda a tela
  Dado um componente que hoje lê de src/mocks
  Quando a origem é trocada pela implementação que satisfaz o contrato
  Então o componente renderiza o mesmo resultado
  E nenhum arquivo de componente precisou ser alterado
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-020 | Adapters trocáveis | O contrato é a porta entre a UI e a origem do dado |
| RNF-005 | Degradação graciosa | O contrato modela erro e indisponibilidade explicitamente |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | Cria a fronteira entre apresentação e domínio, que hoje não existe |
| Dependências externas | Não | — |
| Contratos públicos | Sim | Este é o contrato |
| Dados e migração | Não | Persistência é `HT-010` |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Contrato desenhado a partir do mock, herdando decisão acidental | `HT-016` já separou o que é requisito do que é acidente | Redesenhar o campo; a UI está isolada por trás do contrato |
| Campo de apresentação vazar para a API | Critério de aceite proíbe explicitamente | Mover o campo de volta para o frontend |
| UI quebrar durante a troca | Implementação falsa satisfaz o contrato antes de existir API | Reverter para a origem anterior; nada foi apagado ainda |

## Fora de escopo

- Remover os mocks (é `HT-018`, depois que as telas estiverem integradas)
- Implementar qualquer endpoint real
- Alterar aparência ou comportamento visual

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | O contrato precisa de teste que prove a substituição de origem |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Sim | Contrato define o que trafega; dado sensível não pode vazar por excesso de campo |
| Arquitetura | Sim | Cria a fronteira central do sistema |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Contrato documentado e implementado
- [x] Origem falsa satisfazendo o contrato, usada em teste
- [x] Componentes existentes compilando sem mudança visual
- [x] `docs/entregas/ENTREGA-HT-017-contrato-de-dados.md` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [x] Commit semântico citando `HT-017`
- [ ] Tag semântica no mesmo hash — **aguarda autorização humana** (regra 6 do AGENTS.md)
