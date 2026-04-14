import { HttpClient } from './http-client';
import type { RefreshTokenRequest, RefreshTokenResponse } from './types';

export class TokenService {
  private static readonly PATH = '/refreshToken';

  constructor(private readonly client: HttpClient) {}

  /**
   * POST /refreshToken
   * Sends the provided token and returns the raw API response.
   * No assertions — callers are responsible for verifying the result.
   *
   * TODO: Add required auth headers if confirmed (currently none are confirmed).
   */
  async refresh(token: string) {
    const body: RefreshTokenRequest = { token };
    return this.client.post<RefreshTokenResponse>(TokenService.PATH, body);
  }
}
