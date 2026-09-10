import { expect, test } from '@playwright/test';

test.describe('Configurações e Privacidade LGPD — RF-001, RN-012 e RN-016', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('demo@contacomigo.com');
    await page.locator('#loginPassword').fill('demo123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('renderiza telas de perfil, preferências e privacidade', async ({ page }) => {
    await page.goto('/dashboard/configuracoes');
    await expect(page.getByRole('heading', { level: 1, name: 'Configurações' })).toBeVisible({ timeout: 10_000 });

    // Verifica card de perfil com email do usuário demo dentro do conteúdo principal
    await expect(page.getByRole('main').getByText('demo@contacomigo.com')).toBeVisible();

    // Verifica conformidade LGPD e consentimentos
    await expect(page.getByText(/privacidade e dados \(lgpd\)/i)).toBeVisible();
    await expect(page.getByText(/consentimento ativo \(rn-012\)/i)).toBeVisible();
  });

  test('exibe botão de exclusão de conta e modal de confirmação (RN-016)', async ({ page }) => {
    await page.goto('/dashboard/configuracoes');

    // Localiza o botão para excluir a conta
    const deleteBtn = page.getByRole('button', { name: /excluir conta|excluir minha conta/i });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Modal de confirmação da exclusão (RN-016)
    await expect(page.getByText('Excluir Conta Permanentemente?')).toBeVisible();
    await expect(page.getByText(/esta operação é/i)).toBeVisible();

    // Cancela o modal para não excluir a conta de teste
    const cancelBtn = page.getByRole('button', { name: 'Cancelar' });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await expect(page.getByText('Excluir Conta Permanentemente?')).not.toBeVisible();
  });
});
