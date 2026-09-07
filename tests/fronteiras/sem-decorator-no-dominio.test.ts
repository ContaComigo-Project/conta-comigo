import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// ADR-001, regra adicional 1: "entidade de dominio nao tem decorator" — nem de
// ORM, nem de validacao de transporte, nem de serializacao. Decorator e sintaxe,
// nao import, entao o dependency-cruiser nao enxerga; este teste fecha a lacuna
// registrada como divida em HT-006.

const RAIZ = join(__dirname, '..', '..');
const BACKEND = join(RAIZ, 'backend', 'src');

function arquivosTs(dir: string, acumulado: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) arquivosTs(caminho, acumulado);
    else if (nome.endsWith('.ts')) acumulado.push(caminho);
  }
  return acumulado;
}

function arquivosDeDominio(): string[] {
  return arquivosTs(BACKEND).filter((c) => /[\\/]domain[\\/]/.test(c));
}

// Decorator: "@" no inicio da linha (ignorando espacos) seguido de identificador.
// Nao casa com "@" em comentarios de JSDoc como "@param" porque estes vem
// depois de "*" ou "//".
const DECORATOR = /^\s*@[A-Za-z_$][\w$]*/m;

describe('ADR-001 — dominio sem decorator', () => {
  it('existe pelo menos um arquivo de dominio para verificar', () => {
    expect(arquivosDeDominio().length).toBeGreaterThan(0);
  });

  it('nenhum arquivo em backend/src/**/domain/ usa decorator', () => {
    const infratores = arquivosDeDominio()
      .filter((c) => DECORATOR.test(readFileSync(c, 'utf8')))
      .map((c) => relative(RAIZ, c));
    expect(infratores).toEqual([]);
  });

  it('controle: a fixture ilegal de HT-006 seria pega por esta mesma regra', () => {
    const fixture = join(RAIZ, 'tests', 'fronteiras', 'fixtures', 'violacao', 'orcamento', 'domain', 'model', 'faixa-nestjs.ts');
    expect(DECORATOR.test(readFileSync(fixture, 'utf8'))).toBe(true);
  });
});
