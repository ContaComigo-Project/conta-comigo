---
name: ht-012-observabilidade-minima
description: História técnica para dar observabilidade mínima ao backend — log estruturado em JSON com correlação de requisição e erro rastreável até a operação, sem nenhum dado pessoal ou financeiro no log.
document_type: story
story_key: HT-012
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-012` — Observabilidade mínima: log estruturado e erro rastreável

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Ready — próxima demanda (ordem 18)**
- **Requisitos:** `RNF-008` (erro diagnosticável sem acesso à máquina), `RNF-015` (nenhum dado financeiro ou pessoal em log)
- **Depende de:** `HT-009` — concluída
- **Versão prevista:** `v0.20.0`

## Problema técnico

O backend hoje só fala por `console.log` em `main.ts`. Quando uma requisição
falha — e desde `HN-002` ela pode falhar por causa de um agregador externo — não
há como saber **qual requisição** quebrou, **em qual operação** e **por quê**,
sem anexar um depurador à máquina. Pior: a única forma de investigar hoje seria
imprimir o corpo da requisição, que carrega e-mail, senha, credencial do
agregador e valor de lançamento — exatamente o que `RNF-015` proíbe.

Falta a peça de meio: um log estruturado, com identificador de correlação por
requisição, que registre o suficiente para diagnosticar e **recuse por
construção** carregar dado pessoal ou financeiro.

## Resultado esperado

Toda requisição HTTP entra com um identificador de correlação (`requestId`,
gerado ou aproveitado do cabeçalho `x-request-id`), sai com ele no cabeçalho de
resposta e produz **uma linha JSON** em `stdout` com método, rota, status e
duração. Toda falha não tratada vira uma linha de nível `error` com o mesmo
`requestId` e a operação, e a resposta ao cliente devolve esse `requestId` — a
ponte entre o que a pessoa viu e o que o log registrou. Nenhum campo sensível
(senha, token, credencial, e-mail, valor, descrição de lançamento) chega ao log:
a redação acontece no domínio, provada por teste.

## Critérios de aceite

- [ ] `GET /transactions` responde com o cabeçalho `x-request-id`, e o valor
      recebido em `x-request-id` na requisição é preservado na resposta
- [ ] Cada requisição emite **uma** linha JSON em `stdout` com, no mínimo:
      `level`, `timestamp`, `requestId`, `method`, `route`, `status`, `durationMs`
- [ ] Falha não tratada emite linha `level: "error"` com o mesmo `requestId`,
      o nome da operação e a mensagem do erro, e a resposta HTTP devolve o
      `requestId` no corpo (`Result` de erro) e no cabeçalho
- [ ] `RNF-015`: teste com corpo contendo senha, e-mail, token e valor prova que
      nenhum desses valores aparece na saída — os campos são substituídos por
      `"[redigido]"`, e a redação é recursiva (objeto aninhado e array)
- [ ] A redação é do **domínio** (`observability/domain/`), pura e testada sem
      Nest; o transporte (middleware, filtro, escrita em `stdout`) vive só em
      `observability/infrastructure/`
- [ ] `pnpm run lint:boundaries` verde — nenhum import de `@nestjs/*` em
      `observability/domain/`
- [ ] `pnpm run test:unit` e `pnpm run test:integration` verdes

```gherkin
Cenário: uma falha é diagnosticada sem acesso à máquina
  Dado a API em execução
  Quando uma requisição falha dentro de uma operação
  Então a resposta devolve um requestId
  E o log traz uma linha JSON de erro com o mesmo requestId, a rota e a operação
  E nenhum dado pessoal ou financeiro aparece nessa linha
```

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-008` | Erro rastreável até a operação | Teste provoca falha e casa o `requestId` da resposta com o do log |
| `RNF-015` | Zero dado pessoal ou financeiro em log | Teste com senha, e-mail, token e valor: nenhum valor aparece na saída |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Sim | Novo contexto `observability` seguindo `ADR-001`; entra em `app.module.ts` |
| Dependências externas | Não | `crypto.randomUUID` do Node e o próprio Nest; nenhum pacote novo |
| Contratos públicos | Acrescenta | Erro passa a devolver `requestId`; nenhum campo existente muda |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Log virar vazamento de dado sensível | Redação por lista de chaves no domínio, testada com objeto aninhado | Remover o middleware do `app.module.ts` |
| Ruído de log em teste | `logger: false` nos testes que não observam log; sink injetável | — |
| `requestId` forjado pelo cliente | O valor recebido é usado só para correlação, nunca para autorização | — |

## Fora de escopo

- Exportar log para serviço externo (Datadog, Loki) — `HT-015` decide o destino
- Métrica, tracing distribuído e alerta
- Log do frontend
- Nível de log configurável por ambiente além de `LOG_LEVEL`

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Prova de correlação e de redação |
| SRE | Sim | É a história de operação por definição |
| Segurança | Sim | `RNF-015` é critério de aceite |
| Arquitetura | Sim | Contexto novo sob `ADR-001` |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Testes de redação (domínio) e de correlação (HTTP) verdes
- [ ] `lint:boundaries` verde com o contexto novo
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HT-012-observabilidade-minima.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-012` e tag `v0.20.0` no mesmo hash
