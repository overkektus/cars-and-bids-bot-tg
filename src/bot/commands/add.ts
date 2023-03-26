import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { createConversation } from '@grammyjs/conversations';
import { FilterQuery, QueryOptions } from 'mongoose';

import { BotContext, BotConversation } from '../bot.context';
import { Command } from './command';
import { TYPES } from '../../types';
import { IModelService } from '../../interfaces/model.interface';
import { ICar, INotificationMessage } from '../../models/car.interface';
import { IParser } from '../../services/parser/parser.interface';

@injectable()
export class AddCommand extends Command {
  constructor(
    @inject(TYPES.ParserService)
    public parserService: IParser<INotificationMessage>,
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

    const isActionEnd = await this.parserService.checkIsActionEnd(carURL);

    if (isActionEnd) {
      await ctx.reply('❌ Action ended.');
    }

    const carTitle = await this.parserService.getCarTitle(carURL);

    const existingCarCount = await this.carService.count({
      url: carURL,
      userId,
    });

    if (existingCarCount > 0) {
      await ctx.reply(`❌ The car is already in the list.`);
      return;
    }

    await this.carService.create({ url: carURL, userId, carTitle });
    await this.parserService.setInitialLastEventId(carURL);
    await ctx.reply(`✅ ${carTitle} was successfully added to the /list .`);
  }

  private isValidCarsAndBidsUrl(url: string): boolean {
    const urlRegex =
      /^https?:\/\/carsandbids\.com\/auctions\/[a-zA-Z0-9]+\/[a-zA-Z0-9-]+$/;
    return urlRegex.test(url);
  }
}
