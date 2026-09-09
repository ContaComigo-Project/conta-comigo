---
name: entrega-ht-014
description: Documento de entrega da guarda de saída da IA do ContaComigo — validação de formato, coerência numérica contra o consolidado e recusa de recomendação de produto financeiro.
document_type: delivery
story_key: HT-014
version: v0.22.0
max_lines: 300
---

# ENTREGA — `HT-014` — Guarda de saída da IA: validação, coerência e fronteira

- **Data:** 2026-09-08
- **Tipo:** Técnica
- **Versão:** `v0.22.0`
- **Commit:** `<hash do commit de fechamento>`
- **Tag:** `v0.22.0` → `<hash do commit de fechamento>`

## O que foi entregue

- **`domain/model/output-guard.ts`** — os três exames, puros e sem framework:
  - **formato** (`RNF-017`): texto vazio, acima de 4.000 caracteres ou com bloco
    de código é reprovado;
  - **coerência numérica** (`RN-019`): todo valor monetário citado precisa
    existir nos dados que acompanharam o pedido;
  - **fronteira de aconselhamento** (`RN-017`): menção a produto financeiro,
    investimento, crédito ou instituição reprova.
- **`valoresMonetariosDe`** — extrai valores em qualquer formato que um modelo
  costuma escrever (`R$ 1.284,32`, `R$ 1284,32`, `1284.32`) e os normaliza em
  centavos antes de comparar.
- **`valoresPermitidos`** — percorre os dados do pedido, inclusive aninhados,
  aceitando o número tanto em reais quanto em centavos.
- **`GuardedAdvisor`** — decorador da porta `AiAdvisor`, posicionado **abaixo do
  cache**: resposta reprovada nunca é guardada, e o que está guardado já passou
  pelos exames.
- **Motivo de falha `resposta-bloqueada`**, com explicação escrita para uma
  pessoa — e que **não repete o número inventado**, porque exibi-lo seria
  exatamente o que `RN-019` proíbe.
- **`GuardLog`** (porta) e **`GuardLogEstruturado`** (adaptador sobre o log de
  `HT-012`): o bloqueio aparece no log com motivo e uma amostra de até 80
  caracteres, nunca o texto inteiro.
- Pilha final do módulo: `Capped -> Cached -> Guarded -> Resilient -> (Gemini | Falso)`.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-017` — saída é entrada não confiável | Três exames antes de qualquer retorno; provedor simulado adulterado no teste | `output-guard.test.ts`, `guarded-advisor.test.ts` |
| `RN-019` — número exibido vem do consolidado | Valor monetário citado é comparado com os dados do pedido | Teste com `R$ 1.300,00` sobre dados de `R$ 1.284,32` |
| `RN-017` — sem recomendação de produto | Lista de termos de produto, com normalização de caixa e acento | 7 textos proibidos e 3 permitidos no teste |
| `RN-021` — bloqueio degrada, não derruba | Falha tratada com motivo próprio; nenhum `throw` atravessa | `guarded-advisor.test.ts` |
| `RNF-015` — log sem dado sensível | Amostra curta no log, não o texto reprovado | Teste do registro do bloqueio |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Regras puras no domínio | Aprovado | `output-guard.ts` sem import de framework; `lint:boundaries` verde |
| Guarda antes do cache na pilha | Aprovado | Teste conta 2 chamadas ao provedor: nada foi cacheado |
| Valor divergente bloqueia | Aprovado | `valor-divergente` |
| Formatos equivalentes são o mesmo valor | Aprovado | `1.284,32`, `R$ 1284,32` e `1284.32` → 128432 |
| Contagem, mês e porcentagem não bloqueiam | Aprovado | "31% do total, em 2 categorias" passa |
| Recomendação de produto bloqueia | Aprovado | Inclui caixa alta e acento |
| Vazio, gigante ou com código bloqueia | Aprovado | `formato-invalido` |
| Bloqueio registrado sem o texto inteiro | Aprovado | Amostra ≤ 80 caracteres |
| Falha, nunca exceção | Aprovado | `resposta-bloqueada` |
| Suítes verdes | Aprovado | 224 unitários, 13 de integração, 3 funcionais |

## Evidência de testes

Saída de `scripts/harness.sh gates`, em
`docs/tasks/HT-014/evidencia/20260908-214639-gates-verde.txt`:

```
 Test Files  40 passed (40)
      Tests  224 passed (224)
 Test Files  3 passed (3)
      Tests  13 passed (13)
  3 passed (6.0s)
Statements   : 96.57% ( 141/146 )
Branches     : 87.2% ( 75/86 )
  [OK]    nenhum segredo detectado
  [OK]    nenhuma vulnerabilidade conhecida
harness: gates concluídos
EXIT_CODE=0
```

Na ordem: unitário (40 arquivos, 224 testes — 17 novos nesta história),
integração contra o PostgreSQL do compose, funcional em Chromium, cobertura de
`domain/` e as duas varreduras de segurança.

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `pnpm run test:unit` | 224 testes verdes | +17 desta história |
| Integração | `pnpm run test:integration` | 13 testes verdes | inalterada |
| Funcional | `pnpm run test:functional` | 3 testes verdes | web real |
| Fronteiras | `pnpm run lint:boundaries` | verde | 252 módulos, 708 dependências |
| Segurança | `pnpm run security` | aprovada | gitleaks + osv-scanner |

## Refatoração feita após os funcionais verdes

O registro do bloqueio nasceu dentro do decorador e saiu para a porta `GuardLog`
com adaptador próprio. Sem isso, `intelligence` passaria a conhecer o contexto
de observabilidade no domínio — o `lint:boundaries` não reprovaria (é
infraestrutura), mas a dependência não teria por que existir.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 17 testes novos; provedor adulterado é o cenário exigido por `RNF-017` |
| SRE | `sre-agent` | Aprovado | Bloqueio visível no log estruturado, com amostra curta |
| Segurança | `security-specialist-agent` | Aprovado | Saída externa validada antes de circular; bloco de código reprovado |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Decorador na mesma porta; posição na pilha documentada no módulo |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.22.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Só valor **monetário** é comparado | Comparar todo número transformaria "3 contas conectadas" em bloqueio, e guarda que bloqueia tudo é desligada | Limite declarado abaixo |
| Guarda abaixo do cache | Reprovada não é guardada; guardada não é revalidada | Ordem documentada no módulo |
| A explicação não repete o número reprovado | Exibi-lo seria justamente o que `RN-019` proíbe | Vale para a tela de `HN-009` |
| Lista de termos de **produto**, não de assunto | "poupar" precisa passar; "poupança do banco X" não | Ajustar com teste quando surgir caso novo |
| Bloqueio não pede nova resposta ao modelo | Dobraria o custo e continuaria confiando na mesma fonte | — |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Valor inventado escrito como inteiro sem `R$` passa | Distinguir "1300" de contagem exigiria entender a frase; o custo do falso positivo é maior | Aqui, e no comentário da regra |
| Lista de termos é fixa no código | Uma lista configurável sem teste viraria porta dos fundos | Revisitar se `HN-010` exigir ajuste frequente |
| O aviso de não aconselhamento na tela | É `RN-018`, da história de UI que exibir IA primeiro | `HN-009` |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HT-014`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.22.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado
