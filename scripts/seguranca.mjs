// Varredura de seguranca: segredo vazado e dependencia vulneravel.
//
// As duas rodam SEMPRE, mesmo que a primeira falhe: o relatorio completo vale
// mais que economizar alguns segundos. O codigo de saida agrega as duas.
//
// Ambas usam imagem Docker com versao fixada, e nao binario instalado por
// pessoa: Docker ja e pre-requisito do harness (HT-005), entao isto nao
// acrescenta ferramenta nova para instalar, e a versao e identica em qualquer
// maquina e no CI.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

const GITLEAKS = 'zricethezav/gitleaks:v8.28.0';
const OSV = 'ghcr.io/google/osv-scanner:v2.2.4';

// No Windows "docker" e .cmd, e o Node recusa .cmd sem shell desde a correcao
// do CVE-2024-27980. Com shell ligado, argumentos em array disparam o aviso
// DEP0190 — por isso montamos UMA string ja citada. RAIZ pode conter espaco.
function montarComando(comando, args) {
  const partes = [comando, ...args].map((parte) =>
    /[\s"]/.test(parte) ? `"${parte.replace(/"/g, '\\"')}"` : parte,
  );
  return partes.join(' ');
}

function executar(comando, args) {
  const r = spawnSync(montarComando(comando, args), {
    cwd: RAIZ,
    stdio: 'inherit',
    shell: true,
  });
  return r.status ?? 1;
}

function temDocker() {
  // "docker version" fala com o servidor; "docker --version" nao. Sem isso a
  // varredura falharia com erro de socket em vez de mensagem util.
  const r = spawnSync(montarComando('docker', ['version']), {
    stdio: 'pipe',
    shell: true,
  });
  return r.status === 0;
}

console.log('seguranca: varredura de segredo e de dependencia\n');

if (!temDocker()) {
  console.error('seguranca: Docker nao responde.');
  console.error('seguranca: as duas varreduras rodam por contêiner com versao fixada.');
  console.error('seguranca: inicie o Docker e repita. Fallback documentado: "pnpm audit --audit-level high".');
  process.exit(1);
}

let falhas = 0;

// --- 1. Segredos -----------------------------------------------------------
// Duas varreduras, porque cobrem coisas diferentes e uma nao substitui a outra:
//   "dir" le a arvore de trabalho   -> pega o segredo que esta prestes a entrar;
//   "git" le o historico de commits -> pega o segredo que ja entrou um dia e
//                                      continua recuperavel por quem clonar.
// Usar so "git" (o antigo "detect") deixa passar arquivo ainda nao commitado,
// que e justamente o caso que este gate precisa barrar.
function gitleaks(subcomando, rotulo) {
  console.log(`--- ${rotulo}`);
  return executar('docker', [
    'run', '--rm',
    '-v', `${RAIZ}:/repo`,
    GITLEAKS,
    subcomando,
    '/repo',
    '--config=/repo/.gitleaks.toml',
    '--redact',
    '--no-banner',
    '--exit-code=1',
  ]);
}

console.log('=== 1. Segredos (gitleaks)');
const naArvore = gitleaks('dir', 'arvore de trabalho');
const noHistorico = gitleaks('git', 'historico de commits');

if (naArvore === 0 && noHistorico === 0) {
  console.log('  [OK]    nenhum segredo detectado\n');
} else {
  if (naArvore !== 0) console.error('  [FALHA] segredo na arvore de trabalho');
  if (noHistorico !== 0) console.error('  [FALHA] segredo no historico de commits');
  console.error('');
  falhas += 1;
}

// --- 2. Dependencias -------------------------------------------------------
console.log('=== 2. Dependencias vulneraveis (osv-scanner)');
const deps = executar('docker', [
  'run', '--rm',
  '-v', `${RAIZ}:/repo`,
  OSV,
  'scan', 'source',
  '--lockfile=/repo/pnpm-lock.yaml',
]);
if (deps === 0) {
  console.log('  [OK]    nenhuma vulnerabilidade conhecida\n');
} else {
  console.error('  [FALHA] osv-scanner encontrou vulnerabilidade\n');
  falhas += 1;
}

// --- Resultado -------------------------------------------------------------
if (falhas === 0) {
  console.log('seguranca: aprovada');
  process.exit(0);
}

console.error(`seguranca: reprovada — ${falhas} varredura(s) falharam`);
process.exit(1);
