// Prova executavel de que a checagem de fronteiras de ADR-001 bloqueia.
//
// ADR-001 exige "que um import de @nestjs/common dentro de domain/ faca o gate
// falhar, e que exista um teste provando que ele falha". Este e esse teste.
// Ele roda o dependency-cruiser sobre duas arvores de fixture — uma que viola
// cada regra, outra que respeita todas — e afirma sobre o JSON de saida.
//
// Por que asserir o NOME da regra e o ARQUIVO, e nao so o codigo de saida:
// config quebrado, binario ausente ou import irresolvivel tambem dao exit != 0.
// Sem o detalhe, este teste passaria pelo motivo errado — o tipo de teste que
// a rule test-evidence-quality chama de divida.

import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const RAIZ = join(__dirname, '..', '..');
const CONFIG = join('tooling', 'fronteiras', 'fixtures.cjs');
const FIXTURES = join('tests', 'fronteiras', 'fixtures');

interface Violacao {
  from: string;
  to: string;
  rule: { name: string; severity: string };
}

function depcruise(args: string[]) {
  // Comando em UMA string: no Windows "pnpm" e .cmd e exige shell, e shell com
  // args em array dispara o aviso DEP0190 do Node (argumentos nao escapados).
  // Nenhum argumento aqui tem espaco ou vem de fora — sao literais deste teste.
  const comando = ['pnpm', 'exec', 'depcruise', '--config', CONFIG, ...args].join(' ');
  return spawnSync(comando, { cwd: RAIZ, encoding: 'utf8', shell: true });
}

function cruzar(subarvore: string) {
  const alvo = join(FIXTURES, subarvore).replace(/\\/g, '/');
  // Duas passadas: o reporter "err" e o que o harness usa e e quem define o
  // codigo de saida (numero de erros); o "json" da o detalhe para asserir a
  // regra e o arquivo. So o codigo de saida nao basta — ver cabecalho.
  const gate = depcruise(['--output-type', 'err', alvo]);
  const dados = depcruise(['--output-type', 'json', alvo]);
  const inicioJson = dados.stdout.indexOf('{');
  const json = inicioJson >= 0 ? JSON.parse(dados.stdout.slice(inicioJson)) : null;
  const violacoes: Violacao[] = json?.summary?.violations ?? [];
  return { status: gate.status, violacoes, stderr: gate.stderr };
}

function violacaoDe(violacoes: Violacao[], regra: string, arquivo: string) {
  return violacoes.find((v) => v.rule.name === regra && v.from.endsWith(arquivo));
}

describe('fronteiras de ADR-001 — arvore que viola', () => {
  const resultado = cruzar('violacao');

  it('o gate reprova (codigo de saida diferente de zero)', () => {
    expect(resultado.status).not.toBe(0);
  });

  it('ADR-001 — @nestjs/common em domain/ e nomeado com regra e arquivo', () => {
    const v = violacaoDe(resultado.violacoes, 'domain-no-framework-or-io', 'domain/model/band-nestjs.ts');
    expect(v, JSON.stringify(resultado.violacoes, null, 2)).toBeDefined();
    expect(v?.rule.severity).toBe('error');
    expect(v?.to).toContain('@nestjs/common');
  });

  it('ADR-002 — @prisma/client em domain/ e nomeado', () => {
    const v = violacaoDe(resultado.violacoes, 'domain-no-framework-or-io', 'domain/model/band-prisma.ts');
    expect(v).toBeDefined();
    expect(v?.to).toContain('@prisma/client');
  });

  it('ADR-001 — application/ importando infrastructure/ e nomeado', () => {
    const v = violacaoDe(resultado.violacoes, 'application-avoids-infrastructure', 'application/bad-use-case.ts');
    expect(v).toBeDefined();
    expect(v?.to).toContain('infrastructure/persistence/repository.ts');
  });

  it('HT-017 — `import type` do contrato (pacote do workspace) em domain/ e nomeado', () => {
    const v = violacaoDe(resultado.violacoes, 'domain-avoids-workspace-transport', 'domain/model/band-contract.ts');
    expect(v, JSON.stringify(resultado.violacoes.map((x) => [x.rule.name, x.from]), null, 2)).toBeDefined();
    expect(v?.to).toContain('packages/contrato');
  });

  it('ADR-002 — @prisma/client fora de infrastructure/persistence/ e nomeado', () => {
    const v = violacaoDe(resultado.violacoes, 'prisma-only-in-persistence', 'infrastructure/http/uses-prisma.ts');
    expect(v).toBeDefined();
  });

  it('toda violacao reportada tem severidade error — nenhuma regra foi afrouxada', () => {
    expect(resultado.violacoes.length).toBeGreaterThan(0);
    for (const v of resultado.violacoes) expect(v.rule.severity).toBe('error');
  });
});

describe('fronteiras de ADR-001 — arvore limpa (controle)', () => {
  const resultado = cruzar('limpo');

  it('o gate aprova (codigo de saida zero)', () => {
    expect(resultado.stderr).toBe('');
    expect(resultado.status).toBe(0);
  });

  it('nenhuma violacao e reportada', () => {
    expect(resultado.violacoes).toEqual([]);
  });
});
