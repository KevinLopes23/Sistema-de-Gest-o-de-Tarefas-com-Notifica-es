import { defineConfig, devices } from '@playwright/test';

/**
 * Requer a API rodando em http://localhost:5000 com CORS liberado para
 * http://localhost:5173 (ex.: `docker compose up -d postgres backend` com
 * Cors__AllowedOrigins__1=http://localhost:5173, ou a API local via dotnet run).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
