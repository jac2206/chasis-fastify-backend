import { createHash } from "node:crypto";
import type { IRefreshTokenRepository } from "../../../domain/interfaces/repositories/refresh-token.repository.interface";
import { prisma } from "../prisma";

const digest = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async revoke(token: string): Promise<void> {
    const hash = digest(token);
    await prisma.$executeRaw`DELETE FROM test.refresh_tokens WHERE token_hash = ${hash}`;
  }
  async create(token: string, expiresAt: Date): Promise<void> {
    const hash = digest(token);
    await prisma.$executeRaw`INSERT INTO test.refresh_tokens (token_hash, expires_at) VALUES (${hash}, ${expiresAt})`;
  }

  async rotate(token: string, replacement: string, expiresAt: Date): Promise<boolean> {
    const oldHash = digest(token);
    const newHash = digest(replacement);
    return prisma.$transaction(async (tx) => {
      const deleted =
        await tx.$executeRaw`DELETE FROM test.refresh_tokens WHERE token_hash = ${oldHash} AND expires_at > CURRENT_TIMESTAMP`;
      if (deleted !== 1) return false;
      await tx.$executeRaw`INSERT INTO test.refresh_tokens (token_hash, expires_at) VALUES (${newHash}, ${expiresAt})`;
      return true;
    });
  }
}
