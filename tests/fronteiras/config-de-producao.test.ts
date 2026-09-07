import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// Regressao de HT-009: com node_modules em `exclude`, o dependency-cruiser
// apaga os pacotes do grafo e a aresta domain/ -> @nestjs/common some antes das
// regras rodarem. O gate ficou verde com uma violacao real plantada. As fixtures
// de HT-006 nao pegaram porque usavam outras opcoes. Este teste garante que o
// config de PRODUCAO nunca volte a excluir node_modules — ele so pode estar em
// doNotFollow.

const require = createRequire(import.meta.url);
const RAIZ = join(__dirname, '..', '..');

interface Config {
  forbidden: Array<{ name: string; severity: string }>;
  options: { exclude?: { path?: string | string[] }; doNotFollow?: { path?: string | string[] } };
}

const lista = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

describe('config de producao do dependency-cruiser', () => {
  const config: Config = require(join(RAIZ, '.dependency-cruiser.cjs'));

  it('nao exclui node_modules do grafo (a aresta para o pacote precisa existir)', () => {
    const exemplo = 'node_modules/.pnpm/@nestjs+common@12.0.1/node_modules/@nestjs/common/index.js';
    for (const padrao of lista(config.options.exclude?.path)) {
      expect(new RegExp(padrao).test(exemplo), `exclude "${padrao}" apagaria ${exemplo}`).toBe(false);
    }
  });

  it('nao segue para dentro de node_modules (doNotFollow), o que basta para desempenho', () => {
    expect(lista(config.options.doNotFollow?.path).some((p) => new RegExp(p).test('node_modules/x'))).toBe(true);
  });

  it('exclui as fixtures ilegais do lint de producao', () => {
    const fixture = 'tests/fronteiras/fixtures/violacao/orcamento/domain/model/faixa-nestjs.ts';
    expect(lista(config.options.exclude?.path).some((p) => new RegExp(p).test(fixture))).toBe(true);
  });

  it('toda regra e bloqueante', () => {
    expect(config.forbidden.length).toBeGreaterThan(0);
    for (const regra of config.forbidden) expect(regra.severity, regra.name).toBe('error');
  });
});
