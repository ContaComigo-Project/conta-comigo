import { defineConfig } from 'vitest/config';

// Executor unitario do repositorio (ADR-003). Roda sem framework, banco ou rede.
export default defineConfig({
  test: {
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'backend/src/**/*.test.ts', 'packages/**/src/**/*.test.ts', 'frontend/src/data/**/*.test.ts'],
    // Fixtures de fronteira sao codigo deliberadamente ilegal: nunca executar.
    exclude: ['**/node_modules/**', 'tests/fronteiras/fixtures/**', 'tests/funcional/**', '**/*.integracao.test.ts'],
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      // Cobertura e medida SO no dominio (ADR-003, regra 4). A web entra a
      // partir de HT-017. Com `all: true`, o primeiro arquivo que HT-009 criar
      // em domain/ entra na medicao sozinho — o limiar arma sem ninguem lembrar.
      all: true,
      include: ['backend/src/**/domain/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      // Limiar rigoroso de cobertura do dominio (RNF-018): 100% linhas e funcoes, 99% stmts, 95% branches
      thresholds: { lines: 100, functions: 100, branches: 95, statements: 99 },
    },
  },
});
