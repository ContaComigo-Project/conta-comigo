---
name: ht-002-catalogo-rf-rn
description: História técnica para transformar a SDD-001 em requisitos funcionais e regras de negócio numerados e preencher o épico de negócio.
document_type: story
story_key: HT-002
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-002` — Catalogar RF e RN e preencher o épico de negócio

- **Tipo:** História técnica (governança)
- **Épico:** `EPIC-TEC-001`
- **Estado:** Em revisão — aguarda commit e tag `v0.3.0`
- **Requisitos:** origina `RF-001` a `RF-025` e `RN-001` a `RN-023`
- **Depende de:** `HT-001`
- **Versão prevista:** `v0.3.0`

## Problema técnico

A `SDD-001` descreve o produto em prosa. Prosa não é rastreável: não dá para
dizer se um teste prova uma regra, nem se uma história cobre um requisito, nem
se algo do escopo ficou sem dono. Sem identificador estável, o critério de aceite
de qualquer história futura vira interpretação.

## Resultado esperado

Todo comportamento previsto na `SDD-001` tem um identificador `RF-XXX`, toda
invariante do domínio tem um `RN-XXX`, e o épico de negócio deixa de ser
esqueleto — passando a mapear requisito para história.

## Critérios de aceite

- [x] Todo item da seção 6 da `SDD-001` virou pelo menos um `RF` ou `RN`
- [x] Cada `RF` tem persona, prioridade MoSCoW, forma de verificação e história
- [x] Cada `RN` tem casos de borda explícitos e os `RF` que ela restringe
- [x] Nenhum `RF` descreve solução técnica
- [x] Toda `RN` é verificável por um teste que falharia se a regra fosse invertida
- [x] O épico de negócio tem visão, personas, jornadas, mapa RF→história e riscos
- [x] Os itens fora de escopo da `SDD-001` estão declarados também no épico
- [x] Nenhum identificador é reutilizado ou renumerado

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-018 | Toda RN catalogada tem teste que a prova | Cria o lado esquerdo do rastreio: sem catálogo de RN não existe rastreio RN→teste |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | História de documentação |
| Dependências externas | Não | — |
| Contratos públicos | Não | — |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Requisito escrito como solução técnica | Revisão pela skill `product-manager` | Reescrever o item; nada foi implementado |
| Regra de negócio inventada além da `SDD-001` | Cada RN aponta o RF que restringe | Remover a RN e registrar no histórico |
| Catálogo grande demais para uma PoC | Prioridade MoSCoW separa `Must` de `Could` | Rebaixar prioridade sem apagar o identificador |

## Fora de escopo

- Requisitos não funcionais (é `HT-003`)
- Escolher tecnologia (é `HT-004`)
- Criar arquivos de história de negócio além do necessário para o grooming

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Não | Sem comportamento executável |
| SRE | Não | Sem impacto de ambiente |
| Segurança | Sim | `RN-012` a `RN-019` definem a fronteira de privacidade e de não aconselhamento |
| Arquitetura | Sim | Valida se os RF não estão descrevendo implementação |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] `REQUISITOS-FUNCIONAIS.md` preenchido e coerente com a `SDD-001`
- [x] `REGRAS-DE-NEGOCIO.md` preenchido com casos de borda
- [x] `EPICO-NEGOCIO.md` preenchido
- [x] `docs/entregas/ENTREGA-HT-002-catalogo-rf-rn.md` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-002`
- [ ] Tag `v0.3.0` no mesmo hash
