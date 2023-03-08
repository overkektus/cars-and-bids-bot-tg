import { injectable } from 'inversify';
import winston from 'winston';

@injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
      transports: [new winston.transports.Console()],
    });
  }

  public log(message: string, data?: any) {
    this.logger.log('info', message, data);
  }

  public error(message: string, error?: Error) {
    this.logger.log('error', message, { error });
  }
}
