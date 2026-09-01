<h1 align="center">
  <img
    src="https://raw.githubusercontent.com/Raullize/conta-comigo/main/frontend/public/assets/brand/logo-conta-comigo.png"
    alt="ContaComigo"
    width="320"
  />
</h1>

<p align="center">
  <strong>
    Democratizando a gestão financeira pessoal através do Open Finance e da Inteligência Artificial.
  </strong>
</p>

<p align="center">
  <img src="https://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge" alt="Status do projeto: EM DESENVOLVIMENTO"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5"/>
  <img src="https://img.shields.io/badge/TailwindCSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS 4"/>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini"/>
  <img src="https://img.shields.io/badge/Open_Finance_Brasil-004C97?style=for-the-badge&logo=banksalad&logoColor=white" alt="Open Finance Brasil"/>
</p>

<p align="center">
  Projeto homologado e apresentado na
  <strong> MOCITEC — Mostra de Ciências e Tecnologias do IFSul Campus Charqueadas</strong>.
</p>

---

## Descrição

No cenário socioeconômico brasileiro contemporâneo, a ausência de educação
financeira atua como uma barreira invisível que aprofunda as desigualdades e
limita o potencial de ascensão das famílias. O **ContaComigo** foi idealizado
como uma plataforma de transformação social e tecnológica voltada ao
empoderamento financeiro do cidadão comum.

O objetivo central é oferecer uma **Prova de Conceito (PoC)** de uma aplicação
web responsiva que consolide os dados bancários do usuário em um ambiente
único (via **Open Finance Brasileiro**, regulamentado pelo Banco Central) e, a
partir disso, utilize **Inteligência Artificial generativa** como um motor
ativo de **diagnóstico, educação e orientação financeira** — sem jamais
exercer aconselhamento financeiro regulamentado.

A relevância do ContaComigo reside em sua capacidade de transmutar extratos
bancários brutos em conhecimento prático, auxiliando diretamente na superação
do analfabetismo financeiro.

**Resumo completo submetido e homologado na MOCITEC:**
[docs/RESUMO-MOCITEC.md](./docs/RESUMO-MOCITEC.md)

### Principais funcionalidades (PoC em andamento)

- 🏦 **Consolidação Open Finance** — agregação de múltiplas instituições
  bancárias em um único dashboard (Pluggy Sandbox)
- 🚦 **Orçamento Semáforo Inteligente** — visualização Verde ≤70% / Amarelo
  70–90% / Vermelho >90% com barras verticais animadas, limites editáveis
  inline e sugestões de ajuste por IA
- 📊 **Histórico de 6 meses** — análise de tendências, gasto médio, top 3
  problemas recorrentes e mapa de status por categoria
- 🤖 **Diagnóstico e Insights de IA (RAG)** — painel rotativo de
  oportunidades, alertas e metas, com CTAs navegáveis para ações
- 💬 **Chatbot Educativo** — consultor financeiro IA com banner permanente
  de "não aconselhamento financeiro" + cards de status orçamentário e planos
  de compra simulados
- 📄 **Exportar Relatórios** — menu visual PDF / CSV por mês ou histórico
  completo
- 📱 **Interface 100% responsiva** — Bento Grid desktop + Bottom Dock +
  Sidebar desktop, layout adaptado a celulares
- 🔐 **Autenticação local** — Login / Cadastro com validação via Zod + React
  Hook Form, proteção de rotas privadas

---

## Tecnologias Utilizadas

### Frontend (aplicação web, implementada)

