import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';
import { feature, story, tags, step } from 'allure-js-commons';
import type { ConsoleMessage } from '@playwright/test';

test.describe('Spin', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.navigate(config.gameUrl);
    await gamePage.waitForGameReady();
  });

  test('should load the game canvas with non-zero dimensions', async ({ gamePage }) => {
    await feature('Spin');
    await story('Game canvas loads');
    await tags('ui', 'smoke');

    await step('Verify canvas is visible', async () => {
      await expect(gamePage.canvas).toBeVisible();
    });

    const box = await step('Get canvas bounding box', async () => {
      return gamePage.canvas.boundingBox();
    });

    await step('Verify canvas has non-zero dimensions', async () => {
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });
  });

  test('should produce a valid spin result in console after clicking Spin', async ({
    gamePage,
    page,
  }) => {
    await feature('Spin');
    await story('Spin result logged to console');
    await tags('ui', 'smoke');

    // The game renders entirely on a canvas — there is no DOM state to assert against after a spin.
    // The game logs the spin result as a JS object to the console after each spin.
    // We intercept that object, identified by the presence of TotalWin and States fields.
    const spinResults: Record<string, unknown>[] = [];

    const consoleHandler = async (msg: ConsoleMessage) => {
      for (const arg of msg.args()) {
        try {
          const val = await arg.jsonValue();
          if (
            typeof val === 'object' &&
            val !== null &&
            'TotalWin' in (val as object) &&
            'States' in (val as object)
          ) {
            spinResults.push(val as Record<string, unknown>);
          }
        } catch {
          // arg is not JSON-serializable — skip
        }
      }
    };

    page.on('console', consoleHandler);

    await step('Click Spin button', async () => {
      await gamePage.clickSpin();
    });

    const spinResult = await step('Wait for spin result in console output', async () => {
      await expect
        .poll(() => spinResults.length, { timeout: 15_000 })
        .toBeGreaterThan(0);
      return spinResults[0];
    });

    page.off('console', consoleHandler);

    await step('Verify Id is present and is a string', async () => {
      expect(typeof spinResult.Id).toBe('string');
    });

    await step('Verify TotalWin is a string', async () => {
      expect(typeof spinResult.TotalWin).toBe('string');
    });

    await step('Verify Balance is a string', async () => {
      expect(typeof spinResult.Balance).toBe('string');
    });

    await step('Verify States is an array', async () => {
      expect(Array.isArray(spinResult.States)).toBe(true);
    });
  });
});
