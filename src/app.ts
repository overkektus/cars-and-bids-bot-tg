import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { IApp } from "./app.interface";
import { IBot } from "./bot/bot.interface";
import { Cron } from "./crons/cron";
import { IMQ } from "./crons/mq.interface";
import { TYPES } from "./types";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.Bot) public bot: IBot,
    @inject(TYPES.CarCheck) public carCheck: Cron,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ,
  ) { }

  async launch() {
    await mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://root:example@localhost:27017/');
    console.log('db connected');

    await this.rabbitMQ.connect();
    console.log('rabbitMQ connected')

    this.carCheck.init();
    this.bot.start();
    console.log('bot started');
  }
}