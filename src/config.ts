function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Copy .env.example to .env and fill in the required values.`,
    );
  }
  return value;
}

/**
 * Typed application config sourced exclusively from environment variables.
 *
 * baseUrl — always required; used by playwright.config.ts for API request context
 * gameUrl — required for UI tests and the /refreshToken positive test (token extracted from iframe)
 *
 * Getters are lazy: a missing variable only throws when the value is first accessed,
 * so API-only runs do not fail because GAME_URL is unset (and vice versa).
 */
export const config = {
  get baseUrl() {
    return requireEnv('BASE_URL');
  },
  get gameUrl() {
    return requireEnv('GAME_URL');
  },
};
