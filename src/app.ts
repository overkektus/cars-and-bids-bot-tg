import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { IApp } from "./app.interface";
import { IBot } from "./bot/bot.interface";
import { TYPES } from "./types";

@injectable()
export class App implements IApp {
  constructor(@inject(TYPES.Bot) public bot: IBot) { }

  async launch() {
    await mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://root:example@localhost:27017/');
    console.log('db connected');

    this.bot.start();
    console.log('bot started');
  }
}