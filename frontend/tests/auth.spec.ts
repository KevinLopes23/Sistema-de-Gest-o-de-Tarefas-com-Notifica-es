import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_SENHA, login } from './helpers';

test.describe('Autenticação', () => {
  test('mostra erro ao entrar com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nao-existe@moovefy.com');
    await page.getByLabel('Senha', { exact: true }).fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Email ou senha inválidos.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('alterna a visibilidade da senha', async ({ page }) => {
    await page.goto('/login');
    const senhaInput = page.getByLabel('Senha', { exact: true });
    await senhaInput.fill('minha-senha-secreta');
    await expect(senhaInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(senhaInput).toHaveAttribute('type', 'text');
    await expect(senhaInput).toHaveValue('minha-senha-secreta');

    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(senhaInput).toHaveAttribute('type', 'password');
  });

  test('entra com sucesso, chega ao dashboard e permite sair', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_SENHA);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Administrador')).toBeVisible();

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('cria uma nova conta e entra automaticamente', async ({ page }) => {
    const email = `teste.${Date.now()}@moovefy.com`;

    await page.goto('/registrar');
    await page.getByLabel('Nome').fill('Usuário de Teste');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha', { exact: true }).fill('SenhaForte@123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
