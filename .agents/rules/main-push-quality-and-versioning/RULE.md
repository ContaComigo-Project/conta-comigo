---
name: main-push-quality-and-versioning
description: Bloqueia push na main sem testes e gates verdes, commit semântico com a chave da história e tag semântica no mesmo hash.
document_type: rule
severity: bloqueante
applies_when:
  - fechar uma história
  - criar commit de entrega, tag ou push para main
complements:
  - test-evidence-quality
  - spec-to-execution-plan
complemented_by:
  - refactor-after-functional-green
max_lines: 300
---

# Regra — Qualidade e Versionamento no Push para Main

## Intenção

`main` é a linha do tempo confiável do projeto. Cada ponto dela precisa ser
explicável: qual história entregou, com qual evidência, em qual versão.

## Obrigações

1. **Testes verdes.** Nenhum push para `main` com teste falhando, ignorado sem
   justificativa registrada, ou suíte não executada.
2. **Gates aplicáveis executados.** Os gates marcados na história (QA, SRE,
   Segurança, Arquitetura, Revisão final) rodaram e estão registrados na entrega.
3. **Commit semântico com a chave.** Formato:
   `tipo(escopo): descrição no imperativo (CHAVE)`
   Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
   Exemplo: `feat(orcamento): registrar limite mensal por categoria (HN-004)`
4. **Commit isolado.** O commit de entrega contém apenas arquivos daquela
   história. Arquivo de outra história = novo commit, outra entrega.
5. **Tag semântica no mesmo hash.** `vMAJOR.MINOR.PATCH` apontando exatamente
   para o commit de fechamento.
6. **Documento de entrega existe** em `docs/entregas/` antes da tag.
7. **Kanban atualizado** com a história em `Done` e o histórico preenchido.

## Escolha da versão

| Mudança | Incremento |
| --- | --- |
| Quebra contrato percebido por consumidor | `MAJOR` |
| Capacidade nova compatível | `MINOR` |
| Correção ou ajuste interno sem mudar contrato | `PATCH` |

## Verificação

```
scripts/verificar-fechamento.sh vX.Y.Z
```

O script falha se a tag não existir, se ela apontar para hash diferente do
commit de fechamento, ou se a mensagem do commit não citar uma chave
`HN-`/`HT-`.

## Violações comuns

| Sintoma | Por que é violação |
| --- | --- |
| Tag criada depois de mais um commit | A tag deixa de identificar a entrega |
| `chore: ajustes` | Não diz o que entregou nem qual história |
| Commit com correção "aproveitando a viagem" | Mistura escopos e impede reversão limpa |
| Teste desabilitado para destravar o push | Troca qualidade por velocidade sem decisão registrada |
