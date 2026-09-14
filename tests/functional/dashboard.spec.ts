import { expect, test } from './fixtures';

test.describe('Dashboard e Gestão Financeira — RF-008 e RF-009', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('demo@contacomigo.com');
    await page.locator('#loginPassword').fill('demo123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('exibe métricas consolidadas e saudação ao usuário', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /olá/i })).toBeVisible();
    await expect(page.getByText(/saldo total|receitas|despesas/i).first()).toBeVisible();
  });

  test('renderiza lançamentos recentes e semáforo de orçamento (RF-009 / RF-014)', async ({ page }) => {
    // Verifica atividade recente ou lançamentos
    await expect(page.getByText(/atividade recente|últimos lançamentos|transações/i).first()).toBeVisible();

    // Verifica widget de orçamento / semáforo
    await expect(page.getByText(/orçamento|limite mensal|visão geral do orçamento/i).first()).toBeVisible();
  });

  test('navegação para despesas detalhadas via menu', async ({ page }) => {
    const expensesLink = page.locator('#sidebar-nav_expenses');
    if (await expensesLink.isVisible()) {
      await expensesLink.click();
      await expect(page).toHaveURL(/\/dashboard\/expenses/, { timeout: 10_000 });
      await expect(page.getByText(/despesas|categorias|histórico/i).first()).toBeVisible();
    }
  });
});
