# Checklist de Inspeção de Diff e Working Tree

Este checklist serve como guia prático e exaustivo para a execução da skill `code-reviewer-agent` antes da liberação para gates e commit.

---

## 1. Triagem e Higiene de Arquivos

- [ ] **Sem credenciais ou segredos:**
  - Nenhum `.env`, `.env.local`, `.pem`, `.key`, token, senha ou hash sensível.
- [ ] **Sem artefatos de build ou lixo de runtime:**
  - Nenhum arquivo em `node_modules/`, `dist/`, `.next/`, `build/`, `.tmp/`, `*.log`.
- [ ] **Sem arquivos de sistema operacional ou IDE pessoal:**
  - Nenhum `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `.cursor/`.
- [ ] **Escopo atômico e coeso:**
  - Todas as modificações no diff pertencem ao mesmo objetivo.
  - Nenhuma alteração acidental em arquivos alheios ao contexto atual.

---

## 2. Qualidade de Código e Lógica

- [ ] **Corretude:**
  - Não há condições de corrida, loops infinitos ou off-by-one errors.
  - Casos de `null`, `undefined` ou ausência de dados estão tratados defensivamente.
- [ ] **Tratamento de Erros:**
  - Não há blocos `catch` vazios ("swallowing errors").
  - Mensagens de erro são elucidativas e explicam a causa raiz.
- [ ] **Sem resíduos de debug:**
  - Nenhum `console.log`, `print()`, `debugger`, `pdb.set_trace()` ou flags de teste hardcoded.
- [ ] **Clean Code e Legibilidade:**
  - Variáveis e funções possuem nomes claros e autoexplicativos em inglês.
  - Funções são concisas e respeitam a responsabilidade única.
  - Não há comentários desatualizados ou trechos de código comentado ("código zumbi").

---

## 3. Arquitetura e Fronteiras

- [ ] **Isolamento de Camadas:**
  - A camada de domínio não importa UI, banco de dados ou detalhes de infraestrutura.
- [ ] **SOLID e Acoplamento:**
  - Classes e módulos não estão excessivamente acoplados a implementações concretas.
  - Interfaces e portas abstratas são usadas nos limites arquiteturais.

---

## 4. Testes e Regressão

- [ ] **Cobertura de novos fluxos:**
  - Casos de sucesso, erro e borda adicionados nesta entrega possuem testes correspondentes.
- [ ] **Suíte íntegra:**
  - Todos os testes funcionais e unitários executam e passam em verde.
  - Nenhum teste foi desativado, ignorado (`.skip`) ou deletado para forçar sucesso.
