export interface IRefreshTokenRepository {
  create(token: string, expiresAt: Date): Promise<void>;
  rotate(token: string, replacement: string, expiresAt: Date): Promise<boolean>;
  revoke(token: string): Promise<void>;
}
