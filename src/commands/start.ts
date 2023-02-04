import { Bot as GrammyBot, Keyboard } from 'grammy';

import { BotContext } from '../bot/bot';
import { Command } from "./command";

export class StartCommand extends Command {
  constructor(bot: GrammyBot<BotContext>) {
    super(bot);
  }

  handle(): void {
    const keyboard = new Keyboard()
      .text('🚗 Add car to observation').text('🗒️ Show list of cars').row();
    this.bot.command('start', ctx => {
      ctx.reply(
        `Hi, ${ctx.message?.from.first_name}.`,
        {
          reply_markup: keyboard
        }
      );
    });
  }
}