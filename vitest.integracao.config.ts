import { defineConfig } from 'vitest/config';

// Testes de INTEGRACAO: precisam do PostgreSQL do compose (harness setup).
// Separados do unitario para que `test-unitario` continue sem banco (ADR-003).
export default defineConfig({
  test: {
    include: ['backend/src/**/*.integracao.test.ts'],
    exclude: ['**/node_modules/**'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Um banco so: sem paralelismo entre arquivos para nao disputar tabelas.
    fileParallelism: false,
  },
});
