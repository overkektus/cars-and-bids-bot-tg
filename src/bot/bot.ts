import { inject, injectable } from 'inversify';
import { Bot as GrammyBot, MemorySessionStorage, session } from 'grammy';
import { conversations } from '@grammyjs/conversations';

import { BotContext, initialSessionState } from './bot.context';
import { IBot } from './bot.interface';
import { Command } from '../commands/command';
import { IConfigService } from '../config/config.interface';
import { TYPES } from '../types';

@injectable()
export class Bot implements IBot {
  bot: GrammyBot<BotContext>;
  commands: Command[];

  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.StartCommand) public startCommand: Command,
    @inject(TYPES.AddCommand) public addCommand: Command,
    @inject(TYPES.CarListCommand) public carListCommand: Command,
  ) {
    this.bot = new GrammyBot<BotContext>(config.get('TOKEN'));
    this.bot.use(session({
      storage: new MemorySessionStorage(),
      initial: () => initialSessionState
    }));
    this.bot.use(conversations());
    this.commands = [startCommand, addCommand, carListCommand];
    this.commands.forEach((command) => command.init(this.bot));
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
