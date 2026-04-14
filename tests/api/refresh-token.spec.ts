import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';
import { feature, story, tags, step, attachment } from 'allure-js-commons';

/**
 * POST /refreshToken
 *
 * Confirmed from Swagger + runtime:
 *  - Request body: { token: string }
 *  - Confirmed 200 response: { newToken: string } — errorCode is NOT present on success
 *  - Invalid or empty token → 401, plain-text body: "Invalid token signature"
 *  - Error response is plain text, not JSON — do NOT assert errorCode field on errors
 *
 * Token acquisition strategy (positive test):
 *  - Open GAME_URL in a browser, read iframe#game-iframe src,
 *    extract the `token` query parameter — this token is valid for /refreshToken.
 */
test.describe('POST /refreshToken', () => {
  test('should return 200 with newToken when called with a valid token', async ({ tokenService, page }) => {
    await feature('Token Refresh');
    await story('Valid token');
    await tags('api', 'smoke');

    const token = await step('Extract token from game iframe src', async () => {
      await page.goto(config.gameUrl);
      // Wait until the iframe element carries a src attribute
      await page.waitForSelector('#game-iframe[src]');
      const src = await page.locator('#game-iframe').getAttribute('src');
      if (!src) throw new Error('iframe#game-iframe has no src attribute');

      // src may be absolute or relative — base resolves both cases
      const url = new URL(src, config.gameUrl);
      const t = url.searchParams.get('token');
      if (!t) throw new Error(`No "token" query param in iframe src: ${src}`);
      return t;
    });

    const response = await step('Send POST /refreshToken with extracted token', async () => {
      return tokenService.refresh(token);
    });

    await attachment('Response', JSON.stringify(response, null, 2), 'application/json');

    await step('Verify status is 200', async () => {
      expect(response.status).toBe(200);
    });

    await step('Verify body is a non-null object', async () => {
      expect(typeof response.body).toBe('object');
      expect(response.body).not.toBeNull();
    });

    await step('Verify newToken is a non-empty string', async () => {
      const body = response.body as Record<string, unknown>;
      expect(typeof body.newToken).toBe('string');
      expect(body.newToken).not.toBe('');
    });
  });

  test('should return 401 with plain-text error when called with an invalid token', async ({ tokenService }) => {
    await feature('Token Refresh');
    await story('Invalid token');
    await tags('api', 'negative', 'smoke');

    const response = await step('Send POST /refreshToken with invalid token', async () => {
      return tokenService.refresh('invalid-test-token');
    });

    await attachment('Response', JSON.stringify(response, null, 2), 'application/json');

    await step('Verify status is 401', async () => {
      expect(response.status).toBe(401);
    });

    await step('Verify body contains "Invalid token signature"', async () => {
      // Confirmed runtime behavior: error response is plain text, not JSON.
      // Cast through unknown first — TypeScript infers RefreshTokenResponse (object),
      // but the actual runtime value may be a plain string when JSON parsing fails.
      const raw = response.body as unknown;
      const bodyText = typeof raw === 'string' ? raw : JSON.stringify(raw);
      expect(bodyText).toContain('Invalid token signature');
    });
  });

  test('should return 401 with plain-text error when called with an empty token', async ({ tokenService }) => {
    await feature('Token Refresh');
    await story('Empty token');
    await tags('api', 'negative');

    const response = await step('Send POST /refreshToken with empty token string', async () => {
      return tokenService.refresh('');
    });

    await attachment('Response', JSON.stringify(response, null, 2), 'application/json');

    await step('Verify status is 401', async () => {
      expect(response.status).toBe(401);
    });

    await step('Verify body contains "Invalid token signature"', async () => {
      // Empty token produces the same plain-text error response as an invalid token.
      const raw = response.body as unknown;
      const bodyText = typeof raw === 'string' ? raw : JSON.stringify(raw);
      expect(bodyText).toContain('Invalid token signature');
    });
  });
});
