import { inject, injectable } from "inversify";
import { Bot as GrammyBot } from 'grammy';
import { Connection, ConnectOptions, Model, model } from "mongoose";

import { IApp } from "./app.interface";
import { BotContext } from "./bot/bot.context";
import { IBot } from "./bot/bot.interface";
import { IConfigService } from "./services/config/config.interface";
import { NOTIFICATION_QUEUE_NAME } from "./constants";
import { Cron } from "./crons/cron";
import { IMQ } from "./services/mq/mq.interface";
import { ConsumerMessageType } from "./services/mq/rabbitMQ.service";
import { ICar, INotificationMessage } from "./models/car.interface";
import { TYPES } from "./types";
import { INotifyService } from "./services/notify/notify.interface";
import { IDatabaseService } from "./services/db/database.interface";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.CarCheck) public carCheck: Cron,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.Database) public dbService: IDatabaseService<Connection, ConnectOptions>,
    @inject(TYPES.Notify) public notifyService: INotifyService,
  ) { }

  async launch() {
    await this.dbService.connect(this.config.get('MONGODB_URI'));

    await this.rabbitMQ.connect(this.config.get('RABBITMQ_URI'));
    this.rabbitMQ.assertQueue(NOTIFICATION_QUEUE_NAME);

    // this.carCheck.init();
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