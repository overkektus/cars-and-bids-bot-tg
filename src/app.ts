import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import cron from "node-cron";

import { IApp } from "./app.interface";
import { IBot } from "./bot/bot.interface";
import { Cron } from "./crons/cron";
import { TYPES } from "./types";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.Bot) public bot: IBot,
    @inject(TYPES.CarCheck) public carCheck: Cron
  ) { }

  async launch() {
    await mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://root:example@localhost:27017/');
    console.log('db connected');

    cron.schedule(this.carCheck.cronExpression, this.carCheck.task, this.carCheck.options);
    this.bot.start();
    console.log('bot started');
  }
}