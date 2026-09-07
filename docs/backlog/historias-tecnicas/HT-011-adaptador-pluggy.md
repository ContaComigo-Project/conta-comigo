---
name: ht-011-adaptador-pluggy
description: Porta AgregadorOpenFinance com adaptador Pluggy Sandbox e adaptador falso — timeout, nova tentativa controlada e degradação sem derrubar o painel.
document_type: story
story_key: HT-011
story_type: tecnica
epic: EPIC-TEC-001
status: Em revisão
max_lines: 300
---

# `HT-011` — Adaptador Pluggy Sandbox atrás da porta de agregação

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** Em revisão (ordem 14)
- **Decisão que a rege:** [`ADR-001`](../../adr/ADR-001-arquitetura-hexagonal-no-backend.md)
- **Requisitos:** `RNF-020`, `RNF-005`, `RNF-006`; habilita `RF-007`
- **Depende de:** `HT-009` — `v0.9.0`
- **Versão prevista:** `v0.14.0`

## Problema técnico

`ADR-001` declara `AgregadorOpenFinance` como **porta obrigatória**, e ela não
existe. Sem ela, `HN-002` (conectar instituição e sincronizar) começaria pelo
SDK do Pluggy dentro de um caso de uso — exatamente o acoplamento que `RNF-020`
proíbe e que `ADR-001` cita como o motivo de ter escolhido hexagonal.

Também não há política de falha. `RNF-006` exige timeout ≤ 10 s e no máximo 2
novas tentativas com espera crescente; `RNF-005` exige que o provedor fora
degrade a tela em vez de derrubá-la. Se cada história de integração inventar a
sua, o comportamento vira loteria — e a primeira indisponibilidade do Pluggy
deixa o painel em branco em vez de exibir o dado que já está no banco.

## Resultado esperado

Existe a porta `AgregadorOpenFinance` no domínio, com **duas** implementações:
o adaptador Pluggy Sandbox e um adaptador falso determinístico que serve aos
testes e ao ambiente local sem credencial. A política de timeout e nova
tentativa é uma só, testada, e a indisponibilidade do provedor devolve um
resultado de erro tratável — nunca uma exceção que sobe até a tela.

Nenhum caso de uso de negócio é escrito aqui: `HN-002` consome a porta.

## Critérios de aceite

Critério técnico também é verificável. Prefira comando reprodutível a descrição.

- [x] Existe `AgregadorOpenFinance` em `domain/port/saida/`, e o lint prova que
      nenhum SDK ou `axios` entra em `domain/` ou `application/`
- [x] Existe `AgregadorFalso` determinístico: mesma entrada, mesma saída, sem rede
- [x] Existe `AgregadorPluggy` usando a API Sandbox, com credencial vinda do
      ambiente — e **nunca** do repositório
- [x] Falha esperada: provedor que demora além do limite é interrompido em
      ≤ 10 s e o resultado é erro tratável, não exceção vazando (`RNF-006`)
- [x] Falha esperada: provedor que devolve erro transitório é tentado no máximo
      **2** vezes mais, com espera crescente, e então desiste (`RNF-006`)
- [x] Erro permanente (credencial inválida) **não** é tentado de novo
- [x] Falha esperada: com o agregador fora, a consulta de lançamentos já
      persistidos continua respondendo (`RNF-005`)
- [x] Nenhuma credencial ou token do agregador aparece em log — provado com o
      redator de `HT-008`
- [x] `harness security` segue verde; sem credencial no ambiente, o
      `AgregadorPluggy` recusa operar em vez de tentar anonimamente
- [x] Toda evidência registrada por `scripts/registrar-evidencia.sh`

```gherkin
Cenário: provedor lento é interrompido
  Dado um agregador que não responde
  Quando o sistema pede as contas de uma conexão
  Então a espera termina em no máximo 10 segundos
  E o resultado é um erro de indisponibilidade, não uma exceção

Cenário: falha transitória é tentada de novo, e só até o limite
  Dado um agregador que falha nas duas primeiras chamadas e responde na terceira
  Quando o sistema pede as contas
  Então o dado é devolvido
  E foram feitas exatamente três chamadas

Cenário: painel sobrevive ao provedor fora
  Dado lançamentos já persistidos e o agregador indisponível
  Quando alguém consulta os próprios lançamentos
  Então a lista responde normalmente
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-020` | Zero referência a SDK fora do adaptador | Lint de fronteiras com o SDK plantado em `domain/` |
| `RNF-006` | Timeout ≤ 10 s; no máximo 2 novas tentativas | Agregador falso lento e instável, com contagem de chamadas |
| `RNF-005` | Painel numérico funcional com provedor fora | Consulta de lançamentos verde com agregador indisponível |
| `RNF-012` | Credencial fora do repositório | Segredo do ambiente; recusa explícita sem ele |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | Porta obrigatória de `ADR-001` passa a existir |
| Dependências externas | Sim | Cliente HTTP do Pluggy, confinado ao adaptador |
| Contratos públicos | Não | Nenhuma rota nova; `HN-002` as cria |
| Dados e migração | Não | Nada é persistido aqui |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Sandbox do Pluggy indisponível ou exigindo cadastro | O adaptador falso cobre todos os testes; o real é exercitado só com credencial presente | Manter o falso como padrão local |
| Política de retry mascarar erro permanente | Erro permanente não é reententado; teste prova a distinção | Ajustar a classificação de erro |
| Formato da resposta do Pluggy mudar | Tradução isolada no adaptador, validada na borda | Corrigir o adaptador; a porta não muda |

## Fora de escopo

- Consentimento, conexão e sincronização reais (`HN-002`)
- Persistir contas, cartões ou lançamentos vindos do agregador (`HN-002`)
- Tela de conexão (`HN-002`)
- Cifra do token do agregador — o utilitário existe desde `HT-010`; o primeiro
  uso é de `HN-002`

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Timeout, retry e desistência precisam falhar quando devem |
| SRE | Sim | Política de resiliência e variável de ambiente nova |
| Segurança | Sim | Credencial de provedor externo |
| Open Finance | Sim | Credencial de agregador (seção 3) e log sem dado (seção 5) |
| Arquitetura | Sim | Porta obrigatória; SDK confinado ao adaptador |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Comportamento testável coberto por cenário funcional antes do código
- [x] Refatoração feita após os funcionais verdes
- [x] Testes unitários onde houver lógica
- [x] Gates marcados acima executados com evidência
- [x] Documentação operacional atualizada (`.env.example`)
- [x] `docs/entregas/` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-011` e tag no mesmo hash — commit feito; **tag aguarda autorização humana**
