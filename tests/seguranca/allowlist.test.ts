import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// RNF-012 — the compiled web bundle (frontend/dist) is where a mistakenly
// embedded key ends up: it is not in the source, it is in the variable the
// bundler inlined, and `dist/` never enters git.
//
// The secret scan covers this case because `gitleaks dir` reads the filesystem
// and does NOT respect .gitignore — verified in HT-008 by planting a key in
// `coverage/` (gitignored) and observing detection; and by planting one in the
// bundle with the source already clean and observing `harness security` fail.
//
// The coverage is silent: it disappears without warning if someone adds `dist`
// to the allowlist to silence a false positive. This test guards that — cheaper
// than a second gitleaks pass on every `harness security`.

const RAIZ = join(__dirname, '..', '..');
const config = readFileSync(join(RAIZ, '.gitleaks.toml'), 'utf8');

/**
 * Paths the allowlist declares — the lines between triple quotes in `paths`.
 * The block ends at the `]` alone on a line, not at the first `]` found: the
 * patterns themselves contain `]` (in `[^/]+`) and would truncate the reading.
 */
function allowlistPaths(): string[] {
  const inicio = config.indexOf('paths = [');
  const fim = config.indexOf('\n]', inicio);
  const bloco = inicio >= 0 && fim > inicio ? config.slice(inicio, fim) : '';
  return [...bloco.matchAll(/'''([\s\S]*?)'''/g)].map((m) => m[1].trim());
}

describe('RNF-012 — the secret allowlist cannot blind the scan', () => {
  const caminhos = allowlistPaths();

  it('the allowlist is readable and has declared entries', () => {
    expect(caminhos.length).toBeGreaterThan(0);
  });

  it('no entry exempts the compiled web bundle', () => {
    const alvos = [
      'frontend/dist/index.html',
      'frontend/dist/assets/index-abc123.js',
      'dist/assets/main.js',
    ];
    for (const padrao of caminhos) {
      const regex = new RegExp(padrao);
      for (const alvo of alvos) {
        expect(regex.test(alvo), `the allowlist "${padrao}" exempts ${alvo} from the scan`).toBe(false);
      }
    }
  });

  it('no entry exempts the web or API source', () => {
    const alvos = ['frontend/src/main.tsx', 'backend/src/main.ts', 'packages/contract/src/index.ts'];
    for (const padrao of caminhos) {
      const regex = new RegExp(padrao);
      for (const alvo of alvos) {
        expect(regex.test(alvo), `the allowlist "${padrao}" exempts ${alvo}`).toBe(false);
      }
    }
  });

  it('the existing exceptions remain the declared, justified ones', () => {
    // If this list changes, the change is deliberate and goes through review.
    expect(caminhos.sort()).toEqual(
      [
        '^docker-compose\\.yml$',
        '^docs/tasks/[^/]+/evidencia/',
        '^pnpm-lock\\.yaml$',
      ].sort(),
    );
  });
});