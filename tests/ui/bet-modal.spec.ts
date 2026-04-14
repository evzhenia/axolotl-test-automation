import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';
import { feature, story, tags, step } from 'allure-js-commons';

test.describe('Bet Modal', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.navigate(config.gameUrl);
    await gamePage.waitForGameReady();
  });

  test('should open bet modal and display required bet values', async ({ gamePage, page }) => {
    await feature('Bet Modal');
    await story('Modal opens and displays bet values');
    await tags('ui', 'smoke');

    // Bet modal is rendered in the main DOM (outside the game iframe)
    await step('Click Bet button', async () => {
      await gamePage.clickBet();
    });

    await step('Verify modal title "Select your bet USD" is visible', async () => {
      await expect(page.getByText('Select your bet USD')).toBeVisible();
    });

    await step('Verify bet value 0.2 is visible', async () => {
      await expect(page.getByText('0.2', { exact: true })).toBeVisible();
    });

    await step('Verify bet value 0.4 is visible', async () => {
      await expect(page.getByText('0.4', { exact: true })).toBeVisible();
    });

    await step('Verify bet value 0.5 is visible', async () => {
      await expect(page.getByText('0.5', { exact: true })).toBeVisible();
    });

    await step('Verify bet value 0.8 is visible', async () => {
      await expect(page.getByText('0.8', { exact: true })).toBeVisible();
    });
  });

  test('should close bet modal when OK is clicked', async ({ gamePage, page }) => {
    await feature('Bet Modal');
    await story('Modal closes on OK click');
    await tags('ui', 'regression');

    // Bet modal is rendered in the main DOM (outside the game iframe)
    const modalTitle = page.getByText('Select your bet USD');

    await step('Click Bet button', async () => {
      await gamePage.clickBet();
    });

    await step('Verify modal is visible', async () => {
      await expect(modalTitle).toBeVisible();
    });

    await step('Click OK button', async () => {
      await page.getByRole('button', { name: 'OK' }).click();
    });

    await step('Verify modal title is no longer visible', async () => {
      await expect(modalTitle).not.toBeVisible();
    });
  });
});
