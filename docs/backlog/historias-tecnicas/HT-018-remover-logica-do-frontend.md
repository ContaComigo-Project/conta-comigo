---
name: ht-018-remover-logica-do-frontend
description: História técnica para apagar a camada de mocks e a lógica de negócio residual do frontend depois que o domínio passar a ser a única fonte da regra.
document_type: story
story_key: HT-018
story_type: tecnica
epic: EPIC-TEC-001
status: Backlog
max_lines: 300
---

# `HT-018` — Remover a lógica de negócio do frontend

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Backlog
- **Requisitos:** `RNF-020`; protege `RN-001`, `RN-006`, `RN-019`
- **Depende de:** todas as `HN` de integração que consumiam mocks
- **Versão prevista:** a definir no grooming (penúltima da fila)

## Problema técnico

Enquanto `frontend/src/mocks/` existir junto com a implementação do domínio,
haverá **duas implementações da mesma regra de negócio**. Elas vão divergir — é
questão de quando, não de se. E a divergência é silenciosa: a tela continua
mostrando um número, só que o errado.

O caso concreto: `resolveStatus()` decide a faixa do semáforo no frontend. Depois
que `HN-007` mover essa decisão para o domínio, a função continua lá, importável,
e o próximo componente que precisar da faixa vai chamá-la de novo.

## Resultado esperado

O frontend volta a ser camada de apresentação: recebe dado pronto pelo contrato
de `HT-017`, formata e exibe. Nenhuma decisão de negócio sobrevive ali.

## Critérios de aceite

- [ ] `frontend/src/mocks/` não existe mais, ou contém apenas massa de teste
      explicitamente classificada como tal em `HT-016`
- [ ] Nenhuma função que decide regra de negócio permanece em `frontend/src/`
      — busca por `resolveStatus`, `recompute`, limiares numéricos e cálculo de
      percentual não retorna decisão de domínio
- [ ] Constantes de regra (70, 90, teto de percentual) não existem no frontend
- [ ] Formatação de moeda, data e rótulo **permanecem** no frontend: são
      apresentação, não regra
- [ ] Todas as telas continuam funcionando, provado pelos cenários funcionais
      das `HN` já entregues
- [ ] Nenhum componente foi alterado visualmente

```gherkin
Cenário: a regra do semáforo tem uma única implementação
  Dado o sistema com domínio e frontend integrados
  Quando busco no frontend por onde a faixa do semáforo é decidida
  Então não encontro nenhuma decisão de faixa no código da camada web
  E a faixa exibida veio pronta do domínio
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-020 | Zero regra fora do domínio | Busca por decisão de negócio no frontend retorna vazio |
| RNF-018 | Toda RN tem teste que a prova | Elimina a cópia da regra que nenhum teste do domínio cobre |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | Fecha a fronteira aberta por `HT-017` |
| Dependências externas | Não | — |
| Contratos públicos | Não | Consome o contrato existente |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Apagar mock que ainda era usado por uma tela | Só executa depois que todas as `HN` dependentes estão `Done` | Reverter o commit; a história é isolada por definição |
| Confundir formatação com regra e apagar demais | Critério de aceite separa os dois casos explicitamente | Restaurar a função de formatação, que não é regra |
| Tela quebrar sem ninguém perceber | Cenários funcionais das `HN` entregues são a rede de proteção | Se não houver cenário, a `HN` correspondente não estava pronta |

## Fora de escopo

- Alterar aparência
- Adicionar comportamento novo
- Refatorar componente que não contém regra de negócio

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | A rede de proteção são os cenários funcionais já existentes |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Não | Remoção de código, sem superfície nova |
| Arquitetura | Sim | É a história que fecha a fronteira |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Mocks removidos ou reclassificados
- [ ] Nenhuma regra de negócio no frontend
- [ ] Suíte funcional verde sem alteração nos testes
- [ ] `docs/entregas/ENTREGA-HT-018-remover-logica-do-frontend.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-018`
- [ ] Tag no mesmo hash
