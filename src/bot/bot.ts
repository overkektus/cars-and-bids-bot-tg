import { conversations } from '@grammyjs/conversations';
import { Bot as GrammyBot, MemorySessionStorage, session } from 'grammy';
import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';

import { AddCommand } from '../commands/add';
import { CarListCommand } from '../commands/carList';
import { Command } from '../commands/command';
import { StartCommand } from '../commands/start';
import { IConfigService } from '../config/config.interface';

import { TYPES } from '../types';
import { BotContext } from './bot.context';
import { IBot } from './bot.interface';

@injectable()
export class Bot implements IBot {
  bot: GrammyBot<BotContext>;
  commands: Command[] = [];

  constructor(
    @inject(TYPES.Config) public config: IConfigService,
  ) {
    this.bot = new GrammyBot<BotContext>(config.get('TOKEN'));
    this.bot.use(session({
      storage: new MemorySessionStorage(),
      initial: () => ({
        carListMenu: {
          currentPage: 1
        }
      })
    }));
    this.bot.use(conversations());
  }
  
  async init() {
    this.commands = [new StartCommand(this.bot), new AddCommand(this.bot), new CarListCommand(this.bot)];
    for (const command of this.commands) {
      command.handle();
    }

    await mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://root:example@localhost:27017/');
    console.log('db connected');

    this.bot.start();
    console.log('bot started');
  }
};
