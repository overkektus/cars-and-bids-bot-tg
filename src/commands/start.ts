import { Bot as GrammyBot, Keyboard } from 'grammy';

import { BotContext } from '../bot/bot.context';
import { Command } from "./command";

export class StartCommand extends Command {
  constructor(bot: GrammyBot<BotContext>) {
    super(bot);
    bot.command('start', this.commandEnter);
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    const keyboard = new Keyboard()
      .text('🚗 Add car to observation').text('🗒️ Show list of cars').row();

    ctx.reply(
      `Hi, ${ctx.message?.from.first_name}.`,
      {
        reply_markup: keyboard
      }
    );
  }
}