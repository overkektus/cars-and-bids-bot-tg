
import { Bot as GrammyBot } from 'grammy';
import { createConversation } from '@grammyjs/conversations';
import axios from 'axios';
import { load } from 'cheerio';

import { BotContext, BotConversation } from "../bot/bot.context";
import carModel from '../models/car.model';
import { Command } from "./command";

export class AddCommand extends Command {
  constructor(bot: GrammyBot<BotContext>) {
    super(bot);
    bot.use(createConversation(this.addNewCarConversation.bind(this), 'addNewCarConversation'));
  }

  async addNewCarConversation(conversation: BotConversation, ctx: BotContext): Promise<void> {
    await ctx.reply('Send, please, URL of car.');
    const carURL = (await conversation.wait()).message?.text;
    // TODO: add URL validation
    // TODO: check for dublicates
    if (carURL) {
      const carTitle = await this.grabCarTitle(carURL);
      await carModel.create({ url: carURL, userId: ctx.from?.id, carTitle });
      ctx.reply(`${carTitle} was succesfully added to list.✅`);
    }
  }

  private async grabCarTitle(carURL: string): Promise<string> {
    const res = await axios.get(carURL);
    let $ = load(res.data);
    const carTitle = $('title').text();
    return carTitle;
  }
  
  public handle(): void {
    this.bot.hears('🚗 Add car to observation', async ctx => {
      await ctx.conversation.enter('addNewCarConversation');
    });
  }
}