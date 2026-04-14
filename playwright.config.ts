import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false,
      },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/tests/api/**/*.spec.ts',
    },
    {
      name: 'ui',
      testMatch: '**/tests/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});