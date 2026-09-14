import { expect, test } from './fixtures';

test.describe('Autenticação e Acesso — RF-001 e RF-002', () => {
  test('validação de formulário de login com campos vazios', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText('E-mail é obrigatório')).toBeVisible();
    await expect(page.getByText('A senha deve ter pelo menos 6 caracteres')).toBeVisible();
  });

  test('recusa login com credenciais incorretas (RF-002)', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('inexistente@exemplo.com');
    await page.locator('#loginPassword').fill('SenhaErrada123!');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText('Não foi possível entrar', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('validação de campos obrigatórios no cadastro (RF-001)', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /próximo|continuar|avançar/i }).click();

    await expect(page.getByText('Nome muito curto')).toBeVisible();
  });

  test('login com a conta demo e encerramento de sessão (logout)', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#loginEmail').fill('demo@contacomigo.com');
    await page.locator('#loginPassword').fill('demo123');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Redireciona com sucesso para o dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /olá/i })).toBeVisible();

    // Abre o menu do usuário na barra lateral e encerra a sessão
    const userMenuBtn = page.locator('#sidebar-user-menu');
    await expect(userMenuBtn).toBeVisible();
    await userMenuBtn.click();

    const logoutBtn = page.locator('#sidebar-logout');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
