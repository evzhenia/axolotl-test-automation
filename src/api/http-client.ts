import { APIRequestContext } from '@playwright/test';

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}

/**
 * Thin wrapper around Playwright's APIRequestContext.
 *
 * Responsibilities:
 *  - Execute HTTP requests using the configured baseURL from playwright.config.ts
 *  - Return raw status and parsed body to the caller
 *  - Never throw on non-2xx responses — let callers decide what to assert
 *  - Never make assertions
 *
 * Body parsing: attempts JSON; falls back to raw text on parse failure.
 * Callers receive body as `unknown` and narrow the type as needed.
 */
export class HttpClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<T = unknown>(
    path: string,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const response = await this.request.get(path, { headers });
    const body = await this.parseBody(response);
    return { status: response.status(), body: body as T };
  }

  async post<T = unknown>(
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const response = await this.request.post(path, { data, headers });
    const body = await this.parseBody(response);
    return { status: response.status(), body: body as T };
  }

  private async parseBody(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return await response.text().catch(() => null);
    }
  }
}
