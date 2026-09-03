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
| 2026-09-01 | [`HT-000`](./ENTREGA-HT-000-fundacao-workflow-agentico.md) | Fundação do workflow agêntico | `v0.1.0` | _(pendente)_ | _(pendente)_ |
| 2026-09-02 | [`HT-001`](./ENTREGA-HT-001-sdd-inicial.md) | SDD-001 e entendimento inicial | `v0.2.0` | _(pendente)_ | _(pendente)_ |
| 2026-09-02 | [`HT-002`](./ENTREGA-HT-002-catalogo-rf-rn.md) | Catálogo RF/RN e épico de negócio | `v0.3.0` | _(pendente)_ | _(pendente)_ |
| 2026-09-02 | [`HT-003`](./ENTREGA-HT-003-catalogo-rnf.md) | Catálogo RNF e épico técnico | `v0.4.0` | _(pendente)_ | _(pendente)_ |

Quatro entregas estão em `Em revisão` aguardando um único ato de fechamento:
commit semântico por história e tag apontando para o mesmo hash.
