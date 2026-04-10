/** OAuth token response from Yiwugo Open Platform */
export interface YiwugoTokenResponse {
  access_token: string;
  token_type: string; // Usually "Bearer"
  expires_in: number; // Token expiration in seconds
  refresh_token?: string;
  scope?: string;
}

/** Token with metadata for storage and refresh */
export interface StoredToken extends YiwugoTokenResponse {
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (createdAt + expires_in)
}

/** OAuth authorization code response */
export interface OAuthAuthorizationCodeResponse {
  code: string;
  state: string;
}

/** OAuth error response */
export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
}
