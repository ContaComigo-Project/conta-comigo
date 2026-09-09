---
name: implementation-hn-004
description: Plano técnico de HN-004 — limpeza determinística no domínio, IA em lote como último recurso e original preservado.
document_type: implementation_plan
applies_when:
  - implementar a história HN-004
max_lines: 300
---

# IMPLEMENTATION — `HN-004`

- **Requisitos ligados:** `RF-010`, `RN-010`, `RN-019`, `RN-021`, `RNF-005`, `RNF-009`, `RNF-010`, `RNF-015`
- **Versão prevista:** `v0.23.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Duas camadas, e a ordem entre elas é a decisão central da história.

**Primeiro as regras determinísticas**, no domínio: prefixo de adquirente,
sufixo de parcela, código numérico, caixa alta e um dicionário curto de
estabelecimentos. Elas são gratuitas, instantâneas, testáveis e resolvem a maior
parte de uma fatura real — a maioria das descrições segue um punhado de padrões.

**Depois a IA, só para o resto e em lote.** Uma conta com 300 lançamentos não
pode virar 300 chamadas: o teto de `RNF-009` é de 20 por dia. O caso de uso
junta as descrições distintas que sobraram, manda **uma** pergunta com a lista e
espera um mapa de volta.

**E o original nunca é tocado** (`RN-010`). A descrição legível é um campo
derivado; o que veio do agregador continua no lançamento e vai para o contrato
como `descriptionOriginal` sempre que os dois diferirem.

Se a IA falhar, estourar o teto ou tiver a resposta bloqueada pela guarda de
`HT-014`, o lançamento fica com a versão determinística — e, se nem essa
reconheceu, com o texto original. Nenhum caminho deixa a lista vazia
(`RNF-005`, `RN-021`).

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Só IA, uma chamada por lançamento | Estoura o teto diário no primeiro uso real e paga por algo que uma regex resolve |
| Só regras determinísticas | Cobre o padrão frequente e falha justamente no caso estranho, que é o que a pessoa não reconhece |
| Sobrescrever a descrição original | Viola `RN-010` e destrói a conferência com a fatura |
| Limpar na leitura, a cada `GET` | Paga o custo de novo a cada abertura de tela; a limpeza é do momento da sincronização |
| Deixar a web fazer a limpeza | Regra de negócio no frontend é exatamente o que `HT-016` decidiu extinguir |

## 3. Fronteiras e design

- Módulos tocados: `transactions` (domínio, aplicação, persistência, HTTP), web
- Contratos novos ou alterados: `descriptionOriginal` passa a ser preenchido
- Dependências que entram: nenhuma; a porta de IA já existe

A porta `DescriptionTranslator` vive no domínio de `transactions`, e o adaptador
que a implementa sobre `AiAdvisor` vive na infraestrutura. Assim o caso de uso
não conhece IA nenhuma — conhece "algo que traduz descrição".

## 4. Estratégia de testes

Ordem obrigatória:

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenário funcional: lista mostra descrição legível | Vermelho antes do código |
| 2 | Regras determinísticas e caso de uso mínimos | Verde |
| 3 | Refatoração do lote e do fallback | Continua verde |
| 4 | Unitários: dicionário, parcela, código, tradutor fora do ar | Verdes |

| Cenário | Regra que prova | Arquivo de teste |
| --- | --- | --- |
| `PAG*MERCADO CENTRAL 04/12` vira `Mercado Central` | `RF-010` | `readable-description.test.ts` |
| Descrição irreconhecível mantém o original | `RN-010` | `readable-description.test.ts` |
| Um lote com 10 desconhecidas gera 1 chamada | `RNF-009` | `make-descriptions-readable.test.ts` |
| Tradutor fora do ar mantém a lista | `RNF-005`, `RN-021` | `make-descriptions-readable.test.ts` |
| Valor e data não mudam | `RN-010` | `make-descriptions-readable.test.ts` |
| `descriptionOriginal` no transporte | `RN-010` | teste do DTO/controller |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | `scripts/harness.sh gates` |
| SRE | Sim | Custo: chamadas por lote, com cache |
| Segurança | Sim | O que sai para o provedor é texto de descrição, sem valor |
| Open Finance | Sim | Dado de titular atravessa fronteira externa |
| Arquitetura | Sim | Porta no domínio de `transactions`, adaptador na infraestrutura |
| Revisão final | Sim | `scripts/verificar-fechamento.sh v0.23.0` |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Regra agressiva apagar informação útil | Média | Cada regra tem teste com entrada real; o original fica guardado |
| IA devolver mapa incompleto | Alta | O que não voltar fica com a versão determinística |
| Lote grande estourar o tamanho do prompt | Média | Limite de itens por lote, com o resto ficando para a próxima sincronização |

## 7. Plano de reversão

Parar de preencher a coluna derivada e devolver `description` a partir do
original no DTO. A coluna pode ser removida por migração; nenhum dado original
foi alterado.

## 8. Fechamento

- Mensagem de commit prevista: `feat(transactions): readable description with the original preserved (HN-004)`
- Tag prevista: `v0.23.0` apontando para o commit de fechamento
