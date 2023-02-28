import { injectable } from 'inversify';
import { Bot as GrammyBot, Keyboard } from 'grammy';

import { BotContext } from '../bot.context';
import { Command } from "./command";

@injectable()
export class StartCommand extends Command {
  constructor() {
    super();
  }

  public init(bot: GrammyBot<BotContext>): void {
    bot.command('start', this.commandEnter);
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    const keyboard = new Keyboard()
      .text('🚗 Add car to observation').text('🗒️ Show list of cars').row()
      .text('⚙️ Settings').text('👨🏻‍💻 Author');

    ctx.reply(
      `Hi, ${ctx.message?.from.first_name}.`,
      {
        reply_markup: keyboard
      }
    );
  }
}