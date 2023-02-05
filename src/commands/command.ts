import { Bot as GrammyBot } from 'grammy';
import { Menu } from "@grammyjs/menu";

import { BotContext, BotConversation } from '../bot/bot.context';

export abstract class Command {
  constructor(public bot: GrammyBot<BotContext>) { }

  abstract handle(): void;
}