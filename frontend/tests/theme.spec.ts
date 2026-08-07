import { test, expect } from '@playwright/test';

test.describe('Tema claro/escuro', () => {
  test('alterna para escuro e persiste após recarregar', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('taskmanagement.theme'));
    await page.reload();

    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await expect(page.getByRole('button', { name: 'Ativar tema claro' })).toBeVisible();
  });

  test('volta para claro e persiste após recarregar', async ({ page }) => {
    await page.goto('/login');
    const html = page.locator('html');

    await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Ativar tema claro' }).click();
    await expect(html).not.toHaveClass(/dark/);

    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
  });
});
