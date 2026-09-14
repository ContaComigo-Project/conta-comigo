---
name: ht-014-guarda-de-saida-da-ia
description: História técnica para tratar a resposta do modelo como entrada não confiável — validação de formato, coerência numérica contra o dado consolidado e recusa de recomendação de produto financeiro.
document_type: story
story_key: HT-014
story_type: tecnica
epic: EPIC-TEC-001
status: Ready
max_lines: 300
---

# `HT-014` — Guarda de saída da IA: validação, coerência e fronteira

- **Tipo:** História técnica
- **Épico:** `EPIC-TEC-001`
- **Estado:** **Ready — próxima demanda (ordem 22)**
- **Requisitos:** `RNF-017` (saída do modelo é entrada não confiável), `RN-019` (nenhum número exibido vem do modelo), `RN-017` (a IA não recomenda produto financeiro), `RN-021` (bloqueio degrada, não derruba)
- **Depende de:** `HT-013` — concluída
- **Versão prevista:** `v0.22.0`

## Problema técnico

`HT-013` entregou a porta e as políticas de custo, mas o texto que volta do
provedor chega hoje **direto ao chamador**. Isso trava toda a Fase 4: nenhuma
tela pode exibir saída de IA enquanto três regras não tiverem guarda executável.

- `RN-019` diz que **nenhum número exibido como dado financeiro vem do modelo**.
  Um modelo que arredonda "R$ 1.284,32" para "cerca de R$ 1.300" produz uma tela
  que contradiz o próprio painel — e a pessoa não tem como saber qual está certo.
- `RN-017` diz que a IA **não recomenda produto financeiro**, nem quando
  perguntada diretamente. Sem guarda, isso depende do prompt, e prompt não é
  garantia: é pedido.
- `RNF-017` diz que a saída é **entrada não confiável**. Texto vindo de fora
  atravessando o sistema sem validação é a mesma classe de problema que uma
  entrada de usuário sem validação.

## Resultado esperado

Existe um decorador `GuardedAdvisor` na pilha da porta `AiAdvisor`, entre o
cache e o provedor, que só deixa passar resposta aprovada em três exames:

1. **Formato** — texto não vazio, dentro de um limite de tamanho, sem marcação
   de código nem eco de instrução do prompt.
2. **Coerência numérica** — todo valor monetário citado no texto existe nos
   dados que acompanharam o pedido. Divergiu, a resposta é bloqueada (`RN-019`).
3. **Fronteira de aconselhamento** — menção a produto financeiro, investimento,
   crédito ou instituição bloqueia a resposta (`RN-017`).

Bloqueio é **falha tratada**, com motivo próprio, não exceção: a tela mostra o
aviso e continua exibindo os números (`RN-021`).

## Critérios de aceite

- [ ] As três regras vivem em `intelligence/domain/model/output-guard.ts`, puras
      e testadas sem framework
- [ ] `GuardedAdvisor` decora a porta e entra na pilha **antes** do cache, para
      que resposta bloqueada nunca seja guardada
- [ ] `RN-019`: resposta que cita `R$ 1.300,00` sobre dados que só contêm
      `R$ 1.284,32` é bloqueada; resposta que cita o valor exato passa
- [ ] `RN-019`: o formato do valor não engana a comparação — `1.284,32`,
      `R$ 1284,32` e `1284.32` são o mesmo valor
- [ ] Número que não é dinheiro (contagem, mês, porcentagem) **não** bloqueia,
      e isso está documentado como decisão
- [ ] `RN-017`: texto com "invista em", "CDB", "Tesouro Direto", "cartão de
      crédito do banco X" é bloqueado, incluindo variação de caixa e acento
- [ ] `RNF-017`: resposta vazia, gigante ou com bloco de código é bloqueada
- [ ] O motivo do bloqueio é registrado (log de `HT-012`) sem o texto suspeito
      inteiro — amostra curta basta para diagnosticar
- [ ] Bloqueio devolve falha com motivo `resposta-bloqueada`, nunca exceção
- [ ] `pnpm run lint:boundaries`, `test:unit` e `test:integration` verdes

```gherkin
Cenário: o modelo cita um número que o painel não tem
  Dado um pedido de diagnóstico com total de R$ 1.284,32
  Quando o provedor responde "você gastou cerca de R$ 1.300,00 neste mês"
  Então a resposta é bloqueada
  E o chamador recebe falha com motivo resposta-bloqueada
  E nenhum número inventado chega à tela
```

## RNF e RN atendidos

| Requisito | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-017` | Saída validada antes de exibir | Teste com resposta adulterada do provedor simulado |
| `RN-019` | Número exibido vem do consolidado | Teste com valor divergente e com valor exato |
| `RN-017` | Sem recomendação de produto | Teste com pedido insistente e resposta que recomenda |
| `RN-021` | Bloqueio degrada, não derruba | Falha tratada; nenhum `throw` atravessa a porta |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Fronteiras/módulos | Não | Mais um decorador no contexto `intelligence` |
| Dependências externas | Não | — |
| Contratos públicos | Acrescenta | Motivo de falha `resposta-bloqueada` |
| Dados e migração | Não | — |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Guarda rígida demais bloquear resposta boa | Só valor **monetário** é comparado; contagem e porcentagem passam | Ajustar a extração, com teste |
| Lista de termos proibidos virar censura ampla | Termos são de produto financeiro, não de assunto; "poupar" passa, "poupança do banco X" não | Ajustar a lista, com teste |
| Guarda depender do provedor | Ela opera sobre texto e dados, não sobre o formato do provedor | — |

## Fora de escopo

- O aviso de não aconselhamento na tela (`RN-018`) — é da história de UI que
  exibir IA primeiro (`HN-009`)
- Reescrever a resposta bloqueada, ou pedir de novo ao modelo
- Classificação de intenção da pergunta antes de enviar

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Três regras com comportamento testável |
| SRE | Sim | Bloqueio afeta o que a operação vê no log |
| Segurança | Sim | Saída não confiável é superfície de ataque |
| Arquitetura | Sim | Posição do decorador na pilha é decisão |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Testes das três regras verdes, incluindo resposta adulterada
- [ ] `lint:boundaries` verde
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HT-014-guarda-de-saida-da-ia.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HT-014` e tag `v0.22.0` no mesmo hash
