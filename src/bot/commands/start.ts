import { inject, injectable } from 'inversify';
import { Bot as GrammyBot, Keyboard } from 'grammy';

import { BotContext } from '../bot.context';
import { Command } from './command';
import { TYPES } from '../../types';
import { IModelService } from '../../interfaces/model.interface';
import { ISetting } from '../../models/setting.interface';
import { FilterQuery, QueryOptions } from 'mongoose';

@injectable()
export class StartCommand extends Command {
  constructor(
    @inject(TYPES.SettingService)
    public settingService: IModelService<
      ISetting,
      FilterQuery<ISetting>,
      QueryOptions<ISetting>
    >
  ) {
    super();
  }

  public init(bot: GrammyBot<BotContext>): void {
    bot.command('start', this.commandEnter.bind(this));
  }

  async commandEnter(ctx: BotContext): Promise<void> {
    const keyboard = new Keyboard()
      .text('🚗 Add car to observation')
      .text('🗒️ Show list of cars')
      .row()
      .text('⚙️ Settings')
      .text('👨🏻‍💻 Author');

    const settings = (
      await this.settingService.find({ userId: ctx.from?.id })
    )[0];

    if (ctx.from && !settings)
      await this.settingService.create({
        userId: ctx.from.id,
        isBidOnly: false,
      });

    ctx.reply(`Hi, ${ctx.message?.from.first_name}.`, {
      reply_markup: keyboard,
    });
  }
}
