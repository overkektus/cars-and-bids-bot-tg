
import { Bot as GrammyBot } from 'grammy';

import { BotContext, BotConversation } from "../bot/bot.context";
import carModel from '../models/car.model';
import { Command } from "./command";

export class AddCommand extends Command {
  constructor(bot: GrammyBot<BotContext>) {
    super(bot);
    this.conversations.push(this.addNewCarConversation);
  }

  async addNewCarConversation(conversation: BotConversation, ctx: BotContext): Promise<void> {
    await ctx.reply('Send, please, URL of car.');
    const carURL = await conversation.wait();
    // TODO: add URL validation
    await carModel.create({ url: carURL.message?.text, userId: ctx.from?.id });
  }
  
  public handle(): void {
    this.bot.hears('🚗 Add car to observation', async ctx => {
      await ctx.conversation.enter('addNewCarConversation');
    });
  }
}