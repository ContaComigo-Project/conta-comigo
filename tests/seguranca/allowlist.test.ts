import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// RNF-012 — o pacote compilado da web (frontend/dist) e onde uma chave embutida
// por engano acaba parando: ela nao esta no codigo-fonte, esta na variavel que o
// bundler inlineou, e `dist/` nunca entra no git.
//
// A varredura de segredo cobre esse caso porque `gitleaks dir` le o filesystem e
// NAO respeita o .gitignore — verificado em HT-008 plantando uma chave em
// `coverage/`, gitignored, e observando a deteccao; e plantando uma no bundle,
// com a fonte ja limpa, e observando `harness security` reprovar.
//
// A cobertura e silenciosa: some sem aviso se alguem colocar `dist` na allowlist
// para calar um falso positivo. Este teste e o guardiao disso — mais barato que
// uma segunda passada do gitleaks a cada `harness security`.

const RAIZ = join(__dirname, '..', '..');
const config = readFileSync(join(RAIZ, '.gitleaks.toml'), 'utf8');

/**
 * Caminhos que a allowlist declara — as linhas entre aspas triplas em `paths`.
 * O bloco termina no `]` sozinho na linha, e nao no primeiro `]` encontrado:
 * os proprios padroes contem `]` (em `[^/]+`) e truncariam a leitura.
 */
function caminhosDaAllowlist(): string[] {
  const inicio = config.indexOf('paths = [');
  const fim = config.indexOf('\n]', inicio);
  const bloco = inicio >= 0 && fim > inicio ? config.slice(inicio, fim) : '';
  return [...bloco.matchAll(/'''([\s\S]*?)'''/g)].map((m) => m[1].trim());
}

describe('RNF-012 — a allowlist de segredos nao pode cegar a varredura', () => {
  const caminhos = caminhosDaAllowlist();

  it('a allowlist e legivel e tem entradas declaradas', () => {
    expect(caminhos.length).toBeGreaterThan(0);
  });

  it('nenhuma entrada isenta o pacote compilado da web', () => {
    const alvos = [
      'frontend/dist/index.html',
      'frontend/dist/assets/index-abc123.js',
      'dist/assets/main.js',
    ];
    for (const padrao of caminhos) {
      const regex = new RegExp(padrao);
      for (const alvo of alvos) {
        expect(regex.test(alvo), `a allowlist "${padrao}" isenta ${alvo} da varredura`).toBe(false);
      }
    }
  });

  it('nenhuma entrada isenta o codigo-fonte da web ou da API', () => {
    const alvos = ['frontend/src/main.tsx', 'backend/src/main.ts', 'packages/contrato/src/index.ts'];
    for (const padrao of caminhos) {
      const regex = new RegExp(padrao);
      for (const alvo of alvos) {
        expect(regex.test(alvo), `a allowlist "${padrao}" isenta ${alvo}`).toBe(false);
      }
    }
  });

  it('as excecoes que existem seguem sendo as declaradas e justificadas', () => {
    // Se esta lista mudar, a mudanca e deliberada e passa por revisao.
    expect(caminhos.sort()).toEqual(
      [
        '^docker-compose\\.yml$',
        '^docs/tasks/[^/]+/evidencia/',
        '^pnpm-lock\\.yaml$',
      ].sort(),
    );
  });
});
