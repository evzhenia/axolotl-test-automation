import { test as base } from '@playwright/test';
import { HttpClient } from './api/http-client';
import { TokenService } from './api/token.service';
import { TestPlatformService } from './api/test-platform.service';
import { GamePage } from './ui/game.page';

interface Fixtures {
  httpClient: HttpClient;
  tokenService: TokenService;
  testPlatformService: TestPlatformService;
  gamePage: GamePage;
}

/**
 * Extended Playwright test with project fixtures.
 *
 * All fixtures are test-scoped (default): each test gets fresh instances.
 * Fixtures are lazy: unused fixtures are never instantiated.
 * This means API tests do not launch a browser, and UI tests do not
 * create an API request context unless they explicitly use it.
 */
export const test = base.extend<Fixtures>({
  httpClient: async ({ request }, use) => {
    await use(new HttpClient(request));
  },

  tokenService: async ({ httpClient }, use) => {
    await use(new TokenService(httpClient));
  },

  testPlatformService: async ({ httpClient }, use) => {
    await use(new TestPlatformService(httpClient));
  },

  gamePage: async ({ page }, use) => {
    await use(new GamePage(page));
  },
});

export { expect } from '@playwright/test';
