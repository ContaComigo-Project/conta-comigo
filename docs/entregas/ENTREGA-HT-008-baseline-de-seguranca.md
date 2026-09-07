---
name: entrega-ht-008
description: Documento de entrega do baseline de segurança — skill de Open Finance, barreira de autorização por titular com teste negativo, redator de log e guardião da allowlist de segredos.
document_type: delivery
story_key: HT-008
version: v0.12.0
max_lines: 300
---

# ENTREGA — `HT-008` — Baseline de segurança

- **Data:** 2026-09-07
- **Tipo:** Técnica (segurança)
- **Versão:** `v0.12.0`
- **Commit:** a preencher no fechamento
- **Tag:** `v0.12.0` — **pendente de autorização humana**

## O que foi entregue

O dado passou a ter dono, e a barreira que protege esse dono é provada por
teste negativo. `RN-015` — "dado de uma pessoa nunca é visível para outra" —
deixou de ser uma frase no catálogo: hoje ela é violável (logo, verificável), e
três testes mostram que não é violada.

Junto veio a skill `open-finance-security-agent`, o roteiro de gate que faltava
para consentimento, credencial de agregador e retenção de dado financeiro — o
julgamento que o gate de segurança geral não cobre.

| Artefato | Papel |
| --- | --- |
| `.agents/skills/open-finance-security-agent/SKILL.md` | Gate especialista: 7 seções, veredito e antipadrões; no índice e na tabela de gates do workflow |
| `domain/model/titular.ts`, `domain/port/saida/identidade.ts` | `TitularId` nominal; identidade como **porta** — `HN-001` troca a implementação sem tocar domínio |
| `infrastructure/http/guarda-de-titular.ts` | Barreira no servidor; toda rota do módulo herda |
| `infrastructure/http/identidade-do-cabecalho.ts` | Implementação **provisória** (`x-titular-id`), declarada como tal |
| `titularId` na entidade, no schema e em migração | Sem dono, não há barreira |
| `repositorio-prisma.ts` | Filtro por titular **na consulta**, com índice |
| `infrastructure/log/redator.ts` | `RNF-015`: 17 campos sensíveis, recursivo |
| `tests/seguranca/allowlist.test.ts` | Impede que a allowlist de segredos cegue a varredura |

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RNF-013` | Guarda no servidor; três casos negativos por rota; titular nunca vem da requisição | `*-test-unitario-verde.txt` |
| `RN-015` | Filtro na consulta, com teste de integração provando no Postgres real | `*-test-integracao-verde-isolamento.txt` |
| `RNF-015` | Redator recursivo, testado sobre a entidade real e objeto aninhado | 7 cenários no `redator.test.ts` |
| `RNF-012` (parcial) | Bundle da web coberto e cobertura guardada por teste | ver Dívida — a metade do CI é `HT-007` |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Skill com frontmatter, ≤300 linhas, no índice e no workflow | Aprovado | 195 linhas; auditoria verde |
| Porta `Identidade`; titular nunca de parâmetro | Aprovado | teste com `?titularId=` ignorado |
| `titularId` na entidade, migração, filtro na consulta | Aprovado | `20260907204736_titular_do_lancamento` |
| Falha esperada: sem credencial recusa | Aprovado | 401, sem conteúdo no corpo |
| Falha esperada: credencial de outro titular devolve vazio | Aprovado | titular B recebe só o dele; resposta não contém "do A" |
| Credencial válida devolve apenas os próprios | Aprovado | `['de-a-1','de-a-2']` |
| Redator prova que dado não sobrevive | Aprovado | valor, descrição, token, e-mail, CPF |
| `security` cobre o `dist/` da web | Aprovado — **por outro caminho** | ver Refatoração |
| Falha esperada: chave no bundle é detectada | Aprovado | `*-security-bundle-com-segredo.txt` |

## Evidência de testes

Vermelho antes do código — redator inerte e rota sem barreira:

```
      Tests  10 failed | 66 passed (76)
```

Mutação: removidas **as duas** camadas da barreira, o dado escapa:

```
      Tests  2 failed | 78 passed (80)
