export interface OAuthTokenProvider {
  getToken(): Promise<string>;
  invalidateTokenCache(): Promise<void>;
}