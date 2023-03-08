import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { Menu, MenuRange } from '@grammyjs/menu';
import { createConversation } from '@grammyjs/conversations';
import { FilterQuery, QueryOptions } from 'mongoose';

import { BotContext, BotConversation } from '../bot.context';
import { Command } from './command';
import { ICar } from '../../models/car.interface';
import { IModelService } from '../../services/car/model.interface';
import { TYPES } from '../../types';
import { ILogger } from '../../services/logger/loger.interface';

const carPerPage = 3;

@injectable()
export class CarListCommand extends Command {
  constructor(
    @inject(TYPES.LoggerService) public logger: ILogger,
    @inject(TYPES.CarService)
    public carService: IModelService<
      ICar,
      FilterQuery<ICar>,
      QueryOptions<ICar>
    >
  ) {
    super();
  }

  public carMenu: Menu<BotContext> = new Menu<BotContext>('car')
    .dynamic(async (ctx: BotContext, range: MenuRange<BotContext>) => {
      const currentCar = await this.carService.findById(
        ctx.session.carListMenu.currentCarId!
      );

      if (!currentCar) return;

      range.text(currentCar.carTitle);
    })
    .row()
    .text('back', (ctx) => ctx.menu.back())
    .text('update')
    .text('delete', async (ctx) => {
      const car = await this.carService.findById(
        ctx.session.carListMenu.currentCarId!
      );

      if (!car) {
        this.logger.warn(
          "Can't find a car with id: ",
          ctx.session.carListMenu.currentCarId
        );
        return ctx.menu.back();
      }

      await this.carService.delete(car._id);

      const carCount = await this.carService.count({ userId: ctx.from?.id });
      const isLastCarInPage = !(carCount % carPerPage);

      if (isLastCarInPage && carCount > 0) {
        ctx.session.carListMenu.currentPage--;
      }

      if (isLastCarInPage && carCount === 0) {
        await ctx.menu.close();
        return ctx.reply(
          'No active tracking found. To track the car, start a new /add 🔎'
        );
      }
      ctx.menu.update();
      ctx.menu.back();
    });

  public carListMenu: Menu<BotContext> = new Menu<BotContext>('car-list')
    .dynamic(async (ctx: BotContext, range: MenuRange<BotContext>) => {
      const carList = await this.carService.find(
        { userId: ctx.from?.id },
        {
          limit: carPerPage,
          skip: (ctx.session.carListMenu.currentPage - 1) * carPerPage,
        }
      );

      carList.forEach((car) => {
        range
          .submenu(
            car.carTitle,
            'car',
            (ctx) => (ctx.session.carListMenu.currentCarId = car._id)
          )
          .row();
      });

      return range;
    })
    .text('<', async (ctx) => {
      if (ctx.session.carListMenu.currentPage !== 1) {
        ctx.session.carListMenu.currentPage--;
        ctx.menu.update();
      }
    })
    .text(async (ctx) => {
      const carCount = await this.carService.count({ userId: ctx.from?.id });
      const pages = Math.ceil(carCount / carPerPage);
      return `${ctx.session.carListMenu.currentPage}/${pages}`;
    })
    .text('>', async (ctx) => {
      const carCount = await this.carService.count({ userId: ctx.from?.id });
      const pages = Math.ceil(carCount / carPerPage);
      if (ctx.session.carListMenu.currentPage !== pages) {
        ctx.session.carListMenu.currentPage++;
        ctx.menu.update();
      }
    })
    .row();

  public init(bot: GrammyBot<BotContext>): void {
    this.carListMenu.register(this.carMenu);
    bot.use(this.carListMenu);
    bot.use(
      createConversation(
        this.listOfObservableCars.bind(this),
        'listOfObservableCars'
      )
    );
    bot.hears('🗒️ Show list of cars', this.commandEnter);
    bot.command('list', this.commandEnter);
  }

  private async listOfObservableCars(
    conversation: BotConversation,
    ctx: BotContext
  ): Promise<void> {
    const carList = await this.carService.find({ userId: ctx.from?.id });
    if (carList.length === 0) {
      await ctx.reply(
        'No active tracking found. To track the car, start a new /add 🔎'
      );
    } else {
      await ctx.reply('list', { reply_markup: this.carListMenu });
    }
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    await ctx.conversation.enter('listOfObservableCars');
  }
}
