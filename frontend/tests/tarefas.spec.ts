import { test, expect } from '@playwright/test';
import { login, nomeUnico } from './helpers';

test.describe('Tarefas', () => {
  test('cria uma tarefa, avança o status, edita e exclui', async ({ page }) => {
    const nomeProjeto = nomeUnico('Projeto para Tarefas');
    const tituloTarefa = nomeUnico('Tarefa E2E');
    const tituloEditado = `${tituloTarefa} (editada)`;

    await login(page);

    // Cria um projeto para vincular a tarefa
    await page.getByTestId('sidebar-desktop').getByRole('link', { name: 'Projetos' }).click();
    await page.getByRole('button', { name: 'Novo projeto' }).click();
    await page.getByLabel('Nome').fill(nomeProjeto);
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Projeto criado com sucesso.')).toBeVisible();

    // Cria a tarefa
    await page.getByTestId('sidebar-desktop').getByRole('link', { name: 'Tarefas' }).click();
    await page.getByRole('button', { name: 'Nova tarefa' }).click();
    await page.getByLabel('Título').fill(tituloTarefa);
    await page.getByLabel('Projeto').selectOption({ label: nomeProjeto });
    await page.getByLabel('Prioridade').selectOption('Alta');
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible();

    const linha = page.getByTestId('tarefa-row').filter({ hasText: tituloTarefa });
    await expect(linha).toBeVisible();
    await expect(linha.getByText('Pendente')).toBeVisible();
    await expect(linha.getByText('Alta')).toBeVisible();

    // Avança o status: Pendente -> Em Andamento -> Concluída
    await linha.getByRole('button', { name: 'Iniciar' }).click();
    await expect(page.getByText('Tarefa marcada como "Em Andamento".')).toBeVisible();
    await expect(linha.getByText('Em Andamento')).toBeVisible();

    await linha.getByRole('button', { name: 'Concluir' }).click();
    await expect(page.getByText('Tarefa marcada como "Concluída".')).toBeVisible();
    await expect(linha.getByText('Concluída')).toBeVisible();

    // Edita o título
    await linha.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Título').fill(tituloEditado);
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Tarefa atualizada com sucesso.')).toBeVisible();

    const linhaEditada = page.getByTestId('tarefa-row').filter({ hasText: tituloEditado });
    await expect(linhaEditada).toBeVisible();

    // Exclui a tarefa
    await linhaEditada.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Tarefa excluída com sucesso.')).toBeVisible();
    await expect(page.getByTestId('tarefa-row').filter({ hasText: tituloEditado })).toHaveCount(0);

    // Limpa o projeto criado para o teste
    await page.getByTestId('sidebar-desktop').getByRole('link', { name: 'Projetos' }).click();
    const card = page.getByTestId('projeto-card').filter({ hasText: nomeProjeto });
    await card.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Projeto excluído com sucesso.')).toBeVisible();
  });
});
