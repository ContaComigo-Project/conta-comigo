---
name: implementation-ht-008
description: Plano técnico do baseline de segurança — titular no domínio, guarda no servidor, filtro na consulta, redator de log e varredura do bundle.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HT-008`

- **Requisitos ligados:** `RNF-012`, `RNF-013`, `RNF-015`; `RN-015`
- **Versão prevista:** `v0.12.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

A barreira só existe se o dado tiver dono. Então `titularId` entra na entidade
`Lancamento`, no schema e numa migração — sem isso, `RN-015` não é violável nem
demonstrável, e o teste negativo seria teatro.

**Identidade é porta, não detalhe de framework.** `Identidade.titularAtual()`
vive em `domain/port/saida/`; o caso de uso recebe o `TitularId` já resolvido e
nunca vê cabeçalho, cookie ou token. `HN-001` troca a implementação por JWT
(`ADR-004`) sem tocar em domínio, aplicação ou guarda.

**Implementação provisória, honesta sobre o que é.** Até `HN-001`,
`IdentidadeDoCabecalho` lê `x-titular-id`. Isso **não é autenticação** — é o
soquete onde a autenticação entra. O arquivo diz isso em comentário, e a guarda
recusa a requisição sem o cabeçalho, então o comportamento de borda já é o
final: sem credencial, não passa.

**O filtro é da consulta, não da memória.** `listarDoTitular(titularId)` vai ao
banco com `where`. Filtrar depois de buscar tudo já vazou pelo log, pela métrica
e pelo tempo de resposta.

**Recurso alheio responde como inexistente.** Lista de outro titular volta
vazia; 403 confirmaria que o id existe (seção 4 da skill).

**Redator na borda do log.** `redigir(valor)` percorre o objeto e substitui o
valor de chaves sensíveis por `[redigido]`, por nome de campo — `descricao`,
`valorEmCentavos`, `token`, `email`, `senha`, `authorization`. Simples e
verificável; log estruturado de verdade é `HT-012`.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| `titularId` como parâmetro da rota | É o vetor de ataque que a skill proíbe na seção 4 |
| Guarda só no controller, sem porta | Amarra o domínio ao mecanismo; `HN-001` teria de reescrever |
| Middleware global que injeta titular em `request` | Caso de uso passaria a depender do objeto HTTP (`ADR-001` regra 4) |
| Responder 403 para dado alheio | Confirma existência do recurso ao atacante |
| Redator por regex no texto final do log | Não distingue valor de descrição; falha silenciosa |
| Esperar `HT-007` para fazer a história | Dois dos três RNFs não dependem de CI; adiar deixaria `HN-001` sem padrão |

## 3. Fronteiras e design

```
domain/model/titular.ts                     TitularId (tipo)
domain/port/saida/identidade.ts             Identidade.titularAtual()
domain/model/lancamento.ts                  + titularId
domain/port/saida/repositorio-de-lancamentos.ts   listarDoTitular(titularId)
application/*.ts                            recebem Identidade; resolvem o titular
infrastructure/http/guarda-de-titular.ts    CanActivate: sem titular, recusa
infrastructure/http/identidade-do-cabecalho.ts    provisória (HN-001 substitui)
infrastructure/log/redator.ts               RNF-015
infrastructure/persistence/repositorio-prisma.ts  where: { titularId }
```

A guarda é NestJS puro e vive em `infrastructure/`; o domínio não a conhece.

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Testes negativos de rota e do redator, sobre stubs | Vermelho por asserção |
| 2 | Titular no domínio, migração, guarda, redator | Verde |
| 3 | Refatoração | Verde mantido |
| 4 | Falhas provocadas: guarda removida; chave no bundle | Vermelho registrado |

| Cenário | Regra que prova | Arquivo |
| --- | --- | --- |
| Sem credencial recusa | `RNF-013` | `guarda-de-titular.test.ts` (HTTP) |
| Titular B não vê dado de A | `RN-015` | idem |
| Titular vê o próprio dado | `RNF-013` | idem |
| Filtro chega ao banco | `RN-015` | `repositorio-prisma.integracao.test.ts` |
| Valor, descrição, token e e-mail redigidos | `RNF-015` | `redator.test.ts` |
| Chave no bundle é detectada | `RNF-012` | evidência de `harness security` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Vermelho registrado; três casos negativos por rota |
| SRE | Sim | `setup` aplica a migração nova; `gates` verde |
| Segurança | Sim | Roteiro do `security-specialist-agent` |
| Open Finance | Sim | Seções 4 e 5 da skill nova |
| Arquitetura | Sim | Identidade é porta; guarda fora do domínio |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| Teste de integração antigo quebrar com a coluna nova | Alta | Atualizado na mesma volta |
| `x-titular-id` ser confundido com autenticação | Média | Comentário no arquivo, dívida na entrega, guarda recusando ausência |
| Redator não alcançar objeto aninhado | Média | Teste com entidade real aninhada |
| gitleaks não achar chave no `dist/` por ser minificado | Média | Chave plantada é de padrão conhecido; se falhar, registrar limitação em vez de fingir |

## 7. Plano de reversão

`git revert`; `harness down` descarta a migração com o volume. A guarda sai do
módulo em uma linha, e as rotas voltam ao comportamento aberto anterior.

## 8. Fechamento

- Mensagem de commit prevista: `feat(security): isolate data by holder and keep financial data out of logs (HT-008)`
- Tag prevista: `v0.12.0` — aguarda autorização humana
