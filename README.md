# axolord-test-automation

Test automation suite for the AxoLord game session. Covers key API contracts and UI interactions using Playwright and TypeScript.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright Test](https://playwright.dev) | Test runner, browser automation, API testing |
| TypeScript | Language (strict mode) |
| [Allure](https://allurereport.org) | Test reporting |
| dotenv | Environment variable loading |

---

## Test Coverage

### API

| Endpoint | Scenarios |
|---|---|
| `POST /refreshToken` | Valid token (extracted from iframe) → 200; invalid token → 401; empty token → 401 |
| `GET /test-platform/start` | All required params → 200; missing gameId / casinoId / mode → 500 |

### UI

| Suite | Scenarios |
|---|---|
| Spin | Canvas loads with non-zero dimensions; spin produces a valid result logged to console |
| Bet Modal | Modal opens and displays all bet values; closing with OK dismisses the modal |

---

## Project Structure

```
tests/
  api/
    refresh-token.spec.ts      # POST /refreshToken
    platform-start.spec.ts     # GET /test-platform/start
  ui/
    spin.spec.ts               # Spin canvas interaction
    bet-modal.spec.ts          # Bet modal DOM assertions
src/
  api/
    http-client.ts             # Thin HTTP wrapper (no assertions)
    token.service.ts           # /refreshToken service
    test-platform.service.ts   # /test-platform/start service
    types.ts                   # Confirmed API types
  ui/
    game.page.ts               # GamePage page object
    canvas-interactor.ts       # Canvas coordinate click utility
  config.ts                    # Environment config (lazy getters)
  fixtures.ts                  # Playwright fixture extensions
playwright.config.ts
```

---

## Prerequisites

- Node.js LTS (v20+)
- npm
- Playwright browsers (installed separately)

---

## Installation

```bash
npm install
npx playwright install
```

---

## Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

```dotenv
# Base URL for API requests — no trailing slash
BASE_URL=https://your-api-host.example.com

# Full URL used to open the game session in the browser
GAME_URL=https://your-game-host.example.com/path/to/game/
```

**Notes:**
- `REFRESH_TOKEN` is **not** required. The positive `/refreshToken` test obtains a fresh token automatically by extracting it from the game iframe's `src` URL at runtime.
- `GAME_URL` is required for both UI tests and the `/refreshToken` positive test.

---

## Running Tests

```bash
# Run all tests
npm test

# API tests only
npm run test:api

# UI tests only
npm run test:ui

# Single file
npx playwright test tests/api/refresh-token.spec.ts

# Playwright UI mode (interactive, with browser preview)
npx playwright test --ui
```

---

## Allure Reports

```bash
# Generate report from last run results
npm run allure:generate

# Open the generated report in a browser
npm run allure:open

# Generate and serve in one step
npm run allure:serve
```

---

## Important Notes

### `POST /refreshToken`
- The positive test navigates to `GAME_URL`, reads the `token` query parameter from the `#game-iframe` src, and uses that token for the request.
- Invalid and empty tokens return HTTP `401` with a plain-text body (`Invalid token signature`), not JSON.

### `GET /test-platform/start`
- Required query parameters: `gameId`, `casinoId`, `mode`.
- Missing any required parameter returns HTTP `500` with a descriptive plain-text error body.

### UI Tests
- The game is rendered inside `#game-iframe`. Game element interactions (Spin, Bet button) are canvas-based and use confirmed relative coordinate positions.
- The Bet modal is rendered in the main page DOM, outside the iframe. Modal assertions use `page.getByText()` and `page.getByRole()`.
- Game startup requires clicking a "Tap anywhere to start" prompt (`.blinking_text`) before the canvas becomes interactive.

---

## Limitations and Assumptions

- Canvas interactions rely on relative coordinate ratios (`xRatio`, `yRatio` as fractions of canvas size). If the game layout changes, coordinates may need recalibration in `src/ui/game.page.ts`.
- The spin result is verified via browser console output. If the game changes its logging format, the console filter in `spin.spec.ts` will need updating.
- API response shapes are typed based on confirmed runtime observations. Fields not yet observed are typed as `unknown`.
- Tests run with `workers: 1` to avoid session conflicts on a shared game backend.