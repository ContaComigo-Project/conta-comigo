---
name: commit-crafter-agent
description: Especialista em preparação, staging seletivo e redação de commits semânticos atômicos estritamente em inglês (Conventional Commits + rodapé Generated-by-AI).
document_type: skill
role: execução
applies_when:
  - após revisão de diff aprovada
  - preparar commits atômicos de código, documentação, refatoração ou correção
  - compor e validar mensagens de commit segundo commit-conventions
uses_rules:
  - main-push-quality-and-versioning
  - clean-code-readable-names
complements:
  - commit-conventions
  - code-reviewer-agent
  - git-operator
complemented_by:
  - final-reviewer-agent
outputs:
  - staging seletivo no git
  - mensagem de commit padronizada em inglês
  - commit git executado localmente
max_lines: 300
---

# Skill — Preparador e Executor de Commits (Commit Crafter)

## Responsabilidade única

Orquestrar o staging seletivo de arquivos e a criação de commits semânticos atômicos com mensagens estritamente em inglês, em total conformidade com o padrão Conventional Commits e rastreabilidade auditável de autoria/IA.

Esta skill não decide o fechamento oficial de histórias no kanban nem emite tags de release sem aprovação final (responsabilidade do `final-reviewer-agent` e `git-operator`).

---

## Regras Inegociáveis de Commit

1. **Mensagem estritamente em INGLÊS:** Tipo, escopo, descrição imperativa, corpo e chaves de rodapé devem ser 100% em inglês. Apenas chaves de história (`HT-XXX`/`HN-XXX`), caminhos de arquivo já em português e nomes de autores permanecem inalterados.
2. **Staging seletivo obrigatório:** `git add -A` e `git commit -am` são **terminantemente proibidos**. Cada arquivo ou pasta deve ser adicionado individual e conscientemente.
3. **Rodapé `Generated-by-AI` obrigatório:** Sempre que houver intervenção ou assistência de IA (geração, refatoração, revisão ou validação), incluir obrigatoriamente:
   ```gitcommit
   Generated-by-AI: <nome-exato-do-modelo>
   ```
4. **Amend proibido em commit publicado:** Nunca usar `git commit --amend` em commits que já foram enviados (`push`) ao branch remoto.
5. **Confirmação antes de comitar:** A mensagem de commit e o staging devem ser validados e apresentados com clareza antes da execução do commit.

---

## Procedimento de Execução

### Passo 1: Inspecionar o status do repositório
Antes de qualquer comando de staging:
```bash
git status --short
```
Identificar os arquivos modificados e agrupar apenas as mudanças que representem uma unidade lógica e atômica.

### Passo 2: Executar staging seletivo
Adicionar explicitamente os arquivos alvo daquela mudança específica:
```bash
git add caminho/do/arquivo1
git add caminho/do/arquivo2
```
Confirmar imediatamente o que está preparado (`staged`):
```bash
git diff --cached --stat
```
Se algum arquivo alheio foi incluído por engano, remover do staging com `git restore --staged <arquivo>`.

### Passo 3: Compor a mensagem de commit
Estruturar a mensagem seguindo o padrão aceito pelo repositório:

```gitcommit
<type>(<scope>): <imperative description in english> (<KEY>)

<Body explaining what changed and why, written in English.
Keep paragraphs concise and focused on rationale.>

Refs: <path/to/doc/or/issue>
Generated-by-AI: <Exact-Model-Name>
```

**Tipos válidos:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `ci`.

**Exemplos aceitos:**
```gitcommit
docs(agents): add code review and commit crafter skills

Introduce code-reviewer-agent and commit-crafter-agent skills under
.agents/skills to standardize diff inspection, selective staging,
and conventional commit message composition.

Generated-by-AI: Gemini-3.8-Flash
```

```gitcommit
feat(auth): add password hashing with argon2 (HT-007)

Implements Argon2id password hashing adapter conforming to the
Domain PasswordHasher port, ensuring secure credential storage.

Refs: docs/tasks/HT-007/TASK.md
Generated-by-AI: Gemini-3.8-Flash
```

### Passo 4: Executar o commit
Submeter a mensagem ao git via linha de comando ou arquivo temporário:
```bash
git commit -m "<subject>" -m "<body>" -m "<footers>"
```

### Passo 5: Verificar o resultado
Confirmar que o commit foi registrado no histórico local:
```bash
git log -n 1 --stat
```

---

## Antipadrões que Bloqueiam a Execução

1. **Staging indiscriminado:** Executar `git add .` ou `git add -A`.
2. **Mensagens em português:** Qualquer palavra em português no assunto, corpo ou cabeçalho do commit (exceto caminhos de arquivo pré-existentes e chaves `HT-XXX`/`HN-XXX`).
3. **Commit gigante / omnibus:** Misturar alterações de documentação, features e correções não relacionadas em um único commit.
4. **Omissão de autoria de IA:** Omitir `Generated-by-AI` quando um modelo LLM sugeriu ou gerou o código ou o commit.
