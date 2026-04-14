import { test, expect } from '../../src/fixtures';
import { feature, story, tags, step, attachment } from 'allure-js-commons';

/**
 * GET /test-platform/start
 *
 * Confirmed runtime behavior:
 *  - Required params: gameId, casinoId, mode
 *  - All required params present → 200, body: { launchUrl: string }
 *  - Missing gameId   → 500, body contains 'pGameIdOrAlias'
 *  - Missing casinoId → 500, body contains 'pCasinoId'
 *  - Missing mode     → 500, body contains 'No message returned from method' or 'AuthenticateAsync'
 */

const TEST_DATA = {
  gameId: 'AxolotlGame',
  casinoId: 'testcasino',
  mode: 'demo',
} as const;

test.describe('GET /test-platform/start', () => {
  test('should return 200 when required params are valid', async ({ testPlatformService }) => {
    await feature('Platform Start');
    await story('Valid required params');
    await tags('api', 'smoke');

    const response = await step('Send GET /test-platform/start with required params', async () => {
      return testPlatformService.start({
        gameId:   TEST_DATA.gameId,
        casinoId: TEST_DATA.casinoId,
        mode:     TEST_DATA.mode,
      });
    });

    await attachment('Response Status', String(response.status), 'text/plain');
    await attachment('Response Body', JSON.stringify(response.body, null, 2), 'application/json');

    await step('Verify status is 200', async () => {
      expect(response.status).toBe(200);
    });

    await step('Verify launchUrl is a non-empty string', async () => {
      expect(typeof response.body.launchUrl).toBe('string');
      expect(response.body.launchUrl).not.toBe('');
    });
  });

  // Negative cases — each omits one required param and expects HTTP 500.
  // Defined as a table and iterated so the structure is written once, not three times.
  // The mode case may return either of two error messages depending on backend auth state.
  type NegativeCase = {
    missing: string;
    storyLabel: string;
    params: { gameId?: string; casinoId?: string; mode?: string };
    assertBodyText: (t: string) => void;
  };

  const negativeCases: NegativeCase[] = [
    {
      missing: 'gameId',
      storyLabel: 'Missing gameId',
      params: { casinoId: TEST_DATA.casinoId, mode: TEST_DATA.mode },
      assertBodyText: (t) => expect(t).toContain('pGameIdOrAlias'),
    },
    {
      missing: 'casinoId',
      storyLabel: 'Missing casinoId',
      params: { gameId: TEST_DATA.gameId, mode: TEST_DATA.mode },
      assertBodyText: (t) => expect(t).toContain('pCasinoId'),
    },
    {
      missing: 'mode',
      storyLabel: 'Missing mode',
      params: { gameId: TEST_DATA.gameId, casinoId: TEST_DATA.casinoId },
      assertBodyText: (t) =>
        expect(
          t.includes('No message returned from method') || t.includes('AuthenticateAsync'),
        ).toBe(true),
    },
  ];

  for (const { missing, storyLabel, params, assertBodyText } of negativeCases) {
    test(`should return 500 when ${missing} is missing`, async ({ testPlatformService }) => {
      await feature('Platform Start');
      await story(storyLabel);
      await tags('api', 'negative');

      const response = await step(
        `Send GET /test-platform/start without ${missing}`,
        async () => testPlatformService.start(params),
      );

      await attachment('Response Status', String(response.status), 'text/plain');
      await attachment('Response Body', JSON.stringify(response.body, null, 2), 'application/json');

      await step('Verify status is 500', async () => {
        expect(response.status).toBe(500);
      });

      await step(`Verify body references missing ${missing} error`, async () => {
        const raw = response.body as unknown;
        const bodyText = typeof raw === 'string' ? raw : JSON.stringify(raw);
        assertBodyText(bodyText);
      });
    });
  }
});
