---
name: entrega-ht-011
description: Documento de entrega da porta de agregação — AgregadorOpenFinance com adaptador falso, política de resiliência como decorador e adaptador Pluggy Sandbox.
document_type: delivery
story_key: HT-011
version: v0.14.0
max_lines: 300
---

# ENTREGA — `HT-011` — Adaptador Pluggy Sandbox atrás da porta de agregação

- **Data:** 2026-09-07
- **Tipo:** Técnica (integração externa)
- **Versão:** `v0.14.0`
- **Commit:** a preencher no fechamento
- **Tag:** `v0.14.0` — **pendente de autorização humana**

## O que foi entregue

A última porta obrigatória de `ADR-001` que faltava. `HN-002` agora encontra um
contrato para consumir, em vez de começar pelo SDK dentro de um caso de uso —
que é o acoplamento que motivou a arquitetura hexagonal.

E a política de falha deixou de ser cada história inventando a sua: existe uma,
testada, que vale para todo provedor.

| Artefato | Papel |
| --- | --- |
| `domain/port/saida/agregador-open-finance.ts` | A porta obrigatória |
| `domain/model/resultado-da-agregacao.ts` | Falha como **valor**, com motivo classificado |
| `infrastructure/agregador/agregador-resiliente.ts` | Timeout e retry como **decorador** de qualquer agregador |
| `infrastructure/agregador/agregador-falso.ts` | Determinístico, sem rede, massa fictícia |
| `infrastructure/agregador/agregador-pluggy.ts` | Sandbox via `fetch`; recusa sem credencial |
| `agregacao.module.ts` | Pluggy quando há credencial, falso quando não há — os dois pelo mesmo decorador |

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-020` | SDK e biblioteca externa só na borda; plantar import em `domain/` real reprova o lint | `*-lint-externo-no-dominio.txt` |
| `RNF-006` | Limite de espera por chamada, no máximo 2 novas tentativas, espera dobrando, permanente sem retry | 8 cenários com relógio falso |
| `RNF-005` | Painel responde com o agregador completamente fora | `degradacao.test.ts` |
| `RNF-012` | Credencial do ambiente; sem ela o Pluggy recusa construir; nada em log | 3 cenários de credencial |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Porta em `domain/port/saida/`; lint prova que SDK não entra | Aprovado | 2 regras nomeadas na evidência |
| `AgregadorFalso` determinístico | Aprovado | Mesma conexão, mesma saída; sem rede |
| `AgregadorPluggy` com credencial do ambiente | Aprovado | `CredencialDoAgregadorAusente` |
| Falha esperada: provedor lento interrompido no limite | Aprovado | 3 chamadas dentro de `limite × 3 + esperas` |
| Falha esperada: transitório tentado no máximo 2 vezes mais | Aprovado | Contagem exata de chamadas |
| Erro permanente sem retry | Aprovado | 1 chamada para `credencial-invalida` e `nao-encontrado` |
| Falha esperada: consulta responde com agregador fora | Aprovado | `RNF-005`, dois cenários |
| Credencial não aparece em log | Aprovado | Nem na URL, nem no detalhe da falha |
| Sem credencial, o Pluggy recusa operar | Aprovado | Construtor lança |

## Evidência de testes

Vermelho antes do código, nas duas frentes:

```
      Tests  5 failed | 99 passed (104)
      Tests  4 failed | 107 passed (111)
```

Gate de fronteira bloqueando biblioteca externa no domínio do contexto novo:

```
  error dominio-sem-framework-nem-io: backend/src/agregacao/domain/model/usa-framework-proposital.ts → node_modules/.pnpm/@nestjs+common@12.0.1_reflect-metadata@0.2.2_rxjs@7.8.2/node_modules/@nestjs/common/index.js
```

Gates finais:

```
✔ no dependency violations found (163 modules, 381 dependencies cruised)
      Tests  128 passed (128)
