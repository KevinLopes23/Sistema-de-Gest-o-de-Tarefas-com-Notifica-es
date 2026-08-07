import type { Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@moovefy.com';
export const ADMIN_SENHA = 'Admin@123';

export async function login(page: Page, email = ADMIN_EMAIL, senha = ADMIN_SENHA) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/dashboard');
}

export function nomeUnico(prefixo: string) {
  return `${prefixo} ${Date.now()}`;
}
