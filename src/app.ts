import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { Bot as GrammyBot } from 'grammy';

import { IApp } from "./app.interface";
import { BotContext } from "./bot/bot.context";
import { IBot } from "./bot/bot.interface";
import { IConfigService } from "./services/config/config.interface";
import { NOTIFICATION_QUEUE_NAME } from "./constants";
import { Cron } from "./crons/cron";
import { IMQ } from "./services/mq/mq.interface";
import { ConsumerMessageType } from "./services/mq/rabbitMQ";
import { INotificationMessage } from "./models/car.interface";
import { TYPES } from "./types";
import { INotifyService } from "./services/notify/notify.interface";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.CarCheck) public carCheck: Cron,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.Notify) public notifyService: INotifyService,
  ) { }

  async launch() {
    await mongoose.set('strictQuery', true);
    await mongoose.connect(this.config.get('MONGODB_URI'));
    console.log('db connected');

    await this.rabbitMQ.connect(this.config.get('RABBITMQ_URI'));
    this.rabbitMQ.assertQueue(NOTIFICATION_QUEUE_NAME);
    console.log('rabbitMQ connected');

    this.carCheck.init();
    this.bot.start();
    console.log('bot started');

    this.rabbitMQ.setConsume(NOTIFICATION_QUEUE_NAME, (data) => {
      const message: INotificationMessage = JSON.parse(data!.content.toString());
      console.log(message);
      this.notifyService.notifyUser(message);
      this.rabbitMQ.accept(data);
    });
  }
}