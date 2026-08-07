import { test, expect } from '@playwright/test';
import { login, nomeUnico } from './helpers';

test.describe('Projetos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByTestId('sidebar-desktop').getByRole('link', { name: 'Projetos' }).click();
    await expect(page).toHaveURL(/\/projetos$/);
  });

  test('cria, edita e exclui um projeto', async ({ page }) => {
    const nome = nomeUnico('Projeto E2E');
    const nomeEditado = `${nome} (editado)`;

    await page.getByRole('button', { name: 'Novo projeto' }).click();
    await page.getByLabel('Nome').fill(nome);
    await page.getByLabel('Descrição').fill('Criado pelo teste automatizado.');
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Projeto criado com sucesso.')).toBeVisible();
    const card = page.getByTestId('projeto-card').filter({ hasText: nome });
    await expect(card).toBeVisible();

    await card.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Nome').fill(nomeEditado);
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Projeto atualizado com sucesso.')).toBeVisible();

    const cardEditado = page.getByTestId('projeto-card').filter({ hasText: nomeEditado });
    await expect(cardEditado).toBeVisible();

    await cardEditado.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Projeto excluído com sucesso.')).toBeVisible();
    await expect(page.getByTestId('projeto-card').filter({ hasText: nomeEditado })).toHaveCount(0);
  });
});
