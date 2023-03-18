import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { ConnectOptions, Mongoose } from 'mongoose';

import { IApp } from './app.interface';
import { BotContext } from './bot/bot.context';
import { IBot } from './bot/bot.interface';
import { IConfigService } from './services/config/config.interface';
import { Cron } from './crons/cron';
import { TYPES } from './types';
import { INotifyService } from './services/notify/notify.interface';
import { IDatabaseService } from './services/db/database.interface';
import { ILogger } from './services/logger/loger.interface';

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.CarCheck) public carCheck: Cron,
    @inject(TYPES.Database)
    public dbService: IDatabaseService<Mongoose, ConnectOptions>,
    @inject(TYPES.NotifyService) public notifyService: INotifyService,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) {}

  async launch() {
    await this.dbService.connect(this.config.get('MONGODB_URI'));

    this.carCheck.init();
    this.bot.start();
    this.logger.log('bot started');
  }
}
