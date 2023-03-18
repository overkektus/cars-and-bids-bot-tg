import { inject, injectable } from 'inversify';
import nodeCron from 'node-cron';
import { Bot as GrammyBot } from 'grammy';
import { FilterQuery, QueryOptions } from 'mongoose';

import { Cron } from './cron';
import { TYPES } from '../types';
import { IConfigService } from '../services/config/config.interface';
import { ICar, INotificationMessage } from '../models/car.interface';
import { IBot } from '../bot/bot.interface';
import { BotContext } from '../bot/bot.context';
import { IModelService } from '../services/car/model.interface';
import { ILogger } from '../services/logger/loger.interface';
import { IParser } from '../services/parser/parser.interface';
import { INotifyService } from '../services/notify/notify.interface';

@injectable()
export class CarCheck extends Cron {
  public cronExpression: string;
  public options: nodeCron.ScheduleOptions;

  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.CarService)
    public carService: IModelService<
      ICar,
      FilterQuery<ICar>,
      QueryOptions<ICar>
    >,
    @inject(TYPES.LoggerService) public logger: ILogger,
    @inject(TYPES.ParserService)
    public parserService: IParser<INotificationMessage>,
    @inject(TYPES.NotifyService) public notifyService: INotifyService
  ) {
    super();
    this.cronExpression = config.get('CRON_CAR_EXPRESSION');
    this.options = {};
    this.task = this.task.bind(this);
  }

  private async task(): Promise<void> {
    const auctions = await this.carService.findAll();
    const checkResults: Array<INotificationMessage | null> = await Promise.all(
      auctions.map((auction) =>
        this.parserService.checkAuctionUpdates(auction._id)
      )
    );
    checkResults.map((res) =>
      res ? this.notifyService.notifyUser(res) : null
    );
  }

  public init(): void {
    nodeCron.schedule(this.cronExpression, this.task, this.options);
  }
}
