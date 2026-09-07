---
name: entrega-hn-001
description: Documento de entrega do acesso — cadastro, autenticação com sessão e encerramento, com identidade por token substituindo o cabeçalho provisório e a senha fora do console do navegador.
document_type: delivery
story_key: HN-001
version: v0.13.0
max_lines: 300
---

# ENTREGA — `HN-001` — Acesso: cadastro, login e encerramento de sessão

- **Data:** 2026-09-07
- **Tipo:** Negócio (acesso)
- **Versão:** `v0.13.0`
- **Commit:** a preencher no fechamento
- **Tag:** `v0.13.0` — **pendente de autorização humana**

## O que foi entregue

A primeira história de negócio do produto. A tela de login deixou de fingir:
antes ela chamava `console.log('Login attempt:', data)` — despejando a senha no
console de quem testasse — e um `setTimeout` de 1,5 s exibia "Login realizado!".
Agora a pessoa cria conta de verdade, entra, vê **apenas os próprios**
lançamentos e sai.

Fecha também a lacuna que `HT-008` deixou aberta: lá a barreira por titular foi
construída e provada, mas quem dizia "sou este titular" era um cabeçalho
forjável. Aqui isso vira credencial assinada — **e a guarda, o filtro e os
testes negativos não mudaram**. Só a forma de dizer quem é quem. É a prova
prática de que a porta de `ADR-001` valeu o custo.

| Artefato | Papel |
| --- | --- |
| `backend/src/acesso/**` | Contexto novo: `Conta`, `Email`, portas de entrada e saída, quatro casos de uso |
| `HashBcrypt`, `EmissorJwt` | bcrypt e JWT atrás das portas de `ADR-004`; custo de teste e de execução declarados |
| `POST /acesso/contas`, `/sessoes`, `/sessoes/renovacao`, `DELETE /sessoes` | As quatro rotas, únicas públicas do sistema |
| `RepositorioDeContasPrisma`, `RepositorioDeSessoesPrisma` + migração | Persistência real; o refresh é guardado **em hash** |
| `IdentidadeDoToken` | Substitui `IdentidadeDoCabecalho`, que foi removida |
| `packages/contrato/src/acesso.ts` | DTOs que rejeitam senha e hash na saída |
| `frontend/src/dados/acesso.ts`, `Login.tsx`, `Register.tsx` | Telas ligadas à API; token em memória, nunca `localStorage` |

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-001` | Cadastro cria conta; duplicado recusado sem revelar | 2 cenários |
| `RF-002` | Sessão com access curto + refresh; recusa idêntica para senha errada e e-mail inexistente | 3 cenários |
| `RF-003` | Encerrar revoga o refresh; renovar depois disso é recusado | 1 cenário |
| `RN-015` | O titular passa a vir da sessão assinada | Testes de `HT-008`, agora com token real |
| `RNF-012` | `JWT_SECRET` do ambiente; sem ele a API recusa emitir | `SegredoDeTokenAusente` |
| `RNF-015` | Senha fora de log, resposta e console do navegador | Cenário dedicado; `console.log` removido |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Cadastro cria conta; resposta sem senha nem hash | Aprovado | Valida contra `ContaDTO`; texto não contém a senha nem `$2` |
| E-mail duplicado recusado sem revelar | Aprovado | Mensagem checada contra 5 formas de vazamento |
| Credencial correta abre sessão válida | Aprovado | JWT de 3 partes; refresh distinto; expiração no futuro |
| Senha errada = e-mail inexistente | Aprovado | Corpo das duas respostas comparado byte a byte |
| Encerrar sessão invalida o refresh | Aprovado | Renovação seguinte responde 401 |
| Senha nunca volta na resposta | Aprovado | Inclusive nos caminhos de falha |
| `console.log` de credenciais eliminado | Aprovado | Zero ocorrências em `pages/auth/` |

## Evidência de testes

Vermelho antes do código, por asserção, nos três comportamentos que faltavam:

```
      Tests  3 failed | 88 passed (91)
```

Gates finais:

```
✔ no dependency violations found (150 modules, 343 dependencies cruised)
      Tests  92 passed (92)
      Tests  4 passed (4)