```

Gates finais:

```
✔ no dependency violations found (124 modules, 249 dependencies cruised)
      Tests  80 passed (80)
      Tests  4 passed (4)
Lines        : 100% ( 15/15 )
seguranca: aprovada
harness: gates concluídos
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `harness test-unitario` | 80 passed (+18) | — |
| Integração | `harness test-integracao` | 4 passed (+1: isolamento no banco) | — |
| Funcional | `harness test-funcional` | 2 passed | — |
| Cobertura (domínio) | `harness coverage` | 100% (15/15) | — |
| Estático | `harness lint` | 124 módulos, 0 violações | — |

## Refatoração feita após os funcionais verdes

1. **A varredura extra do bundle foi removida por ser redundante.** A primeira
   versão adicionava uma terceira passada do gitleaks sobre `frontend/dist`.
   Ao provar a falha esperada, apareceu que `gitleaks dir` **lê o filesystem e
   ignora o `.gitignore`** — verificado plantando uma chave em `coverage/`,
   gitignored, e observando a detecção. A varredura da árvore já cobria o
   bundle; a passada extra custava ~30 s por execução e não protegia nada novo.
   No lugar entrou `tests/seguranca/allowlist.test.ts`, que guarda o risco real:
   alguém isentar `dist/` na allowlist e apagar a cobertura em silêncio.
2. **O teste de mutação foi corrigido.** Remover só `@UseGuards` deixava tudo
   verde, porque o controller também recusa — defesa em profundidade
   deliberada. A mutação honesta remove as duas camadas, e aí o teste fica
   vermelho. Registrado porque muda como se lê o resultado: o teste prova o
   comportamento de borda, não qual camada o produz.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 10 vermelhos por asserção; mutação corrigida e registrada |
| SRE | `sre-agent` | Aprovado | `down`+`setup` aplica as duas migrações; `gates` verde |
| Segurança | `security-specialist-agent` | Aprovado | Autorização no servidor; teste negativo por rota; log redigido |
| Open Finance | `open-finance-security-agent` | **Aprovado com ressalva** | Seção 4 atendida (titular da sessão, filtro na consulta, vazio em vez de 403). Ressalva: `IdentidadeDoCabecalho` não autentica — ver Dívida. Seções 2, 3 e 6 não se aplicam ainda |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Identidade é porta; guarda em `infrastructure/`; `titularId` não viaja no DTO |
| Revisão final | `final-reviewer-agent` | Aprovado | Escopo contido; MINOR |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| `TitularId` como tipo nominal | Impede passar um `string` qualquer onde a barreira depende do titular certo |
| Caso de uso recebe `TitularId`, não `Identidade` | Mantém o caso de uso testável sem mock e sem objeto HTTP (`ADR-001` r.4) |
| Porta sem `listarTodos` | Uma porta que devolve tudo convida a filtrar em memória — que já vazou |
| Titular alheio → lista vazia, não 403 | 403 confirma que o recurso existe (seção 4 da skill) |
| Redator por nome de campo, não regex no texto | O texto já perdeu a estrutura: "8740" pode ser centavos ou página |
| Banco recriado para migrar | O Prisma recusou por 3 linhas residuais de teste; `harness down` é o caminho documentado, e não havia dado real |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| **`IdentidadeDoCabecalho` não é autenticação** — `x-titular-id` é forjável | Deliberado: constrói e prova a barreira antes de `HN-001`. O comportamento de borda já é o final; só a validação da credencial falta | `HN-001` |
| Varredura de segredo não roda no CI | `RNF-012` pede "harness **e** CI"; a metade do CI é de `HT-007`, adiada | `HT-007` |
| Redator existe mas nada o usa ainda | `main.ts` ainda usa `console.log`; ligá-lo ao logger é parte de log estruturado | `HT-012` |
| Consentimento, credencial de agregador e retenção | A skill os cobre; a implementação vem depois | `HN-002`, `HT-011` |

## Verificação de fechamento

- [ ] `scripts/verificar-fechamento.sh v0.12.0` verde
- [ ] Tag `v0.12.0` — **aguarda autorização**
- [ ] Evidência presente em `docs/tasks/HT-008/evidencia/`
