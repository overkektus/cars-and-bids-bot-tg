import { conversations } from '@grammyjs/conversations';
import { Bot as GrammyBot, MemorySessionStorage, session } from 'grammy';
import { inject, injectable } from 'inversify';

import { BotContext, initialSessionState } from './bot.context';
import { IBot } from './bot.interface';

import { Command } from '../commands/command';
import { StartCommand } from '../commands/start';
import { AddCommand } from '../commands/add';
import { CarListCommand } from '../commands/carList';

import { IConfigService } from '../config/config.interface';

import { TYPES } from '../types';

@injectable()
export class Bot implements IBot {
  bot: GrammyBot<BotContext>;
  commands: Command[];

  constructor(@inject(TYPES.Config) public config: IConfigService) {
    this.bot = new GrammyBot<BotContext>(config.get('TOKEN'));
    this.bot.use(session({
      storage: new MemorySessionStorage(),
      initial: () => initialSessionState
    }));
    this.bot.use(conversations());
    this.commands = [
      new StartCommand(this.bot),
      new AddCommand(this.bot),
      new CarListCommand(this.bot),
    ];
    this.bot.on("callback_query:data", this.catchUnknownButtonEvents);
  }

  private async catchUnknownButtonEvents(ctx: BotContext) {
    console.log("Unknown button event with payload", ctx.callbackQuery?.data);
    await ctx.answerCallbackQuery(); // remove loading animation
  }

  public start(): void {
    this.bot.start();
  }
};
