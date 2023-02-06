
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
    bot.hears('🚗 Add car to observation', this.commandEnter)
  }

  async addNewCarConversation(conversation: BotConversation, ctx: BotContext): Promise<void> {
    const userId = ctx.from?.id;
    let isDublicate: boolean = false;
    let carURL: string = '';

    await ctx.reply('Send, please, URL of car.');
    do {
      carURL = (await conversation.wait()).message?.text!;
      // TODO: add URL validation
      isDublicate = !!await carModel.count({ url: carURL, userId });
      if (isDublicate) {
        await ctx.reply('Already exist. Send another URL');
      }
    } while(isDublicate);

    const carTitle = await this.grabCarTitle(carURL);
    await carModel.create({ url: carURL, userId, carTitle });
    ctx.reply(`${carTitle} was succesfully added to list.✅`);
  }

  private async grabCarTitle(carURL: string): Promise<string> {
    const res = await axios.get(carURL);
    let $ = load(res.data);
    const carTitle = $('title').text().slice(0, $('title').text().indexOf('auction')).trim();
    return carTitle;
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    await ctx.conversation.enter('addNewCarConversation');
  }
}