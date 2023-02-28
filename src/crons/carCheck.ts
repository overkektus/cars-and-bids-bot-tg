import { inject, injectable } from "inversify";
import nodeCron from "node-cron";
import { Bot as GrammyBot } from 'grammy';

import { Cron } from "./cron";
import { TYPES } from '../types';
import { IConfigService } from "../services/config/config.interface";
import { IMQ } from "../services/mq/mq.interface";
import { CHECK_QUEUE_NAME } from "../constants";
import carModel from "../models/car.model";
import { ConsumerMessageType } from "../services/mq/rabbitMQ.service";
import { INotificationMessage } from "../models/car.interface";
import { IBot } from "../bot/bot.interface";
import { BotContext } from "../bot/bot.context";

@injectable()
export class CarCheck extends Cron {
  public cronExpression: string;
  public options: nodeCron.ScheduleOptions;
  
  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
  ) {
    super();
    this.cronExpression = config.get('CRON_CAR_EXPRESSION');
    this.options = {};
    this.task = this.task.bind(this);
  }

  private async task(): Promise<void> {
    console.log('task')
    const car = await carModel.findById("63fe318119621afe8f950244");
    this.rabbitMQ.sendData(CHECK_QUEUE_NAME, car?.id);
  }

  public async notification(message: INotificationMessage): Promise<void> {
    const car = await carModel.findById(message.carId);

    if (!car) {
      console.log('car not found');
      return;
    }

    await Promise.all(message.actions.map(action => {
      this.bot.bot.api.sendMessage(car.userId, `
        New ${action?.type} on ${car.url} action. \n
        ${action?.type === 'bid' && action.value}
        ${action?.type === 'comment' && action.comment}
      `)
      }
    ));
  }

  public init(): void {
    nodeCron.schedule(this.cronExpression, this.task, this.options);
  }
}