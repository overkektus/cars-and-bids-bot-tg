export interface ILogger {
  log(scope: string, text: string): void;
  warn(scope: string,text: string): void;
  error(scope: string, text: string): void;
}