seguranca: aprovada
harness: gates concluídos
```

Cobertura do domínio depois do teste de `Email`:

```
Lines        : 100% ( 25/25 )
```

| Camada | Comando | Resultado | Cobertura |
| --- | --- | --- | --- |
| Unitário | `harness test-unitario` | 96 passed (+16) | — |
| Integração | `harness test-integracao` | 4 passed | — |
| Funcional | `harness test-funcional` | 2 passed | — |
| Cobertura (domínio) | `harness coverage` | 100% (25/25), três contextos | — |
| Estático | `harness lint` | 150 módulos, 0 violações | — |

## Refatoração feita após os funcionais verdes

1. **O teste de acesso passou a usar adaptadores falsos.** Ao ligar os
   repositórios Prisma, o teste HTTP começou a falar com o PostgreSQL — e
   **falhou na segunda execução**, porque a conta do primeiro cadastro
   sobreviveu no banco. Agora ele sobrescreve os dois repositórios pelos em
   memória, pelos mesmos tokens. `test-unitario` volta a ser sem banco
   (`ADR-003`), e a idempotência foi verificada rodando duas vezes seguidas.
2. **`tests/setup.ts`**, para `JWT_SECRET` e `NODE_ENV` de teste em um lugar só,
   em vez de repetidos por arquivo.
3. **Teste de `Email`**, depois de a cobertura do domínio cair para 92%: acima
   do limiar, mas as linhas descobertas eram justamente as da normalização, que
   é o que faz o login funcionar independentemente da caixa digitada.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | 3 vermelhos por asserção; bordas de duplicado, senha errada, sessão encerrada, e-mail com caixa diferente |
| Segurança | `security-specialist-agent` | Aprovado | Senha em bcrypt; refresh aleatório guardado em hash; segredo do ambiente com recusa explícita; mensagem uniforme; comparação de hash mesmo sem conta, para igualar tempos |
| Open Finance | `open-finance-security-agent` | Aprovado | Seção 4: o titular passa a vir da sessão. A ressalva de `HT-008` está resolvida |
| SRE | `sre-agent` | Aprovado | Migração aplicada pelo `setup`; `JWT_SECRET` documentado no `.env.example` |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Contexto novo conforme `ADR-001`; senha em claro não entra no domínio; troca de identidade sem tocar guarda nem filtro |
| Revisão final | `final-reviewer-agent` | Aprovado | Escopo contido; MINOR |

## Decisões tomadas durante a execução

| Decisão | Motivo |
| --- | --- |
| Refresh opaco aleatório, não JWT | `ADR-004` pede revogação real; um JWT exigiria lista de bloqueio — a mesma tabela, sem o benefício |
| Hash do refresh em SHA-256, não bcrypt | bcrypt protege segredo de baixa entropia escolhido por gente; 256 bits aleatórios não têm o que adivinhar, e bcrypt só custaria latência por renovação |
| Comparação de hash mesmo sem conta | Sem ela, "e-mail inexistente" responderia mais rápido e o tempo enumeraria contas |
| E-mail inválido e duplicado dão a mesma recusa | Distinguir permitiria enumerar quem tem conta |
| Sair é idempotente e silencioso | Erro em refresh desconhecido distinguiria "existiu" de "nunca existiu" |
| Conta **é** o titular | Não há tabela de usuário separada; `titularId` é o id da conta |
| Token em memória na web | `ADR-004` r.2: `localStorage` é legível por qualquer script carregado na página |

## Dívida assumida

| Dívida | Motivo | História dona |
| --- | --- | --- |
| Recarregar a página encerra a sessão na web | Token só em memória; cookie seguro e renovação silenciosa exigem decisão de front | `HT-018` |
| Rotas privadas da web ainda não usam o token | Os componentes seguem lendo mocks; trocar imports é a fronteira de `HT-018` | `HT-018` |
| Sem recuperação de senha nem verificação de e-mail | Não há `RF` aprovado | product-manager |
| Repositórios do acesso sem teste de integração | Cobertos por adaptador falso; o par Prisma ainda não tem ida e volta no banco | próxima `HT` de qualidade |
| `console.log` de bootstrap em `main.ts` | Vira log estruturado com o redator de `HT-008` | `HT-012` |

## Verificação de fechamento

- [ ] `scripts/verificar-fechamento.sh v0.13.0` verde
- [ ] Tag `v0.13.0` — **aguarda autorização**
- [ ] Evidência presente em `docs/tasks/HN-001/evidencia/`
