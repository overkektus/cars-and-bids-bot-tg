export type ILogger = {
  log(message: string, data?: any): void;
  error(message: string, error?: Error): void;
}
