import { injectable } from 'inversify';
import { Bot } from 'grammy';

import { Command } from './command';
import { BotContext } from '../bot.context';

@injectable()
export class SettingsCommand extends Command {
  constructor() {
    super();
  }

  public init(bot: Bot<BotContext>): void {
    bot.command('settings', this.commandEnter);
    bot.hears('⚙️ Settings', this.commandEnter);
  }

  commandEnter(ctx: BotContext): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
}
