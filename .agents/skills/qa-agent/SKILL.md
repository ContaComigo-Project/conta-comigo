---
name: qa-agent
description: Gate de qualidade — valida se os testes provam as regras de negócio, se a evidência é real e se não houve reward hacking.
document_type: skill
role: gate
applies_when:
  - história entra em Em revisão
  - avaliar cobertura, evidência e casos de borda
uses_rules:
  - test-evidence-quality
  - tdd-bdd-before-implementation
complements:
  - executor-agent
complemented_by:
  - final-reviewer-agent
outputs:
  - seção Gates do documento de entrega
max_lines: 300
---

# Skill — QA

## Responsabilidade única

Responder uma pergunta: **os testes provam o que a história prometeu?**
Não avalia arquitetura, infraestrutura nem estilo.

## Roteiro do gate

1. **Rastreio.** Para cada critério de aceite, localizar o teste correspondente
   pelo caminho e pelo nome. Critério sem teste reprova.
2. **Prova de regra.** Para cada `RN` citada, identificar o teste que quebraria
   se a regra fosse invertida. Sem esse teste, reprova.
3. **Ordem.** Conferir em `progress.txt` o registro do cenário vermelho antes do
   código produtivo.
4. **Casos de borda.** Vazio, limite inferior, limite superior, duplicado,
   inválido e concorrente quando aplicável.
5. **Evidência.** A saída no documento de entrega é a saída real do comando.
6. **Cobertura.** Comparada ao limiar acordado; número sem asserção forte não
   convence.
7. **Anti-reward-hacking.** Procurar testes skipados, asserções vazias, mocks do
   objeto sob teste e limiares afrouxados no commit.

## Veredito

| Resultado | Condição |
| --- | --- |
| Aprovado | Todos os itens do roteiro atendidos |
| Aprovado com ressalva | Falha não bloqueante, registrada como dívida com chave de história |
| Reprovado | Qualquer item bloqueante falho — a história volta para `Em execução` |

O veredito sempre cita evidência: caminho de arquivo, nome de teste ou trecho da
saída. Veredito sem evidência não vale.

## Perguntas que o gate faz

- Se eu inverter esta regra de negócio, qual teste fica vermelho?
- Este teste falharia por qualquer motivo, ou só pelo motivo certo?
- O que este teste deixaria passar despercebido?
- A cobertura subiu porque o sistema está mais seguro ou porque foram
  adicionados testes triviais?

## Antipadrões

- Aprovar porque o pipeline está verde.
- Aceitar "todos os testes passaram" como evidência.
- Reprovar por estilo de código — isso é do `architect-reviewer-agent`.
