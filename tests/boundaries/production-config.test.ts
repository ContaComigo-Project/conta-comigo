import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// HT-009 regression: with node_modules in `exclude`, dependency-cruiser removes
// the packages from the graph and the domain/ -> @nestjs/common edge disappears
// before the rules run. The gate went green with a real planted violation. The
// HT-006 fixtures did not catch it because they used other options. This test
// guarantees that the PRODUCTION config never returns to excluding node_modules
// — it can only be in doNotFollow.

const require = createRequire(import.meta.url);
const ROOT = join(__dirname, '..', '..');

interface Config {
  forbidden: Array<{ name: string; severity: string }>;
  options: { exclude?: { path?: string | string[] }; doNotFollow?: { path?: string | string[] } };
}

const toList = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

describe('production dependency-cruiser config', () => {
  const config: Config = require(join(ROOT, '.dependency-cruiser.cjs'));

  it('does not exclude node_modules from the graph (the edge to the package must exist)', () => {
    const example = 'node_modules/.pnpm/@nestjs+common@12.0.1/node_modules/@nestjs/common/index.js';
    for (const pattern of toList(config.options.exclude?.path)) {
      expect(new RegExp(pattern).test(example), `exclude "${pattern}" would erase ${example}`).toBe(false);
    }
  });

  it('does not follow into node_modules (doNotFollow), enough for performance', () => {
    expect(toList(config.options.doNotFollow?.path).some((p) => new RegExp(p).test('node_modules/x'))).toBe(true);
  });

  it('excludes the illegal fixtures from the production lint', () => {
    const fixture = 'tests/boundaries/fixtures/violation/budget/domain/model/band-nestjs.ts';
    expect(toList(config.options.exclude?.path).some((p) => new RegExp(p).test(fixture))).toBe(true);
  });

  it('every rule is blocking', () => {
    expect(config.forbidden.length).toBeGreaterThan(0);
    for (const rule of config.forbidden) expect(rule.severity, rule.name).toBe('error');
  });
});