Lines        : 100% ( 29/29 )
No issues found
seguranca: aprovada
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `harness test-unitario` | 128 passed (+32) | — |
| Integração | `harness test-integracao` | 4 passed | — |
| Funcional | `harness test-funcional` | 2 passed | — |
| Cobertura (domínio) | `harness coverage` | 100% (29/29), quatro contextos | — |
| Estático | `harness lint` | 163 módulos, 0 violações | — |

## Refatoração feita após os funcionais verdes

1. **O `axios` foi removido.** Eu o adicionei como devDependency só para uma
   fixture de fronteira — e o gate de segurança reprovou: **29 vulnerabilidades
   conhecidas** na versão instalada. Pior, a fixture não provava nada novo: a
   regra `dominio-sem-framework-nem-io` pega qualquer pacote npm, e
   `@nestjs/common` e `@prisma/client` já a provam. Dependência real para provar
   regra já provada é custo sem benefício. A fixture saiu e a prova passou a ser
   feita em **código real** do contexto novo.
2. **Dois testes meus estavam errados**, não o código. O de espera crescente
   filtrava por `>= esperaBase` e capturava os `10000` do timeout junto; o de
   interrupção avançava o relógio de um limite só, mas timeout é falha
   transitória e o ciclo tem 3 tentativas. Corrigidos **apertando** as
   asserções, não afrouxando: a primeira agora compara a lista exata.
3. **Sonda ambígua no teste de log**: eu verificava ausência de `"invalid"`, que
   é substring de `credencial-inv**alid**a`. Trocada por marcador único, e
   acrescentei asserção positiva — o `401` continua no log, porque diagnóstico
   útil não é vazamento.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | Vermelho registrado nas duas frentes; contagem de chamadas distingue transitório de permanente |
| SRE | `sre-agent` | Aprovado | Política única para todo provedor; credenciais opcionais documentadas |
| Segurança | `security-specialist-agent` | Aprovado | Credencial do ambiente; recusa sem ela; corpo ecoado pelo provedor não sobrevive ao redator |
| Open Finance | `open-finance-security-agent` | Aprovado | Seção 3: credencial fora do repositório e fora do log. Seção 5: detalhe da falha não carrega corpo do provedor |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Porta obrigatória criada; SDK confinado; resiliência como decorador, não duplicada |
| Revisão final | `final-reviewer-agent` | Aprovado | Nenhum caso de uso de negócio; escopo contido |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| Resiliência como **decorador**, não dentro do Pluggy | O falso também a ganha, e testar timeout dispensa rede |
| Falha como valor de retorno, não exceção | O compilador obriga o caso de uso a decidir; exceção que sobe até a borda é o oposto de `RNF-005` |
| `fetch` nativo, sem SDK | Duas chamadas não justificam dependência; menos superfície a auditar |
| 4xx não é retentado | Insistir com credencial errada não conserta e gasta cota |
| Conexão desconhecida → `nao-encontrado`, não lista vazia | Confundir as duas esconde erro de configuração atrás de tela sem movimento |
| Módulo escolhe Pluggy só com credencial | Ambiente local sobe sem Sandbox e sem cadastro |
| Massa do falso é fictícia | `HT-016` achou identidade real nos mocks da web; não se repete |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| `AgregadorPluggy` nunca falou com o Sandbox real | Não há credencial; todos os testes injetam `fetch`. A tradução dos campos é hipótese até a primeira chamada real | `HN-002` |
| `Promise.race` libera quem chamou, mas a promessa do provedor segue pendente | Não há como cancelar uma `Promise`; o cancelamento real vai no `AbortSignal` do `fetch`, já implementado no adaptador | — |
| Nenhum caso de uso consome a porta ainda | Por desenho | `HN-002` |

## Verificação de fechamento

- [ ] `scripts/verificar-fechamento.sh v0.14.0` verde
- [ ] Tag `v0.14.0` — **aguarda autorização**
- [ ] Evidência presente em `docs/tasks/HT-011/evidencia/`
