import type { ITokenDurations } from "../domain/interfaces/security/token-durations.interface";
import { env } from "./env";

const durationInSeconds = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 0;
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * multipliers[match[2]];
};

export const tokenDurations: ITokenDurations = {
  accessSeconds: durationInSeconds(env.jwtAccessExpiresIn),
  refreshSeconds: durationInSeconds(env.jwtRefreshExpiresIn),
};
