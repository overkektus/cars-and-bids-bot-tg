import { Bot as GrammyBot } from 'grammy';

import { BotContext } from '../bot/bot.context';

export abstract class Command {
  constructor(public bot: GrammyBot<BotContext>) { }

  abstract handle(): void;
}