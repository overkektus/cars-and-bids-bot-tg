import { injectable } from "inversify";
import chalk from "chalk";

import { ILogger } from "./loger.interface";

@injectable()
export class ConsoleLogger implements ILogger {
  log(scope: string, text: string): void {
    console.log(`[${chalk.bgBlue(scope)}] ${chalk.blue(text)}`);
  }
  warn(scope: string, text: string): void {
    console.warn(`[${chalk.bgYellow(scope)}] ${chalk.yellow(text)}`);
  }
  error(scope: string, text: string): void {
    console.error(`[${chalk.bgRed(scope)}] ${chalk.red(text)}`);
  }
}