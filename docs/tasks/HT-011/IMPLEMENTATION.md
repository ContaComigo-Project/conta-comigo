---
name: implementation-ht-011
description: Plano técnico da porta de agregação — contrato da porta, adaptador falso determinístico, política de resiliência decorando qualquer agregador e adaptador Pluggy Sandbox.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-011`

- **Requisitos ligados:** `RNF-020`, `RNF-005`, `RNF-006`, `RNF-012`
- **Versão prevista:** `v0.14.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Contexto novo `agregacao`, com a porta que `ADR-001` declara obrigatória. Três
peças, cada uma com uma responsabilidade:

| Peça | Responsabilidade |
| --- | --- |
| `AgregadorOpenFinance` (porta) | O que o domínio pode pedir: contas e lançamentos de uma conexão |
| `AgregadorFalso` | Implementação determinística, sem rede, para teste e ambiente local |
| `AgregadorResiliente` | **Decora** qualquer agregador com timeout e nova tentativa |
| `AgregadorPluggy` | Fala com a API Sandbox; traduz a resposta para o domínio |

**A resiliência é um decorador, não código repetido dentro do adaptador.** Se
a política vivesse no `AgregadorPluggy`, o `AgregadorFalso` não a teria — e os
testes de timeout e retry precisariam de rede para existir. Como decorador, ela
é testada contra um agregador falso que falha sob controle, e o mesmo
comportamento vale para o Pluggy e para qualquer provedor futuro.

**Erro é valor de retorno, não exceção.** A porta devolve
`ResultadoDaAgregacao<T>` — `ok` ou `falha` com motivo classificado
(`indisponivel`, `credencial-invalida`, `nao-encontrado`). É o que permite a
`RNF-005`: o caso de uso vê a falha, decide degradar, e o painel numérico
continua respondendo com o que já está no banco.

**A classificação decide o retry.** Transitório (rede, 5xx, timeout) é tentado
de novo; permanente (credencial inválida, 4xx) não é — insistir com credencial
errada não conserta nada e ainda gasta a cota do provedor.

**Sem credencial, o Pluggy recusa operar** em vez de tentar anonimamente, como
o `EmissorJwt` de `HN-001` e a cifra de `HT-010`. O padrão do repositório é
falhar alto, não improvisar.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Política de retry dentro do `AgregadorPluggy` | O falso ficaria sem ela; testar timeout exigiria rede |
| Lançar exceção em falha do provedor | Uma exceção que sobe até a tela é o oposto de `RNF-005` |
| Biblioteca de retry (`p-retry`, `cockatiel`) | 30 linhas de política explícita e testável valem mais que uma dependência a fixar e auditar |
| SDK oficial do Pluggy | `fetch` nativo basta para as duas chamadas desta história; menos superfície a auditar (`RNF-012`) e nada a atualizar |
| Retry em erro permanente | Gasta cota e não conserta credencial errada |

## 3. Fronteiras e design

```
backend/src/agregacao/
  domain/model/{conta-externa,lancamento-externo}.ts
  domain/model/resultado-da-agregacao.ts        ok | falha(motivo)
  domain/port/saida/agregador-open-finance.ts   a porta obrigatória
  domain/port/saida/tokens.ts
  infrastructure/agregador/agregador-falso.ts       determinístico
  infrastructure/agregador/agregador-resiliente.ts  timeout + retry (decorador)
  infrastructure/agregador/agregador-pluggy.ts      Sandbox
  agregacao.module.ts
```

`domain/` continua sem `axios`, sem SDK e sem I/O — o lint de fronteiras
verifica, e a história planta um import proibido para provar que reprova.

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Testes de resiliência sobre decorador stub | Vermelho por asserção |
| 2 | `AgregadorResiliente` real | Verde |
| 3 | Refatoração | Verde mantido |
| 4 | `AgregadorPluggy` + falhas provocadas | Verde; falhas registradas |

| Cenário | Regra | Arquivo |
| --- | --- | --- |
| Provedor que não responde é interrompido dentro do limite | `RNF-006` | `agregador-resiliente.test.ts` |
| Falha transitória: 2 falhas + 1 sucesso = 3 chamadas | `RNF-006` | idem |
| Três falhas seguidas desistem e devolvem `indisponivel` | `RNF-006` | idem |
| Credencial inválida: **uma** chamada, sem retry | `RNF-006` | idem |
| Espera entre tentativas é crescente | `RNF-006` | idem |
| Falso é determinístico: duas chamadas, mesma saída | — | `agregador-falso.test.ts` |
| Pluggy sem credencial recusa operar | `RNF-012` | `agregador-pluggy.test.ts` |
| Credencial não aparece em log | `RNF-015` | idem, com o redator |
| Consulta de lançamentos verde com agregador fora | `RNF-005` | evidência de `harness test` |

O tempo nos testes usa relógio falso (`vi.useFakeTimers`) — esperar 10 s de
verdade tornaria a suíte inútil.

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Contagem de chamadas; distinção transitório × permanente |
| SRE | Sim | `PLUGGY_CLIENT_ID`/`SECRET` documentados; `gates` verde |
| Segurança | Sim | Credencial do ambiente; recusa sem ela; nada em log |
| Open Finance | Sim | Seção 3 (credencial de agregador) e seção 5 (log) da skill |
| Arquitetura | Sim | Porta obrigatória; SDK/HTTP confinado ao adaptador |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Teste de timeout ficar lento | Alta se ingênuo | Relógio falso do Vitest |
| Sandbox exigir cadastro que não temos | Média | O falso é o padrão; o Pluggy só roda com credencial presente, e o teste dele pula com aviso explícito |
| `AbortSignal.timeout` indisponível | Baixa | Node 24 tem; documentado no adaptador |

## 7. Plano de reversão

`git revert`; nada é persistido e nenhuma rota muda. O módulo sai do
`app.module` em uma linha.

## 8. Fechamento

- Mensagem de commit prevista: `feat(agregacao): add the Open Finance port with a resilient adapter (HT-011)`
- Tag prevista: `v0.14.0` — aguarda autorização humana
