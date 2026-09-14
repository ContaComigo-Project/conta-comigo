import { defineConfig, devices } from '@playwright/test';

// Testes funcionais/BDD em navegador real (ADR-003; jsdom foi rejeitado).
// Sobe a web pelo Vite e roda em Chromium — o unico navegador que `harness
// setup` baixa. Um cenario por criterio de aceite; cenarios de regra levam
// o nome `RN-XXX` no titulo para o gate de QA rastrear (ADR-003, regra 3).
export default defineConfig({
  testDir: 'tests/functional',
  fullyParallel: true,
  // Sem retry: repetir ate passar esconde flakiness — e reward-hacking silencioso.
  retries: 0,
  // `test.only` esquecido nao pode virar suite verde no CI.
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm --filter client-contacomigo dev --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
