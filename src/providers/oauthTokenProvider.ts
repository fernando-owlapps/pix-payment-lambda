// providers/oauthTokenProvider.ts

export interface OAuthTokenProvider {
  getToken(): Promise<string>;
  invalidateTokenCache(): Promise<void>;
}
