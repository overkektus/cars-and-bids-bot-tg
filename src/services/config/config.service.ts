import 'reflect-metadata';
import path from 'path';
import { config, DotenvParseOutput } from 'dotenv';
import { injectable } from 'inversify';
import { IConfigService } from './config.interface';

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput;

  constructor() {
    const filename = `.env.${process.env.NODE_ENV}`;
    const { error, parsed } = config({
      path: `${path.resolve(process.cwd(), filename)}`,
    });
    if (error) {
      throw new Error(`Не найден файл ${filename}`);
    }
    if (!parsed) {
      throw new Error(`Пустой файл ${filename}`);
    }
    this.config = parsed;
  }

  get(key: string): string {
    const res = this.config[key];
    if (!res) {
      throw new Error('Нет такого ключа');
    }
    return res;
  }
}
