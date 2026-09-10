import { expect, test } from './fixtures';

test.describe('Consultor IA — RF-018, RF-020 e RN-018', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('demo@contacomigo.com');
    await page.locator('#loginPassword').fill('demo123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('abre o widget do consultor IA e exibe o aviso permanente de não aconselhamento (RN-018)', async ({ page }) => {
    // Clica no botão flutuante para abrir o chat
    const triggerBtn = page.getByRole('button', { name: /consultor ia/i });
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();

    // Verifica que o widget abriu com o cabeçalho
    await expect(page.getByText('Consultor Financeiro IA')).toBeVisible();

    // RN-018: aviso de não aconselhamento permanente em toda superfície de IA
    await expect(page.getByText(/o consultor ia é educativo e usa seus números/i)).toBeVisible();
    await expect(page.getByText(/não recomenda produtos, investimentos, crédito ou instituições/i)).toBeVisible();

    // Fecha o widget
    const closeBtn = page.getByRole('button', { name: 'Fechar' });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByText('Consultor Financeiro IA')).not.toBeVisible();
  });
});
