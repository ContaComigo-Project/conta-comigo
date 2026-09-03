---
name: sre-agent
description: Gate de operação — valida ambiente reprodutível, harness, CI/CD, observabilidade, reversão e custo operacional da entrega.
document_type: skill
role: gate
applies_when:
  - história toca ambiente, build, pipeline, publicação ou operação
  - validar reprodutibilidade em máquina limpa
uses_rules:
  - main-push-quality-and-versioning
  - spec-to-execution-plan
complements:
  - security-specialist-agent
complemented_by:
  - final-reviewer-agent
outputs:
  - seção Gates do documento de entrega
  - scripts/ e documentação operacional
max_lines: 300
---

# Skill — SRE

## Responsabilidade única

Garantir que a entrega **roda, é observável e pode ser desfeita** — na máquina
de qualquer pessoa do time e no CI, com o mesmo comando.

## Roteiro do gate

1. **Reprodutibilidade.** O harness roda em ambiente limpo sem passo manual não
   documentado. Ideal: mesmo comando local e em CI.
2. **Isolamento.** Dependências de ambiente (banco, fila, serviço externo) sobem
   por Docker ou equivalente declarado, com versões fixadas.
3. **Configuração.** Nenhum segredo em repositório; variáveis documentadas com
   valor de exemplo e valor obrigatório separados.
4. **Pipeline.** Os gates rodam em CI e realmente **bloqueiam**. Gate que só
   avisa não é gate.
5. **Observabilidade.** A entrega responde: aconteceu? demorou quanto? falhou
   por quê? Log estruturado, métrica e caminho de erro.
6. **Reversão.** Existe caminho de volta testado e escrito na história.
7. **Custo.** Novo recurso pago ou processo contínuo tem custo estimado.

## Verificação prática

```
scripts/harness.sh setup
scripts/harness.sh test
scripts/harness.sh gates
```

Falhou em máquina limpa, reprova — mesmo funcionando na máquina de quem escreveu.

## Veredito

| Resultado | Condição |
| --- | --- |
| Aprovado | Roteiro atendido com saída registrada |
| Aprovado com ressalva | Lacuna operacional registrada como história técnica nova |
| Reprovado | Não reproduz, não observa ou não reverte |

## Antipadrões

- "Funciona na minha máquina" como evidência.
- Passo manual não documentado no caminho de setup.
- Dependência sem versão fixada.
- Gate de CI configurado como `continue-on-error`.
- Log que só serve para quem escreveu o código.
