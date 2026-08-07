import { test, expect } from '@playwright/test';
import { login } from './helpers';

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow, 'a página não deveria rolar horizontalmente').toBeLessThanOrEqual(1);
}

test.describe('Responsividade', () => {
  test('login: alternador de tema fica dentro da viewport em telas pequenas', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/login');

    const toggle = page.getByRole('button', { name: /Ativar tema/ });
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);

    await assertNoHorizontalOverflow(page);
  });

  test('login: layout permanece consistente ao alternar o tema em tela pequena', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/login');

    await page.getByRole('button', { name: /Ativar tema/ }).click();
    await assertNoHorizontalOverflow(page);

    const toggle = page.getByRole('button', { name: /Ativar tema/ });
    const box = await toggle.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  });

  test('tarefas: sem overflow horizontal e ações visíveis em tela pequena', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await login(page);
    await page.getByTestId('sidebar-mobile').isHidden();

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByTestId('sidebar-mobile').getByRole('link', { name: 'Tarefas' }).click();
    await expect(page).toHaveURL(/\/tarefas$/);

    await expect(page.getByRole('button', { name: 'Nova tarefa' })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Nova tarefa' }).click();
    const projetoField = page.getByLabel('Projeto');
    const prioridadeField = page.getByLabel('Prioridade');
    const projetoBox = await projetoField.boundingBox();
    const prioridadeBox = await prioridadeField.boundingBox();
    expect(prioridadeBox!.y, 'os campos do formulário devem empilhar em telas pequenas').toBeGreaterThan(
      projetoBox!.y + projetoBox!.height - 5,
    );
    await assertNoHorizontalOverflow(page);
  });

  test('projetos: cabeçalho quebra a linha em vez de espremer o botão em tela pequena', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await login(page);
    await page.goto('/projetos');

    const button = page.getByRole('button', { name: 'Novo projeto' });
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
    await assertNoHorizontalOverflow(page);
  });

  test('dashboard: sidebar aparece em largura de tablet e some em mobile', async ({ page }) => {
    await login(page);

    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/dashboard');
    await expect(page.getByTestId('sidebar-desktop')).toBeHidden();
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1024, height: 800 });
    await page.reload();
    await expect(page.getByTestId('sidebar-desktop')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
