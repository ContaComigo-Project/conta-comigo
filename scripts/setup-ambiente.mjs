// Prepara o ambiente local em maquina limpa.
//
// Um unico arquivo Node roda identico em Linux, macOS e Windows — o que
// satisfaz a exigencia de paridade melhor que um par .sh/.ps1 que pode
// divergir. Cada passo falha alto, com instrucao acionavel: um setup que
// segue adiante em silencio produz o "funciona na minha maquina" que o gate
// de SRE proibe.

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

function passo(titulo) {
  console.log(`\n=== ${titulo}`);
}

function ok(msg) {
  console.log(`  [OK]    ${msg}`);
}

function abortar(msg, comoResolver) {
  console.error(`  [FALHA] ${msg}`);
  if (comoResolver) console.error(`  [COMO]  ${comoResolver}`);
  process.exit(1);
}

// No Windows "pnpm" e "docker" sao .cmd, e desde a correcao do CVE-2024-27980
// o Node recusa executar .cmd/.bat sem shell. Com shell ligado, porem, passar
// os argumentos em array dispara o aviso DEP0190 (argumentos concatenados sem
// escape). A saida e montar UMA string ja citada: nao sobra argumento solto
// para o Node concatenar, e caminho com espaco continua funcionando.
function montarComando(comando, args) {
  const partes = [comando, ...args].map((parte) =>
    /[\s"]/.test(parte) ? `"${parte.replace(/"/g, '\\"')}"` : parte,
  );
  return partes.join(' ');
}

function executar(comando, args, { silencioso = false } = {}) {
  const r = spawnSync(montarComando(comando, args), {
    cwd: RAIZ,
    stdio: silencioso ? 'pipe' : 'inherit',
    shell: true,
    encoding: 'utf8',
  });
  return { codigo: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}

function versaoDe(comando, args) {
  const r = executar(comando, args, { silencioso: true });
  return r.codigo === 0 ? r.saida.trim() : null;
}

// --- 1. Pre-requisitos -----------------------------------------------------
passo('1. Verificando pre-requisitos');

const nodeEsperado = readFileSync(join(RAIZ, '.nvmrc'), 'utf8').trim();
const nodeAtual = process.versions.node;
const maiorEsperado = nodeEsperado.split('.')[0];
const maiorAtual = nodeAtual.split('.')[0];
if (maiorAtual !== maiorEsperado) {
  abortar(
    `Node ${nodeAtual} nao corresponde ao esperado (${nodeEsperado}).`,
    `Instale a versao de .nvmrc. Com nvm: "nvm install ${nodeEsperado} && nvm use ${nodeEsperado}".`,
  );
}
ok(`Node ${nodeAtual}`);

const pnpm = versaoDe('pnpm', ['--version']);
if (!pnpm) {
  abortar('pnpm nao encontrado.', 'Ative com "corepack enable pnpm".');
}
ok(`pnpm ${pnpm}`);

const docker = versaoDe('docker', ['--version']);
if (!docker) {
  abortar(
    'Docker nao encontrado.',
    'Instale o Docker e garanta que o comando "docker" esta no PATH.',
  );
}
ok(docker);

const compose = versaoDe('docker', ['compose', 'version']);
if (!compose) {
  abortar(
    'Docker esta instalado mas nao responde a "docker compose".',
    'Atualize o Docker: o plugin "compose" v2 faz parte das versoes recentes.',
  );
}
ok(compose.split('\n')[0]);

// "docker --version" responde so com o cliente: ele passa mesmo com o daemon
// desligado. Quem prova que o motor esta de pe e "docker info", que fala com
// o servidor. Sem esta checagem o setup morreria la no passo 4, com um erro de
// socket em vez de uma instrucao acionavel.
const motor = versaoDe('docker', ['info', '--format', '{{.ServerVersion}}']);
if (!motor) {
  abortar(
    'O cliente do Docker responde, mas o motor nao esta de pe.',
    process.platform === 'win32'
      ? 'Abra o Docker Desktop e espere o status ficar "Engine running".'
      : 'Inicie o daemon: "sudo systemctl start docker".',
  );
}
ok(`motor do Docker ${motor}`);

// --- 2. Dependencias -------------------------------------------------------
passo('2. Instalando dependencias com o lockfile congelado');

const instalacao = executar('pnpm', ['install', '--frozen-lockfile']);
if (instalacao.codigo !== 0) {
  abortar(
    'pnpm install falhou.',
    'Se o lockfile estiver desatualizado, rode "pnpm install" e commite o pnpm-lock.yaml.',
  );
}
ok('dependencias instaladas');

// --- 3. Navegadores do Playwright -----------------------------------------
passo('3. Navegadores de teste');

// Playwright so entra em HT-006. Ate la nao ha o que baixar, e pular em
// silencio esconderia a pendencia — por isso o aviso e explicito.
const temPlaywright = existsSync(join(RAIZ, 'node_modules', '@playwright', 'test'));
if (temPlaywright) {
  // --with-deps e deliberadamente omitido: exige root no Linux e nao existe
  // no Windows. As libs de sistema ficam a cargo da imagem do runner (HT-007).
  const navegador = executar('pnpm', ['exec', 'playwright', 'install', 'chromium']);
  if (navegador.codigo !== 0) {
    abortar('Falha ao baixar o Chromium do Playwright.', 'Verifique a conexao e repita.');
  }
  ok('Chromium instalado');
} else {
  console.log('  [PULA]  @playwright/test ainda nao instalado — chega em HT-006.');
}

// --- 4. Banco de dados -----------------------------------------------------
passo('4. Subindo o PostgreSQL');

const subida = executar('docker', ['compose', 'up', '-d', '--wait']);
if (subida.codigo !== 0) {
  abortar(
    'docker compose nao conseguiu subir o PostgreSQL saudavel.',
    'Veja o log com "docker compose logs postgres". Para recomecar do zero: "pnpm run down".',
  );
}
ok('PostgreSQL saudavel (healthcheck aprovado)');

// --- 5. Smoke de conectividade --------------------------------------------
passo('5. Conferindo a conexao com o banco');

const smoke = executar(
  'docker',
  ['compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'contacomigo', '-d', 'contacomigo'],
  { silencioso: true },
);
if (smoke.codigo !== 0) {
  abortar('O PostgreSQL subiu mas nao aceita conexao.', smoke.saida.trim());
}
ok(smoke.saida.trim());

// --- 6. Migracoes ----------------------------------------------------------
passo('6. Migracoes');

// ADR-002 regra 3: esquema evolui por migracao commitada, nunca por `db push`.
// `generate` cria o cliente tipado (gitignored); `migrate deploy` aplica o que
// esta em backend/prisma/migrations no Postgres do compose.
const geracao = executar('pnpm', ['--filter', '@contacomigo/backend', 'prisma:generate']);
if (geracao.codigo !== 0) abortar('prisma generate falhou.', 'Veja a saida acima; o schema esta em backend/prisma/schema.prisma.');
ok('cliente Prisma gerado');
const migracao = executar('pnpm', ['--filter', '@contacomigo/backend', 'prisma:migrate']);
if (migracao.codigo !== 0) abortar('prisma migrate deploy falhou.', 'Banco de pe? Para recomecar do zero: "pnpm run down" e depois "setup".');
ok('migracoes aplicadas');

// --- Resumo ----------------------------------------------------------------
console.log('\n=== Ambiente pronto');
console.log(`  Node    ${nodeAtual}`);
console.log(`  pnpm    ${pnpm}`);
console.log(`  ${docker}`);
console.log('  Postgres  localhost:5433  (usuario e base: contacomigo)');
console.log('\nProximo: scripts/harness.sh gates');
