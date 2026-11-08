export interface ILogger {
  info(context: string, message: string, meta?: unknown): void;
  warn(context: string, message: string, meta?: unknown): void;
  error(context: string, message: string, meta?: unknown): void;
}
