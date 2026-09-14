---
name: implementation-hn-001
description: Plano técnico do acesso — contexto acesso com Conta, portas de hash e token, JWT curto com refresh revogável, e substituição da identidade provisória de HT-008.
document_type: implementation
applies_when:
  - planejar tecnicamente uma história antes de implementar
max_lines: 300
---

# IMPLEMENTATION — `HN-001`

- **Requisitos ligados:** `RF-001`, `RF-002`, `RF-003`; `RN-015`, `RNF-012`, `RNF-013`, `RNF-015`
- **Versão prevista:** `v0.13.0`
- **Tipo de mudança:** MINOR

## 1. Abordagem

Contexto novo `acesso`, seguindo `ADR-001`. O agregado é `Conta` (identificador,
e-mail, hash da senha). A senha em claro **nunca** entra no domínio: quem
transforma senha em hash é a porta `HashDeSenha`, e o caso de uso recebe o
resultado — o domínio guarda hash, não segredo.

**Três portas de saída**, todas de `ADR-004`:

| Porta | Responsabilidade | Implementação |
| --- | --- | --- |
| `HashDeSenha` | `gerar`, `conferir` | bcrypt com cost, atrás da porta |
| `EmissorDeToken` | assinar e validar o access token | JWT ~15 min |
| `RepositorioDeSessoes` | guardar e revogar refresh opaco | Prisma |

**Refresh opaco, não JWT.** `ADR-004` pede revogação real: um JWT de refresh só
seria revogável com lista de bloqueio, que é a mesma tabela — sem o benefício.
O refresh é um valor aleatório, guardado **em hash** (se o banco vazar, os
refresh não são utilizáveis), com expiração e `revogadoEm`.

**A mensagem de recusa é uma só.** `RF-002` exige não revelar qual campo falhou;
e-mail inexistente e senha errada produzem a mesma resposta. Para não vazar pelo
tempo de resposta, o caminho "e-mail não existe" também executa uma comparação
de hash contra um valor fixo.

**Substituição da identidade provisória.** `IdentidadeDoCabecalho` (`HT-008`)
sai; entra `IdentidadeDoToken`, que valida o access token e devolve o
`TitularId`. **A guarda, o filtro e os testes negativos não mudam** — é a prova
de que a porta valeu a pena.

**Titular = conta.** O `titularId` de `lancamentos` passa a ser o id da conta.
Não há tabela de "usuário" separada: a conta é o titular.

## 2. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Sessão em cookie com estado no servidor | `ADR-004` decidiu JWT; a alternativa está registrada lá |
| Refresh como JWT | Revogação exigiria lista de bloqueio — mesma tabela, menos clareza |
| Guardar refresh em claro | Vazamento do banco viraria sessão válida |
| Mensagem específica ("e-mail não encontrado") | `RF-002` proíbe; enumera contas |
| argon2 | `ADR-004` permite os dois; bcrypt não precisa de binário nativo no runner do CI |
| Reaproveitar `titularId` como e-mail | E-mail muda; identificador não |

## 3. Fronteiras e design

```
backend/src/acesso/
  domain/model/conta.ts                  Conta: id, email, hashDaSenha
  domain/model/email.ts                  Email validado no domínio
  domain/port/entrada/{criar-conta,autenticar,encerrar-sessao}.ts
  domain/port/saida/{repositorio-de-contas,hash-de-senha,emissor-de-token,repositorio-de-sessoes,tokens}.ts
  application/{criar-conta,autenticar,encerrar-sessao,renovar-sessao}.ts
  infrastructure/http/acesso.controller.ts        POST /acesso/contas | /sessoes | DELETE /acesso/sessoes
  infrastructure/cripto/{hash-bcrypt,emissor-jwt}.ts
  infrastructure/persistence/{repositorio-de-contas-prisma,repositorio-de-sessoes-prisma}.ts
  acesso.module.ts
backend/src/lancamentos/infrastructure/http/identidade-do-token.ts   substitui a provisória
packages/contrato/src/acesso.ts          CriarContaDTO, CredenciaisDTO, SessaoDTO
```

O contrato **não** transporta senha de volta, nem hash, nem o refresh no corpo
quando houver cookie — nesta história o refresh volta no corpo, e a decisão de
armazenamento na web é registrada como dívida de `HT-018`.

## 4. Estratégia de testes

| Passo | O quê | Estado esperado |
| --- | --- | --- |
| 1 | Cenários dos 6 critérios, sobre stubs | Vermelho por asserção |
| 2 | Domínio, portas e adaptadores | Verde |
| 3 | Refatoração | Verde mantido |
| 4 | Trocar identidade provisória; `console.log` da web | Testes de `HT-008` seguem verdes |

| Cenário | Regra | Arquivo |
| --- | --- | --- |
| Cadastro cria conta; resposta sem senha | `RF-001` | `acesso.controller.test.ts` |
| E-mail duplicado recusado sem revelar | `RF-001` | idem |
| Senha correta entra e vê só o próprio dado | `RF-002`, `RN-015` | idem |
| Senha errada = e-mail inexistente (mesma resposta) | `RF-002` | idem |
| Encerrar sessão invalida o refresh e a rota privada | `RF-003` | idem |
| Senha e hash não aparecem em log nem em resposta | `RNF-015` | `acesso.controller.test.ts`, redator |
| Hash confere senha certa e recusa errada; hashes diferentes para a mesma senha | — | `hash-bcrypt.test.ts` |
| Token expirado não autentica | `ADR-004` | `emissor-jwt.test.ts` |

## 5. Gates

| Gate | Necessário? | Comando/Evidência |
| --- | --- | --- |
| QA | Sim | Vermelho registrado; bordas de duplicado, senha errada, sessão encerrada |
| Segurança | Sim | Senha em hash, refresh em hash, segredo em ambiente, mensagem uniforme |
| Open Finance | Sim | Titular passa a vir da sessão (seção 4 da skill) |
| SRE | Sim | Migração; `JWT_SECRET` obrigatório e documentado |
| Arquitetura | Sim | Contexto novo; senha em claro não entra no domínio |
| Revisão final | Sim | Obrigatório |

## 6. Riscos

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| bcrypt lento demais no teste | Alta | Cost baixo em teste, cost real em produção, ambos declarados |
| Testes de `HT-008` quebrarem com a identidade nova | Alta | Eles passam a usar token real; se quebrarem por outro motivo, é regressão |
| `JWT_SECRET` ausente derrubar o `setup` | Média | Falha alta e explícita, como a cifra de `HT-010` |
| Web sem onde guardar o token | Média | Fora de escopo aqui; registrado como dívida de `HT-018` |

## 7. Plano de reversão

`git revert`; `harness down` descarta as migrações com o volume. A identidade
provisória volta trocando o provider no módulo — a guarda e o filtro não mudam.

## 8. Fechamento

- Mensagem de commit prevista: `feat(acesso): add real sign-up, sign-in and sign-out (HN-001)`
- Tag prevista: `v0.13.0` — aguarda autorização humana
