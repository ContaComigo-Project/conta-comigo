---
name: hn-001-acesso
description: Acesso ao ContaComigo — criar conta, autenticar com sessão e encerrar sessão, substituindo a simulação da tela por autenticação real.
document_type: story
story_key: HN-001
story_type: negocio
epic: EPIC-NEG-001
status: Em revisão
max_lines: 300
---

# `HN-001` — Acesso: cadastro, login e encerramento de sessão

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** Em revisão (ordem 13)
- **Decisão que a rege:** [`ADR-004`](../../adr/ADR-004-autenticacao-jwt-proprio.md)
- **Requisitos:** `RF-001`, `RF-002`, `RF-003`; `RN-015`
- **Depende de:** `HT-010` — `v0.10.0`; `HT-017` — `v0.11.0`; `HT-008` — `v0.12.0`
- **Versão prevista:** `v0.13.0`

## Narrativa

> Como **pessoa que quer organizar as próprias finanças**
> quero **criar uma conta, entrar e sair**
> para que **meus dados financeiros sejam meus e de mais ninguém**.

## Contexto

Hoje a tela de login **finge**: `Login.tsx` chama `console.log('Login attempt:',
data)` — que despeja a senha no console do navegador — e um `setTimeout` de
1,5 s exibe "Login realizado!". Ninguém entra em lugar nenhum, e a senha de quem
testar o protótipo fica registrada.

As telas de cadastro e login já existem e serão preservadas; o que muda é o que
acontece quando a pessoa aperta o botão.

Esta é também a história que fecha a lacuna deixada por `HT-008`: lá a barreira
por titular foi construída e provada, mas quem diz "sou este titular" é um
cabeçalho forjável. Aqui esse cabeçalho é substituído por credencial de verdade.

## Critérios de aceite

Cada critério vira um cenário funcional/BDD antes de existir código produtivo.

```gherkin
Cenário: criar conta com e-mail e senha (RF-001)
  Dado que nenhuma conta existe para "pessoa@exemplo.com"
  Quando alguém se cadastra com esse e-mail e uma senha válida
  Então a conta é criada
  E a resposta não contém a senha nem o hash dela
```

```gherkin
Cenário: e-mail duplicado é recusado (RF-001)
  Dado que já existe conta para "pessoa@exemplo.com"
  Quando alguém tenta se cadastrar com o mesmo e-mail
  Então o cadastro é recusado
  E a recusa não revela se o e-mail já estava cadastrado
```

```gherkin
Cenário: credencial correta entra (RF-002)
  Dado uma conta cadastrada
  Quando a pessoa entra com o e-mail e a senha corretos
  Então ela recebe uma sessão válida
  E passa a enxergar apenas os próprios lançamentos
```

```gherkin
Cenário: credencial incorreta não revela qual campo falhou (RF-002)
  Dado uma conta cadastrada
  Quando a pessoa erra a senha
  Então o acesso é recusado
  E a mensagem é a mesma de quando o e-mail não existe
```

```gherkin
Cenário: encerrar sessão corta o acesso (RF-003)
  Dado uma pessoa autenticada
  Quando ela encerra a sessão
  Então a credencial de renovação deixa de funcionar
  E a rota privada para de responder com dado
```

```gherkin
Cenário: a senha nunca aparece em log nem em resposta
  Dado qualquer tentativa de cadastro ou de entrada
  Quando ela é processada, com sucesso ou com falha
  Então nem a senha nem o hash aparecem em log, resposta ou mensagem de erro
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-015` | A sessão passa a ser a fonte do titular; a barreira de `HT-008` deixa de depender de cabeçalho forjável |
| `RNF-013` | Cada rota privada continua com os três testes negativos, agora com credencial real |
| `RNF-012` | Segredo do JWT em variável de ambiente; `.env.example` documenta, `gitleaks` guarda |
| `RNF-015` | Senha e token não sobrevivem ao redator de log de `HT-008` |

## Fora de escopo

- Recuperação de senha e verificação de e-mail (não há `RF` aprovado)
- Cadastro social ou provedor externo (`ADR-004` decidiu autenticação própria)
- Exclusão de conta (`HN-012`, `RN-016`)
- Consentimento e conexão com instituição (`HN-002`)
- Perfil, foto e preferências

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Cenários de borda: duplicado, senha errada, sessão encerrada |
| Segurança | Sim | Senha, token, sessão e mensagem que não vaza qual campo falhou |
| Open Finance | Sim | A sessão passa a ser a origem do titular (seção 4 da skill) |
| SRE | Sim | Migração nova; `JWT_SECRET` obrigatório no ambiente |
| Arquitetura | Sim | Contexto `acesso` novo; porta `Autenticacao` (`ADR-004`) |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [x] Cenários funcionais/BDD escritos antes do código e agora verdes
- [x] Refatoração feita após os funcionais verdes
- [x] Testes unitários e de borda
- [x] Gates marcados acima executados com evidência
- [x] `console.log` de credenciais eliminado de `Login.tsx` e `Register.tsx`
- [x] `docs/entregas/` criado
- [x] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-001` e tag no mesmo hash — commit feito; **tag aguarda autorização humana**
