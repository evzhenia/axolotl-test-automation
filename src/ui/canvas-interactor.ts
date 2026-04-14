import { Page, Locator } from '@playwright/test';

/**
 * A position expressed as fractions of the canvas width and height.
 * Values should be between 0.0 (left/top edge) and 1.0 (right/bottom edge).
 *
 * Example: center of canvas = { xRatio: 0.5, yRatio: 0.5 }
 * Example: bottom-center   = { xRatio: 0.5, yRatio: 0.9 }
 */
export interface RelativePosition {
  xRatio: number;
  yRatio: number;
}

/**
 * Handles interaction with the game canvas.
 *
 * Two explicit interaction modes — callers choose; there is no auto-detection:
 *
 *  clickByLocator          — use when the target is a DOM element (button, div overlay, etc.)
 *  clickByRelativePosition — use when the target is canvas-rendered and has no DOM node;
 *                            coordinates are relative to canvas size, not screen pixels,
 *                            so they survive canvas resize and viewport changes.
 */
export class CanvasInteractor {
  constructor(
    private readonly page: Page,
    private readonly canvasLocator: Locator,
  ) {}

  /**
   * Returns the bounding box of the canvas element.
   * Call this to validate the canvas is rendered before interaction.
   * Throws if the canvas is not attached or has no layout (width/height === 0).
   */
  async getBoundingBox() {
    const box = await this.canvasLocator.boundingBox();
    if (!box) {
      throw new Error(
        'Canvas element has no bounding box — it may be hidden, detached, or not yet rendered.',
      );
    }
    if (box.width === 0 || box.height === 0) {
      throw new Error(
        `Canvas has zero dimensions (${box.width}x${box.height}) — game may not have finished loading.`,
      );
    }
    return box;
  }

  /**
   * Click a DOM element by Playwright Locator.
   * Use this when the target element is a real HTML node in the DOM.
   */
  async clickByLocator(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Click a canvas position using coordinates relative to the canvas bounding box.
   *
   * The absolute screen position is computed at call time from the current bounding box,
   * so this is safe across different viewport sizes and canvas scaling.
   *
   * @param position - xRatio and yRatio as fractions of canvas width/height (0.0–1.0)
   */
  async clickByRelativePosition(position: RelativePosition): Promise<void> {
    const box = await this.getBoundingBox();
    const x = box.x + box.width * position.xRatio;
    const y = box.y + box.height * position.yRatio;
    await this.page.mouse.click(x, y);
  }
}
