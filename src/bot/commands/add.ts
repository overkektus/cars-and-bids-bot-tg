import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { createConversation } from '@grammyjs/conversations';
import { FilterQuery, QueryOptions } from 'mongoose';
import axios from 'axios';
import { load } from 'cheerio';

import { BotContext, BotConversation } from '../bot.context';
import { Command } from './command';
import { IMQ } from '../../services/mq/mq.interface';
import { TYPES } from '../../types';
import { INITIAL_QUEUE_NAME } from '../../constants';
import { ConsumerMessageType } from '../../services/mq/rabbitMQ.service';
import { IModelService } from '../../services/car/model.interface';
import { ICar } from '../../models/car.interface';

@injectable()
export class AddCommand extends Command {
  constructor(
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.CarService)
    public carService: IModelService<
      ICar,
      FilterQuery<ICar>,
      QueryOptions<ICar>
    >
  ) {
    super();
  }

  public init(bot: GrammyBot<BotContext>): void {
    bot.use(
      createConversation(
        this.addNewCarConversation.bind(this),
        'addNewCarConversation'
      )
    );
    bot.hears('🚗 Add car to observation', this.commandEnter);
    bot.command('add', this.commandEnter);
  }

  public async commandEnter(ctx: BotContext): Promise<void> {
    await ctx.conversation.enter('addNewCarConversation');
  }

  private async addNewCarConversation(
    conversation: BotConversation,
    ctx: BotContext
  ): Promise<void> {
    const userId = ctx.from!.id;

    await ctx.reply('🔗 Please send the URL of the car.');

    const carURL = (await conversation.wait()).message?.text ?? '';

    const isValidURL = this.isValidCarsAndBidsUrl(carURL);

    if (!isValidURL) {
      await ctx.reply('❌ Invalid URL.');
      return;
    }

    const carTitle = await this.grabCarTitle(carURL);

    const existingCarCount = await this.carService.count({
      url: carURL,
      userId,
    });
    if (existingCarCount > 0) {
      await ctx.reply(`❌ The car is already in the list.`);
      return;
    } else {
      await this.carService.create({ url: carURL, userId, carTitle });
      this.rabbitMQ.sendData<string>(INITIAL_QUEUE_NAME, carURL);
      await ctx.reply(`✅ ${carTitle} was successfully added to the /list .`);
    }
  }

  private isValidCarsAndBidsUrl(url: string) {
    const urlRegex =
      /^https?:\/\/carsandbids\.com\/auctions\/[a-zA-Z0-9]+\/[a-zA-Z0-9-]+$/;
    return urlRegex.test(url);
  }

  private async grabCarTitle(carURL: string): Promise<string> {
    const res = await axios.get(carURL);
    const $ = load(res.data);
    const carTitle = $('title')
      .text()
      .slice(0, $('title').text().indexOf('auction'))
      .trim();
    return carTitle;
  }
}