- **[React 19](https://react.dev/)** + **[TypeScript 6](https://www.typescriptlang.org/)**
  — tipagem estrita e React Compiler
- **[Vite 8](https://vitejs.dev/)** — build tool e servidor de desenvolvimento
- **[TailwindCSS 4](https://tailwindcss.com/)** — @theme inline, tokens
  customizados (cores, sizes, durations), sem `tailwind.config.js`
- **[React Router 7](https://reactrouter.com/)** — nested routes, proteção de
  rotas privadas, hash scrolling
- **[Zod 4](https://zod.dev/)** + **[React Hook Form 7](https://react-hook-form.com/)**
  — validação de formulários
- **[Lucide React](https://lucide.dev/)** + **Font Awesome (ícones)**
- **[@radix-ui/react-toast](https://www.radix-ui.com/)** + toaster custom
- **[Tailwind Merge](https://www.npmjs.com/package/tailwind-merge)** +
  **[class-variance-authority](https://cva.style/)** + **clsx**
- **Lint:** [ESLint 9](https://eslint.org/) + `typescript-eslint` +
  `react-hooks` + `react-refresh`

### Backend (a ser implementado)

- **[NestJS](https://nestjs.com/)** — regras de negócio e API REST
- **[Pluggy API (Sandbox)](https://pluggy.ai/)** — agregação de dados Open
  Finance
- **[Google Gemini API](https://ai.google.dev/)** + **[LangChain.js](https://js.langchain.com/)**
  — motor de IA, orquestração de contexto e prompts
- **[PostgreSQL](https://www.postgresql.org/)** — persistência
- **[Docker](https://www.docker.com/)** + **docker-compose** — ambiente
  reproduzível

---

## Como Executar o Projeto

> Atualmente apenas a camada **frontend** está materializada no repositório
> (mock puro, sem backend integrado). O backend é descrito em
> `docs/BACKEND_ARCHITECTURE.md`.

### Pré-requisitos

- **Node.js ≥ 22** (recomendado última versão LTS)
- **pnpm ≥ 9** (`corepack enable` instala o gerenciador)
- (Opcional, backend futuro) **Docker 27** + **docker compose v2**
- (Opcional, backend futuro) **PostgreSQL 16**

### 1. Clone o repositório

```bash
git clone https://github.com/Raullize/conta-comigo.git
cd conta-comigo
```

### 2. Instale as dependências do frontend

```bash
cd frontend
pnpm install
```

### 3. Suba o ambiente de desenvolvimento (Vite)

```bash
pnpm dev
```

A aplicação ficará disponível em **http://localhost:5173** (porta padrão Vite).

### 4. Valide código e faça o build de produção

```bash
# Lint (ESLint 9 + Tailwind suggestCanonicalClasses)
pnpm lint

# Type-check strict (tsc -b) + build Vite otimizado
pnpm build

# Preview do build de produção localmente
pnpm preview
```

### 5. (Backend futuro) Docker / .env

A infraestrutura de containers está documentada em
[docs/DOCKER.md](./docs/DOCKER.md). Quando a camada NestJS for adicionada,
copie `.env.example` → `.env` e preencha as chaves de
`PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET` e `GOOGLE_GEMINI_API_KEY`.

---

## Documentação

| Documento | Descrição |
| :--- | :--- |
| [Resumo homologado MOCITEC](./docs/RESUMO-MOCITEC.md) | Texto completo submetido, aprovado e apresentado na Mostra |
| [Arquitetura Frontend](./docs/FRONTEND_ARCHITECTURE.md) | Estrutura de pastas, rotas, layout, componentes, temas |
| [Arquitetura Backend](./docs/BACKEND_ARCHITECTURE.md) | NestJS, Pluggy, Gemini / LangChain, persistência |
| [Regras de Negócio](./docs/BUSINESS_RULES.md) | Semáforo orçamentário 70/90%, limites, LGPD, não aconselhamento |
| [Docker](./docs/DOCKER.md) | Compose services, volumes, networks, portas |
| [Estratégia de Testes](./docs/TESTS.md) | Vitest / Playwright / React Testing Library plan |

---

## Contribuindo

Este é um projeto acadêmico do IFSul Campus Charqueadas, submetido à
MOCITEC. Contribuições são bem-vindas através do processo padrão de Pull
Request:

1. **Fork** o repositório
2. Crie uma branch feature:

   ```bash
   git checkout -b feature/minha-contribuicao
   ```

3. Faça suas alterações com **commits semânticos** (Conventional Commits):
   `feat(...)`, `fix(...)`, `refactor(...)`, `docs(...)`, `style(...)`
4. Garanta `pnpm lint && pnpm build` exit 0 dentro de `frontend/`
5. Envie a branch: `git push origin feature/minha-contribuicao`
6. Abra um **Pull Request** contra a branch `develop` descrevendo a mudança

Referência GitHub:
[como criar uma solicitação de pull](https://help.github.com/pt/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

---

## Equipe

### Alunos Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Raullize" title="Raul Lize Teixeira no GitHub">
        <img src="https://github.com/Raullize.png" width="100px;" alt="Foto do Raul Lize Teixeira"/><br>
        <sub><strong>Raul Lize Teixeira</strong></sub>
      </a>
      <br><sub>Desenvolvedor Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/MiguelLewandowski" title="Miguel Lewandowski no GitHub">
        <img src="https://github.com/MiguelLewandowski.png" width="100px;" alt="Foto do Miguel Leonardo Strapazon Lewandowski"/><br>
        <sub><strong>Miguel L. S. Lewandowski</strong></sub>
      </a>
      <br><sub>Desenvolvedor Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/CaputiDev" title="Iago Caputi no GitHub">
        <img src="https://github.com/CaputiDev.png" width="100px;" alt="Foto do Iago Rodrigues Caputi"/><br>
        <sub><strong>Iago R. Caputi</strong></sub>
      </a>
      <br><sub>Desenvolvedor Full Stack</sub>
    </td>
  </tr>
</table>

### Orientador

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/EverttonFernandes" title="Prof. Everton Fernandes no GitHub">
        <img src="https://github.com/EverttonFernandes.png" width="100px;" alt="Foto do Professor Everton Oliveira Fernandes"/><br>
        <sub><strong>Prof. Me. Everton Oliveira Fernandes</strong></sub>
      </a>
      <br><sub>Orientação acadêmica · IFSul Campus Charqueadas</sub>
    </td>
  </tr>
</table>

---

## Licença

Projeto acadêmico licenciado sob a **MIT License** (salvo disposições em
contrário no âmbito do IFSul / MOCITEC). Consulte o arquivo
[`LICENSE`](./LICENSE) (quando disponibilizado) para mais detalhes.
