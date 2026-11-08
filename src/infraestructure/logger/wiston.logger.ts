import { ILogger } from "../../domain/interfaces/logger.interface";
import { logger } from "./logger";

export class WinstonLogger implements ILogger {
  info(context: string, message: string, meta?: unknown): void {
    logger.info({ context, message, meta });
  }

  warn(context: string, message: string, meta?: unknown): void {
    logger.warn({ context, message, meta });
  }

  error(context: string, message: string, meta?: unknown): void {
    logger.error({ context, message, meta });
  }
}
