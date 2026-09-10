import { expect, test } from '@playwright/test';

test.describe('Carteira de Investimentos e Alocação — RF-008 e RN-017', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('demo@contacomigo.com');
    await page.locator('#loginPassword').fill('demo123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('exibe painel de investimentos consolidado', async ({ page }) => {
    await page.goto('/dashboard/investimentos');
    await expect(page.getByRole('heading', { name: 'Investimentos' })).toBeVisible({ timeout: 10_000 });

    // Verifica se os cards de métricas de investimento e patrimônio estão presentes
    await expect(page.getByText(/patrimônio total|alocação de ativos|rentabilidade/i).first()).toBeVisible();
  });

  test('permite retornar ao painel principal a partir de investimentos', async ({ page }) => {
    await page.goto('/dashboard/investimentos');
    await page.getByRole('link', { name: /voltar ao início/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
  });
});
