---
name: entregas-indice
description: Registro cronológico de todas as entregas concluídas, com evidência, versão e hash de fechamento.
document_type: index
applies_when:
  - fechar uma história
  - auditar o que já foi entregue e com qual evidência
max_lines: 300
---

# Entregas

Toda história que chega em `Done` deixa um documento aqui. Sem documento de
entrega, não existe `Done`.

Arquivo: `ENTREGA-[CHAVE]-titulo-em-kebab-case.md`, a partir de
[`_TEMPLATE-ENTREGA.md`](./_TEMPLATE-ENTREGA.md).

## Linha do tempo

| Data | Chave | Título | Versão | Commit | Tag |
| --- | --- | --- | --- | --- | --- |
| 2026-09-01 | [`HT-000`](./ENTREGA-HT-000-fundacao-workflow-agentico.md) | Fundação do workflow agêntico | `v0.1.0` | `1a2f863` | `v0.1.0` |
| 2026-09-02 | [`HT-001`](./ENTREGA-HT-001-sdd-inicial.md) | SDD-001 e entendimento inicial | `v0.2.0` | `fe1f89b` | `v0.2.0` |
| 2026-09-02 | [`HT-002`](./ENTREGA-HT-002-catalogo-rf-rn.md) | Catálogo RF/RN e épico de negócio | `v0.3.0` | `96ec972` | `v0.3.0` |
| 2026-09-02 | [`HT-003`](./ENTREGA-HT-003-catalogo-rnf.md) | Catálogo RNF e épico técnico | `v0.4.0` | `f9ed24f` | `v0.4.0` |
| 2026-09-02 | `HT-002` `HT-003` | Correção: backlog incorpora o frontend existente | `v0.4.1` | `9c063f7` | `v0.4.1` |
| 2026-09-05 | [`HT-004`](./ENTREGA-HT-004-decisoes-de-stack.md) | Decisões de stack registradas como ADR-002..005 | `v0.5.0` | `a1fa811` | `v0.5.0` |
| 2026-09-05 | [`HT-016`](./ENTREGA-HT-016-inventario-frontend.md) | Inventário do frontend e destino dos mocks | `v0.6.0` | `5ebeb8a` | `v0.6.0` |
| 2026-09-05 | `HT-016` | Correção: telas do dashboard mantidas com "Em construção" | `v0.6.1` | `c3bfb55` | `v0.6.1` |
| 2026-09-07 | [`HT-005`](./ENTREGA-HT-005-harness-local.md) | Harness local reprodutível com docker compose | `v0.7.0` | `3f57b53` | `v0.7.0` |
| 2026-09-07 | [`HT-006`](./ENTREGA-HT-006-infraestrutura-de-testes.md) | Infraestrutura de testes e prova do gate de fronteiras | `v0.8.0` | `7e17dea` | `v0.8.0` |
| 2026-09-07 | [`HT-009`](./ENTREGA-HT-009-esqueleto-backend-hexagonal.md) | Esqueleto hexagonal do backend, contexto `lancamentos` | `v0.9.0` | `b7f2945` | `v0.9.0` |
| 2026-09-07 | [`HT-010`](./ENTREGA-HT-010-persistencia-postgresql.md) | Persistência PostgreSQL com Prisma e cifra em repouso | `v0.10.0` | `a419cf4` | `v0.10.0` |
| 2026-09-07 | [`HT-017`](./ENTREGA-HT-017-contrato-de-dados.md) | Contrato de dados web↔API, origem falsa e RN-001 no domínio | `v0.11.0` | `1e011e4` | `v0.11.0` |
| 2026-09-07 | [`HT-008`](./ENTREGA-HT-008-baseline-de-seguranca.md) | Baseline de segurança e skill de Open Finance | `v0.12.0` | a preencher | pendente |
| 2026-09-07 | [`HN-001`](./ENTREGA-HN-001-acesso.md) | Acesso: cadastro, login e encerramento de sessão | `v0.13.0` | a preencher | pendente |
| 2026-09-07 | [`HT-011`](./ENTREGA-HT-011-adaptador-pluggy.md) | Porta de agregação com adaptador Pluggy e política de resiliência | `v0.14.0` | a preencher | pendente |

Toda linha acima foi verificada por `scripts/verificar-fechamento.sh`: a tag
aponta para o mesmo hash do commit de fechamento, e a mensagem cita a chave.

Exceção única: em `HT-000` o commit da estrutura (`5e38950`) é diferente do
commit de fechamento, porque a estrutura foi versionada antes de a rule de
commit existir. O motivo está registrado na entrega.
