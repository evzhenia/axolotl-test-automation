/**
 * API type definitions.
 *
 * POLICY: Only confirmed fields are typed explicitly.
 * All response interfaces carry `[key: string]: unknown` to absorb
 * undiscovered fields without TypeScript errors.
 *
 * Use `unknown` for confirmed field names whose value type is not yet verified.
 * Narrow types in tests once observed at runtime.
 */

// ─── POST /refreshToken ───────────────────────────────────────────────────────

/** Confirmed request schema. */
export interface RefreshTokenRequest {
  token: string;
}

/**
 * Confirmed success response shape (HTTP 200).
 * Only `newToken` is present — `errorCode` is NOT returned on success.
 * Error responses (4xx) are plain text, not JSON.
 */
export interface RefreshTokenResponse {
  newToken: string;
  [key: string]: unknown;
}

// ─── GET /test-platform/start ─────────────────────────────────────────────────

/**
 * Confirmed success response shape (HTTP 200).
 * Error responses (5xx) are plain text, not JSON.
 */
export interface TestPlatformResponse {
  launchUrl: string;
}
