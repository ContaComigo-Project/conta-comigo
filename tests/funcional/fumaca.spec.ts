import { expect, test } from '@playwright/test';

// Cenario de fumaca: prova que a infraestrutura funcional sobe a web real e
// enxerga a tela. Nao e cenario de regra — os `RN-XXX` chegam com as historias
// de negocio (ADR-003, regra 1).
test.describe('fumaca — a web existente responde', () => {
  test('a landing abre com o titulo do produto', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ContaComigo/);
    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('a tela de login existe e tem formulario', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });
});
