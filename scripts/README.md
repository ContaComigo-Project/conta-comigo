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
| `auditar-repositorio.sh` / `.ps1` | Auditoria de integridade do repositório (limites de linha, estrutura e links) |
| `harness.sh` / `harness.ps1` | Executa as tarefas do projeto (setup, lint, testes, gates) |
| `harness.env.example` | Registro dos comandos reais; copie para `harness.env` |
| `instalar-hooks.sh` / `.ps1` | Configura o Git para acionar `.githooks/pre-commit` automaticamente |
| `nova-historia.sh` / `.ps1` | Cria `docs/tasks/[CHAVE]/` a partir do template |
| `registrar-evidencia.sh` / `.ps1` | Executa uma tarefa do harness e grava a saída real como evidência da história |
| `validar-staging.sh` / `.ps1` | Valida arquivos staged antes do commit (segredos, limites, resíduos de debug) |
| `db:seed` (backend) | Popula o banco com dados demo: conta `demo@contacomigo.app` / `demo123`, consentimento ativo, contas e lançamentos sintéticos |
| `verificar-fechamento.sh` / `.ps1` | Valida commit semântico, chave da história, entrega e tag no mesmo hash |

## Uso

```bash
# Linux/macOS/Git Bash
cp scripts/harness.env.example scripts/harness.env
scripts/harness.sh setup
scripts/harness.sh test-funcional
scripts/harness.sh gates
```

## Evidência de execução

A rule `test-evidence-quality` exige que a saída no documento de entrega seja a
saída real do comando, copiada, e a rule `tdd-bdd-before-implementation` exige
que o vermelho seja registrado antes do código. `registrar-evidencia` existe
para que isso não dependa de memória nem de boa-fé:

```bash
# passo do vermelho obrigatório — falhar aqui é o resultado esperado
scripts/registrar-evidencia.sh HT-006 AGIR test-funcional "cenário da RN-001" --esperar-falha --rotulo vermelho

# depois do código mínimo
scripts/registrar-evidencia.sh HT-006 AGIR test-funcional "RN-001 verde" --rotulo verde
```

Ele executa a tarefa pelo harness, grava a saída crua em
`docs/tasks/[CHAVE]/evidencia/` com commit, data e `EXIT_CODE`, e acrescenta uma
linha ao `progress.txt` apontando para o arquivo. Não existe parâmetro que
aceite texto de saída: a única fonte é a execução.

`--esperar-falha` inverte o veredito — se o comando passar quando deveria
falhar, o script sai com erro. É o que impede pular o vermelho.

`verificar-fechamento` cruza os blocos de saída do documento de entrega com os
arquivos de evidência e reprova o fechamento se algum trecho não existir em
disco.

```powershell
# Windows PowerShell
Copy-Item scripts/harness.env.example scripts/harness.env
powershell -File scripts/harness.ps1 setup
powershell -File scripts/harness.ps1 gates
```

## Estado atual

`scripts/harness.env` registra todos os comandos do projeto e `gates` fecha
verde de ponta a ponta desde `HT-006`: `lint` (ESLint + dependency-cruiser),
`test-unitario` (Vitest), `test-funcional` (Playwright em Chromium), `coverage`
(alvo `backend/src/**/domain/`, limiar 80%) e `security` (gitleaks + osv-scanner).

Variável vazia continua sendo uma declaração: o harness **falha explicitamente**
com "comando não configurado" e código 3 em vez de fingir sucesso.

Desde `HT-010` existe também `test-integracao` (Vitest com config própria), que
fala com o PostgreSQL do compose; `test` roda unitário → integração → funcional.
`setup` aplica as migrações do Prisma (`prisma generate` + `migrate deploy`);
o esquema só evolui por migração commitada em `backend/prisma/migrations/`,
nunca por `db push`. `ENCRYPTION_KEY` (32 bytes em hex) é exigida pelo utilitário
de cifra em repouso — sem ela o código recusa operar, por desenho.

### Restrição ao editar `harness.env`

O mesmo valor é executado por dois interpretadores — `harness.sh` faz `eval` em
bash e `harness.ps1` chama `cmd.exe /c`. Por isso **todo valor é
`pnpm run <script>`** e nada mais: passos múltiplos, condicionais e detecção de
sistema vivem em `package.json` e em `scripts/*.mjs`, que são idênticos nos dois
sistemas por construção.

Os dois harness retornam os **mesmos códigos de saída**: `2` para `harness.env`
ausente, `3` para comando não configurado, e o código real da ferramenta quando
ela falha.

`harness.env` é versionado: ele é o registro de comandos do projeto, igual para
todo mundo, e não contém segredo. Credenciais continuam fora do repositório, em
variáveis de ambiente ou cofre.

## Docker

Quando a stack for escolhida, dependências de ambiente (banco, fila, serviços
externos) sobem por Docker com versões fixadas, e `HARNESS_SETUP` passa a ser o
comando que as levanta. O critério para usar Docker é um só: **o ambiente
precisa ser idêntico em qualquer máquina**. Onde isso já é verdade sem
contêiner, Docker é custo sem retorno.

## Validação de staging e fechamento de entrega

```bash
# Validar arquivos preparados no staging antes do commit
scripts/validar-staging.sh             # Windows: powershell -File scripts/validar-staging.ps1

# Validar fechamento da entrega após commit e tag
scripts/verificar-fechamento.sh v0.2.0 # Windows: powershell -File scripts/verificar-fechamento.ps1 v0.2.0
```

Verifica que a tag existe, aponta para o commit de fechamento, que a mensagem é
semântica e cita a chave da história, e que existe documento em `docs/entregas/`.

## Regras dos scripts

- Falham alto: erro não silenciado, código de saída diferente de zero.
- Não escondem passo manual: o que não está no script, está no `README`.
- Não dependem de estado da máquina de quem escreveu.
