import { Bot as GrammyBot } from 'grammy';
import { Menu, MenuRange, } from "@grammyjs/menu";
import { createConversation } from '@grammyjs/conversations';

import { BotContext, BotConversation } from "../bot/bot.context";
import { Command } from "./command";
import carModel from '../models/car.model';

const carPerPage: number = 3;

export class CarListCommand extends Command {
  public carMenu: Menu<BotContext> = new Menu<BotContext>('car')
    .dynamic(async (ctx: BotContext, range: MenuRange<BotContext>) => {
      const currentCar = (await carModel.findById(ctx.session.carListMenu.currentCarId))!;
      range.text(currentCar.carTitle);
    }).row()
    .text('back', (ctx) => ctx.menu.back())
    .text('update')
    .text('delete', async (ctx) => {
      await carModel.findByIdAndDelete(ctx.session.carListMenu.currentCarId);
      const carCount = await carModel.count({ userId: ctx.from?.id });
      const isLastCarInPage = !(carCount % carPerPage);
      
      if (isLastCarInPage && carCount > 0) ctx.session.carListMenu.currentPage--;
      ctx.menu.update();
      ctx.menu.back();
    });

  public carListMenu: Menu<BotContext> = new Menu<BotContext>('car-list')
    .dynamic(async (ctx: BotContext, range: MenuRange<BotContext>) => {
      const offset = (ctx.session.carListMenu.currentPage - 1) * carPerPage;
      const carList = await carModel.find({ userId: ctx.from?.id }).skip(offset).limit(carPerPage);
      carList.forEach(car => {
        range
          .submenu(car.carTitle, 'car', (ctx) => ctx.session.carListMenu.currentCarId = car.id)
          .row();
      });
      // TODO: check if it's not empty
      return range;
    })
    .text("<", async (ctx) => {
      if (ctx.session.carListMenu.currentPage !== 1) {
        ctx.session.carListMenu.currentPage--;
        ctx.menu.update();
      }
    })
    .text(async (ctx) => {
      const carCount = await carModel.count({ userId: ctx.from?.id });
      const pages = Math.ceil(carCount / carPerPage);
      return `${ctx.session.carListMenu.currentPage}/${pages}`;
    })
    .text(">", async (ctx) => {
      const carCount = await carModel.count({ userId: ctx.from?.id });
      const pages = Math.ceil(carCount / carPerPage);
      if (ctx.session.carListMenu.currentPage !== pages) {
        ctx.session.carListMenu.currentPage++;
        ctx.menu.update();
      }
    })
    .row();

  constructor(bot: GrammyBot<BotContext>) {
    super(bot);
    this.carListMenu.register(this.carMenu);
    bot.use(this.carListMenu);
    bot.use(createConversation(this.listOfObservableCars.bind(this), 'listOfObservableCars'));
    bot.hears('🗒️ Show list of cars', this.commandEnter);
  }

  private async listOfObservableCars(conversation: BotConversation, ctx: BotContext): Promise<void> {
    const carList = await carModel.find({ userId: ctx.from?.id });
    if (carList.length === 0) {
      await ctx.reply('No active tracking found. To track the car, start a new /add 🔎');
    } else {
      await ctx.reply('list', { reply_markup: this.carListMenu });
    }
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    await ctx.conversation.enter('listOfObservableCars');
  }
}