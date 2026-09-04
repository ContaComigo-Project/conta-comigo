---
name: ht-009-esqueleto-backend-hexagonal
description: História técnica para criar o esqueleto hexagonal do backend com domínio isolado, portas, adaptadores e verificação automática das fronteiras de importação.
document_type: story
story_key: HT-009
story_type: tecnica
epic: EPIC-TEC-001
status: Backlog
max_lines: 300
---

# `HT-009` — Esqueleto do backend hexagonal

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Backlog (ordem 10)
- **Decisão que a rege:** [`ADR-001`](../../adr/ADR-001-arquitetura-hexagonal-no-backend.md)
- **Requisitos:** `RNF-020`, `RNF-021`; habilita `RNF-018`
- **Depende de:** `HT-006` (infra de testes), `HT-004` (ferramenta de fronteira)
- **Versão prevista:** a definir no grooming

## Problema técnico

O diretório `backend/` contém apenas um README. Não existe domínio, não existe
porta, não existe nada que impeça a primeira regra de negócio de nascer dentro
de um controller com o ORM injetado ao lado — que é o caminho natural do NestJS.

`ADR-001` decidiu que o backend é hexagonal. Uma decisão que nada verifica vira
decoração em três semanas: basta um `import { Repository } from 'typeorm'`
dentro de `domain/` para a fronteira deixar de existir, e ninguém percebe.

## Resultado esperado

Um esqueleto vazio mas **executável e verificado**: as camadas existem, o
wiring funciona, e a violação das regras de importação de `ADR-001` **quebra o
build**. A partir daí, cada história de negócio só preenche os espaços.

## Critérios de aceite

- [ ] A estrutura por contexto de `ADR-001` existe, com um contexto de exemplo
      atravessando todas as camadas
- [ ] O contexto de exemplo tem: entidade de domínio, porta de entrada, porta de
      saída, caso de uso, controller e adaptador de persistência falso
- [ ] O `<contexto>.module.ts` liga porta a adaptador por **token**, não por
      classe concreta
- [ ] Nenhuma entidade de domínio tem decorator de ORM, de validação de
      transporte ou de serialização
- [ ] Existe a porta `Relogio`, com implementação real e implementação fixa para
      teste — `RN-003` e `RN-005` dependem disso
- [ ] A checagem de fronteiras de importação roda em `scripts/harness.sh lint`
- [ ] A checagem **bloqueia**: existe teste que prova que ela falha
- [ ] O caso de uso de exemplo tem teste que roda sem banco, sem HTTP e sem
      framework

```gherkin
Cenário: o dominio nao pode conhecer o framework
  Dado o esqueleto do backend
  Quando alguem adiciona "import { Injectable } from '@nestjs/common'"
  E o arquivo esta dentro de domain/
  Então a verificacao de fronteiras falha
  E o build nao passa
```

```gherkin
Cenário: a regra de dominio e testavel sem infraestrutura
  Dado o caso de uso de exemplo
  Quando executo o teste dele
  Então nenhum banco de dados foi iniciado
  E nenhuma chamada de rede foi feita
  E o teste termina em menos de um segundo
```

```gherkin
Cenário: o tempo esta sob controle do teste
  Dado a porta Relogio com implementacao fixa
  Quando o teste define a data como 31/01 as 23h59
  Então o dominio enxerga janeiro como mes de referencia
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| RNF-020 | Zero referência a SDK fora do adaptador | A checagem de importação torna a violação impossível de passar despercebida |
| RNF-021 | Gates bloqueiam de fato | Teste que provoca a violação e observa o build falhar |
| RNF-018 | Toda RN com teste | Cria a condição: regra testável sem infraestrutura |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | É a história que materializa `ADR-001` |
| Dependências externas | Sim | Framework e ferramenta de fronteira, ambas decididas em `HT-004` |
| Contratos públicos | Não ainda | Contrato com a web é `HT-017` |
| Dados e migração | Não | Persistência real é `HT-010`; aqui o adaptador é falso |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Esqueleto virar cerimônia sem uso | Um contexto de exemplo só, atravessando as camadas de ponta a ponta | Achatar as camadas conforme o caminho de reversão de `ADR-001` |
| Checagem de fronteira configurada como aviso | Critério de aceite exige teste que prove o bloqueio | — |
| Time contornar a fronteira por pressa | A violação quebra o build, não depende de disciplina | — |
| Ferramenta de fronteira não existir para a stack | `HT-004` valida a existência antes de decidir | Script próprio comparando caminhos de import |

## Fora de escopo

- Persistência real (é `HT-010`)
- Qualquer regra de negócio do produto
- Adaptadores de Pluggy e Gemini (são `HT-011` e `HT-013`)
- Autenticação (é `HN-001`)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | O teste do caso de uso e o teste da checagem precisam realmente falhar quando devem |
| SRE | Sim | A checagem entra no harness e no CI |
| Segurança | Não | Sem superfície nova, sem dado |
| Arquitetura | Sim | É a materialização de `ADR-001` |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Estrutura de `ADR-001` implementada e executável
- [ ] Checagem de fronteiras no harness, bloqueante e testada
- [ ] Cenários funcionais escritos antes do código e verdes
- [ ] Refatoração feita após o verde
- [ ] `docs/entregas/ENTREGA-HT-009-*.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-009` e tag no mesmo hash
