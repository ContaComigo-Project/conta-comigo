import { expect, test } from '@playwright/test';

// Smoke scenario: proves the functional infrastructure boots the real web and
// sees the screen. Not a business-rule scenario — the `RN-XXX` ones arrive with
// the business stories (ADR-003, rule 1).
test.describe('smoke — the existing web responds', () => {
  test('the landing opens with the product title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ContaComigo/);
    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('the login screen exists and has a form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('the dashboard redirects to login when there is no session (route guard)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});