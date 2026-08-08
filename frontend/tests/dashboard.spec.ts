import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test('gráficos de barras e pizza desenham as fatias/barras (não ficam em branco)', async ({ page }) => {
    await login(page);

    // Regressão: Pie do recharts com animationDuration + StrictMode (dev) podia computar os
    // setores sem nunca pintar o <path>, deixando o donut em branco. Trocado para
    // isAnimationActive={false}; este teste garante que os elementos visuais existem de fato.
    const barPaths = page.locator('.recharts-bar-rectangle path');
    await expect(barPaths.first()).toBeVisible();
    expect(await barPaths.count()).toBeGreaterThan(0);

    const pieSectorPaths = page.locator('.recharts-pie-sector path');
    await expect(pieSectorPaths.first()).toBeVisible();
    expect(await pieSectorPaths.count()).toBeGreaterThan(0);
  });
});
