import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navega entre Dashboard, Projetos e Tarefas pela barra lateral', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-desktop');

    await sidebar.getByRole('link', { name: 'Projetos' }).click();
    await expect(page).toHaveURL(/\/projetos$/);
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'Tarefas' }).click();
    await expect(page).toHaveURL(/\/tarefas$/);
    await expect(page.getByRole('heading', { name: 'Tarefas' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('abre e fecha o menu lateral no layout mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');

    await expect(page.getByTestId('sidebar-mobile')).toBeHidden();

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const mobileSidebar = page.getByTestId('sidebar-mobile');
    await expect(mobileSidebar).toBeVisible();

    await mobileSidebar.getByRole('link', { name: 'Projetos' }).click();
    await expect(page).toHaveURL(/\/projetos$/);
  });
});
