import { inject, injectable } from 'inversify';
import nodeCron from 'node-cron';
import { Bot as GrammyBot } from 'grammy';
import { FilterQuery, QueryOptions } from 'mongoose';

import { Cron } from './cron';
import { TYPES } from '../types';
import { IConfigService } from '../services/config/config.interface';
import { IMQ } from '../services/mq/mq.interface';
import { CHECK_QUEUE_NAME } from '../constants';
import { ConsumerMessageType } from '../services/mq/rabbitMQ.service';
import { ICar } from '../models/car.interface';
import { IBot } from '../bot/bot.interface';
import { BotContext } from '../bot/bot.context';
import { IModelService } from '../services/car/model.interface';
import { ILogger } from '../services/logger/loger.interface';

@injectable()
export class CarCheck extends Cron {
  public cronExpression: string;
  public options: nodeCron.ScheduleOptions;

  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.CarService)
    public carService: IModelService<
      ICar,
      FilterQuery<ICar>,
      QueryOptions<ICar>
    >,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) {
    super();
    this.cronExpression = config.get('CRON_CAR_EXPRESSION');
    this.options = {};
    this.task = this.task.bind(this);
  }

  private async task(): Promise<void> {
    this.logger.log('task');
    const car = await this.carService.findById('63fe318119621afe8f950244');
    this.rabbitMQ.sendData(CHECK_QUEUE_NAME, car?._id);
  }

  public init(): void {
    nodeCron.schedule(this.cronExpression, this.task, this.options);
  }
}
