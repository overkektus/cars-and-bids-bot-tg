export interface ILogger {
  log(message: string, data?: any): void;
  error(message: string, error?: Error): void;
}