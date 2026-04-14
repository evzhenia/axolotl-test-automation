import { Page, Locator, FrameLocator } from '@playwright/test';
import { CanvasInteractor } from './canvas-interactor';

/**
 * DOM selectors for interactive game elements.
 * All locators are resolved inside the '#game-iframe' frame context.
 *
 * Spin and Bet buttons are canvas-rendered — their DOM selectors will not match,
 * so clicks fall through to CANVAS_POSITIONS coordinate clicks.
 */
const SELECTORS = {
  canvas: 'canvas',
  spinButton: '[data-testid="spin-button"]',
  betButton: '[data-testid="bet-button"]',
};

/**
 * Confirmed canvas positions for canvas-rendered elements.
 * Values are fractions of canvas width (xRatio) and height (yRatio): 0.0–1.0.
 */
const CANVAS_POSITIONS = {
  spinButton: { xRatio: 0.90, yRatio: 0.48 },
  betButton:  { xRatio: 0.96, yRatio: 0.33 },
} as const;

export class GamePage {
  readonly canvas: Locator;
  private readonly frame: FrameLocator;
  private readonly blinkingText: Locator;
  private readonly interactor: CanvasInteractor;

  constructor(private readonly page: Page) {
    // The game is rendered inside an iframe. All game element lookups must go
    // through this frameLocator — using page.locator() directly would miss them.
    this.frame = page.frameLocator('#game-iframe');
    this.canvas = this.frame.locator(SELECTORS.canvas);
    this.blinkingText = this.frame.locator('.blinking_text');
    this.interactor = new CanvasInteractor(page, this.canvas);
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Waits until the game is ready to accept interactions.
   *
   * Game requires user interaction; waiting for 'Tap anywhere to start' prompt.
   * The .blinking_text element appears before the game engine initialises and
   * disappears once activation completes — canvas only renders after that.
   *
   * Sequence:
   *   1. Wait for .blinking_text to be visible (game shell is ready for input)
   *   2. Click .blinking_text (simulates required user interaction)
   *   3. Wait for .blinking_text to disappear (activation confirmed)
   *   4. Wait for canvas to appear (game engine is now running)
   */
  async waitForGameReady(): Promise<void> {
    await this.blinkingText.waitFor({ state: 'visible' });
    await this.blinkingText.click();
    await this.blinkingText.waitFor({ state: 'hidden' });
    await this.canvas.waitFor({ state: 'visible' });
  }

  /**
   * Clicks the Spin button.
   * Spin is canvas-rendered; the DOM locator will not match and the click
   * falls through to the confirmed canvas coordinate position.
   */
  async clickSpin(): Promise<void> {
    const locator = this.frame.locator(SELECTORS.spinButton);
    if ((await locator.count()) > 0) {
      await this.interactor.clickByLocator(locator);
    } else {
      await this.interactor.clickByRelativePosition(CANVAS_POSITIONS.spinButton);
    }
  }

  /**
   * Clicks the Bet button to open the betting modal.
   * Bet button is canvas-rendered; the DOM locator will not match and the click
   * falls through to the confirmed canvas coordinate position.
   */
  async clickBet(): Promise<void> {
    const locator = this.frame.locator(SELECTORS.betButton);
    if ((await locator.count()) > 0) {
      await this.interactor.clickByLocator(locator);
    } else {
      await this.interactor.clickByRelativePosition(CANVAS_POSITIONS.betButton);
    }
  }

}
