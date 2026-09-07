import { defineConfig } from 'vitest/config';

// Executor unitario do repositorio (ADR-003). Roda sem framework, banco ou rede.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'backend/src/**/*.test.ts', 'packages/**/src/**/*.test.ts', 'frontend/src/dados/**/*.test.ts'],
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
      // Limiar de RNF-018. Hoje vacuamente verde: nao ha dominio. Vira prova real
      // em HT-009, cujo criterio de aceite inclui "arquivo de dominio sem teste
      // derruba `harness coverage`".
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
