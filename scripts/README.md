---
name: harness-local
description: Harness local — comandos reprodutíveis do projeto, independentes de stack, com o mesmo comportamento local e em CI.
document_type: operational_doc
applies_when:
  - preparar ambiente, rodar testes ou executar gates
  - fechar uma entrega e validar commit e tag
max_lines: 300
---

# Harness Local

Um comando por tarefa. O mesmo comando roda na máquina de quem desenvolve e no
CI — se divergirem, o CI deixa de ser prova.

| Script | Para quê |
| --- | --- |
| `harness.sh` / `harness.ps1` | Executa as tarefas do projeto (setup, lint, testes, gates) |
| `harness.env.example` | Registro dos comandos reais; copie para `harness.env` |
| `nova-historia.sh` / `.ps1` | Cria `docs/tasks/[CHAVE]/` a partir do template |
| `verificar-fechamento.sh` | Valida commit semântico, chave da história, entrega e tag no mesmo hash |

## Uso

```bash
# Linux/macOS/Git Bash
cp scripts/harness.env.example scripts/harness.env
scripts/harness.sh setup
scripts/harness.sh test-funcional
scripts/harness.sh gates
```

```powershell
# Windows PowerShell
Copy-Item scripts/harness.env.example scripts/harness.env
powershell -File scripts/harness.ps1 setup
powershell -File scripts/harness.ps1 gates
```

## Estado atual

`harness.env` ainda não existe e os comandos não estão definidos: a stack será
decidida em `HT-004` e os comandos preenchidos em `HT-005`.

Até lá o harness **falha explicitamente** com "comando não configurado". Isso é
intencional: um harness que finge sucesso é pior que um harness ausente.

`harness.env` é versionado: ele é o registro de comandos do projeto, igual para
todo mundo, e não contém segredo. Credenciais continuam fora do repositório, em
variáveis de ambiente ou cofre.

## Docker

Quando a stack for escolhida, dependências de ambiente (banco, fila, serviços
externos) sobem por Docker com versões fixadas, e `HARNESS_SETUP` passa a ser o
comando que as levanta. O critério para usar Docker é um só: **o ambiente
precisa ser idêntico em qualquer máquina**. Onde isso já é verdade sem
contêiner, Docker é custo sem retorno.

## Fechamento de entrega

```bash
scripts/verificar-fechamento.sh v0.2.0
```

Verifica que a tag existe, aponta para o commit de fechamento, que a mensagem é
semântica e cita a chave da história, e que existe documento em `docs/entregas/`.

## Regras dos scripts

- Falham alto: erro não silenciado, código de saída diferente de zero.
- Não escondem passo manual: o que não está no script, está no `README`.
- Não dependem de estado da máquina de quem escreveu.
