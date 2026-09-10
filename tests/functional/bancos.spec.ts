import { expect, test } from '@playwright/test';

test.describe('Conexões Open Finance — RF-005 e RNF-012', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('demo@contacomigo.com');
    await page.locator('#loginPassword').fill('demo123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('exibe página de bancos conectados e garantia de segurança BACEN', async ({ page }) => {
    await page.goto('/dashboard/bancos');
    await expect(page.getByRole('heading', { level: 1, name: 'Bancos Conectados' })).toBeVisible({ timeout: 10_000 });

    // Verifica menção aos padrões de segurança Open Finance e criptografia AES-256
    await expect(page.getByText(/segurança open finance/i)).toBeVisible();
    await expect(page.getByText(/aes-256/i)).toBeVisible();
  });

  test('permite retornar ao painel principal', async ({ page }) => {
    await page.goto('/dashboard/bancos');
    await page.getByRole('link', { name: /voltar ao início/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
  });
});
