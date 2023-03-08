import { injectable } from 'inversify';
import { Bot } from 'grammy';
import { Menu } from '@grammyjs/menu';

import { Command } from './command';
import { BotContext } from '../bot.context';

@injectable()
export class AuthorCommand extends Command {
  constructor() {
    super();
  }

  public linkListMenu: Menu<BotContext> = new Menu<BotContext>('linkList')
    .url('💼 LinkedIn', 'https://www.linkedin.com/in/egor-piskunov/')
    .url('🐙 GitHub', 'https://github.com/overkektus');

  public init(bot: Bot<BotContext>): void {
    bot.use(this.linkListMenu);
    bot.command('author', this.commandEnter.bind(this));
    bot.hears('👨🏻‍💻 Author', this.commandEnter.bind(this));
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    await ctx.reply('My social links', { reply_markup: this.linkListMenu });
  }
}
