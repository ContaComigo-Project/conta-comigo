---
name: entrega-ht-016
description: Documento de entrega do inventário do frontend existente do ContaComigo e do destino de cada componente, mock e regra de negócio.
document_type: delivery
story_key: HT-016
version: v0.6.0
max_lines: 300
---

# ENTREGA — `HT-016` — Inventário do frontend existente

- **Data:** 2026-09-05
- **Tipo:** Técnica (governança)
- **Versão:** `v0.6.0`
- **Commit:** `[preenchido no fechamento]`
- **Tag:** `v0.6.0` → `[mesmo hash]`

## O que foi entregue

- **`docs/inventario-frontend.md`** — inventário completo da camada web:
  58 arquivos, 5.930 linhas; **41 componentes** (38 `.tsx` + 3 hooks) com
  caminho, `RF` servido, classificação (mantém/adapta/descarta) e motivo;
  **9 mocks** com destino (contrato de dados, massa de teste, descarta);
  **mais de 25 regras de negócio** localizadas com arquivo e linha.
- **`RN-024` e `RN-025` resolvidas**: descartadas como regra de domínio, com
  motivo registrado no catálogo — a única fonte de faixa passa a ser `RN-001`.
- **Notas de escopo no kanban**: rotas mortas (`HN-003`), `console.log` de
  credenciais (`HN-001`) e identidade pessoal real em mocks (`HT-018`).
- **Insumo para `HT-017` e `HT-018`**: contrato deve separar número e
  formatação; mocks apontados para remoção.

Nenhum código do frontend foi alterado (fora de escopo declarado).

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-018` — toda RN com teste rastreável | Localiza cada regra hoje fora do domínio e aponta a história dona; impede regra não catalogada de escapar | `docs/inventario-frontend.md` §3 |
| `RNF-020` — regras substituíveis | Classifica o destino de cada mock e regra; a fronteira de `HT-017`/`HT-018` se apoia nisso | `docs/inventario-frontend.md` §2 e §5 |
| `RN-001` — faixa de semáforo | Confirma 70/90 como única fonte; `RN-024`/`RN-025` descartadas evitam ambiguidade de fronteira | `REGRAS-DE-NEGOCIO.md` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Inventário lista os componentes com caminho, RF, classificação e motivo | Aprovado | §1 com 41 linhas |
| Componente sem RF marcado como decisão | Aprovado | §1.6 (landing) e §5 (rotas mortas) |
| 9 mocks classificados (contrato/massa/descarta) | Aprovado | §2 tabela completa |
| Toda regra de negócio em `src/` listada com arquivo e linha | Aprovado | §3.1 e §3.2 (R1–R24) |
| `RN-024` e `RN-025` saem de Rascunho | Aprovado | Status `Descartada` no catálogo + §4 |
| Nenhum comportamento em estado indefinido | Aprovado | Cada regra aponta história dona ou decisão registrada |
| Kanban atualizado se o escopo de HN mudar | Aprovado | Notas de escopo adicionadas |

## Evidência de verificação

```
$ find frontend/src -name '*.ts' -o -name '*.tsx' | wc -l
58
$ wc -l $(find frontend/src -name '*.ts' -o -name '*.tsx') | tail -1
  5930 total
```

Contagem confirma o escopo da história (58 arquivos, 5.930 linhas). As 41
entradas de componentes e as 9 de mocks foram conferidas uma a uma contra a
árvore real.

## Testes

Não aplicável: história de análise e documentação — sem comportamento
executável, sem código alterado. O critério documental ("nenhuma regra escondida
no frontend") é provado pela tabela §3, que aponta arquivo e linha de cada regra.

## Refatoração feita após os funcionais verdes

Não aplicável. Consistência entre artefatos: a contagem de componentes no
inventário (41) foi conferida contra a árvore real de `.tsx` (38 componentes +
3 hooks de comportamento), e as `RN-024`/`RN-025` foram resolvidas de forma
alinhada com `RN-001`.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Não aplicável | Sem comportamento executável |
| SRE | `sre-agent` | Não aplicável | Sem impacto de ambiente |
| Segurança | `security-specialist-agent` | Aprovado com ressalva | Inventário **expôs** `console.log` de credenciais (`Login.tsx:23`, `Register.tsx:53`) e identidade pessoal real em mocks (`user.mock.ts:3-5`). Risco registrado; remoção agendada em `HN-001` e `HT-018` |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Regras de negócio localizadas fora do domínio (faixas 70/90 re-hardcoded em 4+ views) com história de correção apontada |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios de aceite com evidência; sem escopo extra; incremento MINOR (`v0.6.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| `RN-024` descartada (cap 200 é de UI, não do dado) | Truncar dado esconde estouro; `RN-001` opera sobre valor real | Domínio calcula % real; barra capa exibição |
| `RN-025` descartada (sem arredondamento antes da faixa) | 70,04% viraria verde, contrariando `RN-001` | Faixa determinística por comparação exata |
| Landing permanece "sem requisito" (institucional) | Não é funcionalidade de produto; não vira RF | Fora do catálogo, preservada |
| Links mortos removidos em `HN-003` | Rotas inexistentes são bug de navegação | Nota no kanban |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| `console.log` de credenciais segue no código | Fora de escopo de HT-016 (não altera código) | Kanban → `HN-001` |
| Identidade real segue nos mocks | Idem | Kanban → `HT-018` |
| Faixas 70/90 duplicadas em views | Correção é `HT-017`/`HT-018` | Inventário §5 |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HT-016`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.6.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado