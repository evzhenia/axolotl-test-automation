import { HttpClient } from './http-client';
import type { TestPlatformResponse } from './types';

/**
 * Query parameters for GET /test-platform/start.
 *
 * Required: gameId, casinoId, mode — missing any returns HTTP 500.
 * All others are optional; undefined values are excluded from the query string.
 */
export interface TestPlatformParams {
  gameId?: string;
  casinoId?: string;
  mode?: string;
  [key: string]: string | undefined;
}

export class TestPlatformService {
  private static readonly PATH = '/test-platform/start';

  constructor(private readonly client: HttpClient) {}

  /**
   * GET /test-platform/start
   *
   * Query params are appended to the path as a query string.
   * `undefined` and empty-string values are omitted.
   */
  async start(params?: TestPlatformParams) {
    const path = params ? buildPath(TestPlatformService.PATH, params) : TestPlatformService.PATH;
    return this.client.get<TestPlatformResponse>(path);
  }
}

function buildPath(base: string, params: Record<string, string | undefined>): string {
  const defined = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== '',
  );
  if (defined.length === 0) return base;
  return `${base}?${new URLSearchParams(Object.fromEntries(defined)).toString()}`;
}
