---
name: hn-002-conectar-instituicao
description: História de negócio — conectar uma instituição com consentimento explícito e sincronizar contas e lançamentos, com consentimento como registro de primeira classe.
document_type: story
story_key: HN-002
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-002` — Conectar instituição com consentimento e sincronizar

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda**
- **Requisitos:** `RF-004`, `RF-005`, `RF-007` · `RN-012`, `RN-014`, `RN-015`
- **Depende de:** `HN-001` (sessão), `HT-011` (porta de agregação), `HT-010` (cifra em repouso), `HT-008` (barreira por titular)
- **Versão prevista:** `v0.17.0`

## Narrativa

> Como **Marina**, pessoa bancarizada sem educação financeira formal,
> quero **conectar uma instituição com meu consentimento explícito e ver meus
> dados sincronizados**
> para **ver meu total real sem digitar nada**.

## Contexto

`HN-001` deu a sessão, `HT-011` a porta de agregação (Pluggy atrás de interface,
com política de falha) e `HT-010` a cifra em repouso. Falta o que as une: o
**registro de consentimento** — decisão explícita da pessoa de autorizar que
aquela instituição forneça dados. Hoje a tela `ConnectedBanksWidget` mostra
bancos simulados; a partir desta história, a conexão nasce de um consentimento
ativo, e a sincronização só acontece com ele (RN-012). Esta é a primeira
história que exercita a skill `open-finance-security-agent` por inteiro.

## Critérios de aceite

Cada critério vira um cenário funcional/BDD antes de existir código produtivo.

```gherkin
Cenário: conectar instituição com consentimento explícito
  Dado uma pessoa autenticada
  Quando ela autoriza a conexão de uma instituição
  Então um consentimento ativo é criado para ela naquela instituição
  E o identificador da conexão e a credencial do agregador são gravados cifrados
  E a instituição passa a aparecer na lista de conectadas com status
```

```gherkin
Cenário: um único consentimento ativo por instituição por pessoa
  Dado um consentimento ativo para a instituição X
  Quando a mesma pessoa reconecta a instituição X
  Então o consentimento anterior é substituído (RN-014)
  E só um consentimento ativo permanece
```

```gherkin
Cenário: sem consentimento ativo não há sincronização nem dado
  Dado um consentimento expirado (ou ausente) para a instituição X
  Quando a sincronização é solicitada
  Então nenhum dado da instituição X é buscado nem exibido (RN-012)
  E a lista a mostra como não sincronizada
```

```gherkin
Cenário: sincronização assíncrona traz saldos e lançamentos
  Dado um consentimento ativo
  Quando a sincronização é executada
  Então contas e lançamentos do período suportado são persistidos para o titular
  E a data da última sincronização é atualizada (RF-005, RF-007)
  E a interface responde em até 1 s com progresso (RNF-002)
```

```gherkin
Cenário: dado de uma pessoa nunca vaza para outra
  Dado dois titulares com consentimentos para instituições distintas
  Quando um titular lista ou sincroniza
  Então só dados do próprio titular são retornados (RN-015)
  E identificar um recurso de outra pessoa retorna negação, não conteúdo
```

```gherkin
Cenário: agregador indisponível degrada sem travar o painel
  Dado o agregador fora do ar (RNF-006)
  Quando a sincronização falha após o timeout e as tentativas
  Então o erro é retornado de forma estruturada
  E a lista mantém o estado anterior sem esvaziar a tela (RNF-005)
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-012` | Consentimento é a guarda de toda sincronização e exibição; expirado equivale a ausente |
| `RN-014` | Um consentimento ativo por instituição por pessoa; reconectar substitui o anterior |
| `RN-015` | Todo dado é filtrado pelo titular no servidor; recurso alheio retorna negação |

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-002` | Feedback ≤ 1 s | Sincronização assíncrona com progresso |
| `RNF-005` | Degradação graciosa | Agregador fora → erro estruturado, tela não esvazia |
| `RNF-006` | Timeout ≤ 10 s, até 2 tentativas | Política da porta de agregação exercitada |
| `RNF-014` | Cifra em repouso | Token/credencial do agregador gravados cifrados (cifra de HT-010) |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Novo contexto ou extensão | Registro de consentimento (entidade + repositório) e caso de uso de conexão |
| Contratos públicos | Novos endpoints | Conectar/listar/sincronizar via `contract` (DTOs novos) |
| Persistência | Nova tabela/migração | Consentimento com token cifrado |
| Porta de agregação | Possível extensão | Método de criação de conexão, se a porta atual não o cobrir |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Token do agregador vazar | Cifrado em repouso (RNF-014), nunca em log | Rotacionar credencial |
| Reconectar apagar consentimento válido | RN-014 registra a substituição com evidência | Restaurar a migração/linha anterior |
| Escopo crescer para HN-012 (revogação) | Revogação é história própria | Fora de escopo declarado |

## Fora de escopo

- Revogar consentimento e excluir dados (é `HN-012`)
- Painel consolidado de saldos/cartões/lançamentos (é `HN-003`)
- Categorização, descrição legível e IA (são `HN-004`/`HN-005`)
- Autenticação (é `HN-001`, entregue)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Cenários BDD por critério + RN provadas |
| Segurança | Sim | Skill `open-finance-security-agent`: consentimento, credencial cifrada, isolamento |
| SRE | Sim | Sincronização assíncrona e degradação |
| Arquitetura | Sim | Novo registro/entidade e possível extensão de porta |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Cenários funcionais/BDD escritos antes do código e agora verdes
- [ ] Testes unitários cobrindo casos de borda (RN-012/014/015)
- [ ] Teste negativo por rota (isolamento entre titulares)
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HN-002-conectar-instituicao.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-002` e tag `v0.17.0` no mesmo hash