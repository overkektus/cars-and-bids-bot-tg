import { inject, injectable } from 'inversify';
import { Bot as GrammyBot, MemorySessionStorage, session } from 'grammy';
import { conversations } from '@grammyjs/conversations';

import { BotContext, initialSessionState } from './bot.context';
import { IBot } from './bot.interface';
import { Command } from './commands/command';
import { IConfigService } from '../services/config/config.interface';
import { TYPES } from '../types';
import { ILogger } from '../services/logger/loger.interface';

@injectable()
export class Bot implements IBot<GrammyBot<BotContext>> {
  public bot: GrammyBot<BotContext>;
  commands: Command[];

  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.AddCommand) public addCommand: Command,
    @inject(TYPES.AuthorCommand) public authorCommand: Command,
    @inject(TYPES.StartCommand) public startCommand: Command,
    @inject(TYPES.CarListCommand) public carListCommand: Command,
    @inject(TYPES.LoggerService) public logger: ILogger,
  ) {
    this.bot = new GrammyBot<BotContext>(config.get('TOKEN'));
    this.bot.use(session({
      storage: new MemorySessionStorage(),
      initial: () => initialSessionState
    }));
    this.bot.use(conversations());
    this.commands = [addCommand, authorCommand, startCommand, carListCommand];
    this.commands.forEach((command) => command.init(this.bot));
    this.bot.on("callback_query:data", this.catchUnknownButtonEvents);
  }

  private async catchUnknownButtonEvents(ctx: BotContext) {
    this.logger.error("Unknown button event with payload", new Error(ctx.callbackQuery?.data));
    await ctx.answerCallbackQuery(); // remove loading animation
  }

  public start(): void {
    this.bot.start();
  }
};
