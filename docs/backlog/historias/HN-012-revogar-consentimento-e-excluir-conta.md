---
name: hn-012-revogar-consentimento-e-excluir-conta
description: História de negócio — revogar consentimento (saída imediata do painel e exclusão agendada em até 24h) e excluir a conta com todos os dados associados.
document_type: story
story_key: HN-012
story_type: negocio
epic: EPIC-NEG-001
status: Ready
max_lines: 300
---

# `HN-012` — Revogar consentimento e excluir conta e dados

- **Tipo:** História de negócio
- **Épico:** `EPIC-NEG-001`
- **Estado:** **Ready — próxima demanda**
- **Requisitos:** `RF-006`, `RF-025` · `RN-013`, `RN-016`, `RN-015`
- **Depende de:** `HN-002` (consentimento), `HN-001` (sessão)
- **Versão prevista:** `v0.18.0`

## Narrativa

> Como **Marina**, pessoa que quer manter o controle dos próprios dados,
> quero **revogar o acesso de uma instituição ou excluir minha conta**
> para **saber que meus dados continuam sendo meus**.

## Contexto

`HN-002` criou o consentimento de primeira classe. Agora a pessoa precisa da
**válvula de segurança**: revogar o acesso de uma instituição (os dados saem do
painel imediatamente e a exclusão definitiva é agendada) e, no limite, excluir a
conta com todo o dado pessoal e financeiro. Decisão de produto registrada na
`SDD-001` §7: **prazo de exclusão definitiva após revogação = até 24h**.

## Critérios de aceite

```gherkin
Cenário: revogar consentimento tira a instituição do painel imediatamente
  Dado um consentimento ativo
  Quando o titular revoga o consentimento
  Então o consentimento fica revogado na hora (RN-013)
  E a instituição não aparece mais na lista de conectadas
  E a exclusão definitiva dos dados fica agendada para até 24h
```

```gherkin
Cenário: só o próprio titular revoga o próprio consentimento
  Dado um consentimento de outra pessoa
  Quando alguém tenta revogá-lo
  Então retorna negação, nunca confirma a operação (RN-015)
```

```gherkin
Cenário: excluir a conta apaga todo dado pessoal e financeiro
  Dado uma pessoa com conta, sessões, consentimentos e transações
  Quando ela exclui a própria conta
  Então a conta, as sessões, os consentimentos e as transações são apagados (RN-016)
  E nenhum dado dela é recuperável pela aplicação (RF-025)
  E o refresh token deixa de funcionar
```

```gherkin
Cenário: excluir conta de outro titular é negado
  Dado a conta de outra pessoa
  Quando alguém tenta excluí-la
  Então retorna negação (RN-015)
```

## Regras de negócio aplicadas

| RN | Como esta história a respeita |
| --- | --- |
| `RN-013` | Revogar tira do painel imediatamente e agenda exclusão definitiva (≤ 24h) |
| `RN-016` | Excluir conta apaga/anonimiza todo dado pessoal e financeiro |
| `RN-015` | Toda operação é do próprio titular; recurso alheio → negação |

## RNF atendidos

| RNF | Alvo | Como esta história prova |
| --- | --- | --- |
| `RNF-014` | Cifra em repouso | Credencial cifrada é apagada junto com o consentimento |
| `RNF-013` | Autorização no servidor | Guarda de titular + teste negativo por rota |

## Impacto arquitetural

| Área | Muda? | Observação |
| --- | --- | --- |
| Contexto `consent` | Estende | `deletionScheduledAt`, revogação com agendamento, purge |
| Contexto `access` | Estende | `DeleteAccount` apaga conta + sessões + consents + transações |
| Contexto `transactions` | Estende | Método de exclusão por holder (se necessário) |
| Persistência | Migração | Coluna de agendamento da exclusão |

## Riscos e plano de reversão

| Risco | Mitigação | Como reverter |
| --- | --- | --- |
| Exclusão apagar dado que seria necessário | Prazo de 24h permite auditoria | Recuperar do backup antes do purge |
| Revogar sem querer | Confirmação/evidência da revogação | Registrar motivo; reautenticar para reconectar |

## Fora de escopo

- Painel consolidado e integração da UI real (é `HN-003`)
- Job periódico de purge em background (operacional — `HT-012`)
- Exportação de dados antes da exclusão (fora do escopo da PoC)

## Gates aplicáveis

| Gate | Necessário? | Motivo |
| --- | --- | --- |
| QA | Sim | Cenários BDD + RN provadas |
| Segurança | Sim | Skill `open-finance-security-agent`: revogação, exclusão, isolamento |
| SRE | Sim | Exclusão agendada e purge |
| Arquitetura | Sim | Exclusão cruza contextos (access + consent + transactions) |
| Revisão final | Sim | Obrigatório |

## Definição de pronto

- [ ] Cenários funcionais/BDD escritos antes do código e agora verdes
- [ ] Teste negativo por rota (RN-015)
- [ ] Gates marcados acima executados com evidência
- [ ] `docs/entregas/ENTREGA-HN-012-revogar-consentimento-e-excluir-conta.md` criado
- [ ] `KANBAN-OFICIAL.md` atualizado
- [ ] Commit semântico citando `HN-012` e tag `v0.18.0` no mesmo hash