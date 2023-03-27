import { inject, injectable } from 'inversify';
import { Bot } from 'grammy';
import { Menu } from '@grammyjs/menu';
import { createConversation } from '@grammyjs/conversations';

import { Command } from './command';
import { BotContext, BotConversation } from '../bot.context';
import { TYPES } from '../../types';
import { IModelService } from '../../interfaces/model.interface';
import { ISetting } from '../../models/setting.interface';
import { FilterQuery, QueryOptions } from 'mongoose';

@injectable()
export class SettingsCommand extends Command {
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

  public settingsMenu: Menu<BotContext> = new Menu<BotContext>('setting-menu')
    .text('Receive only bid updates')
    .text(
      async (ctx) => {
        const settings = (
          await this.settingService.find({ userId: ctx.from?.id })
        )[0];
        return settings.isBidOnly ? 'ON 🔵' : 'OFF 🔴';
      },
      async (ctx) => {
        const settings = (
          await this.settingService.find({ userId: ctx.from?.id })
        )[0];
        await this.settingService.update(
          { userId: ctx.from?.id },
          { isBidOnly: !settings.isBidOnly }
        );
        ctx.menu.update();
      }
    );

  public init(bot: Bot<BotContext>): void {
    bot.use(this.settingsMenu);
    bot.use(
      createConversation(
        this.settingConversation.bind(this),
        'settingConversation'
      )
    );
    bot.command('settings', this.commandEnter);
    bot.hears('⚙️ Settings', this.commandEnter);
  }

  private async settingConversation(
    conversation: BotConversation,
    ctx: BotContext
  ): Promise<void> {
    await ctx.reply('⚙️ Settings', { reply_markup: this.settingsMenu });
  }

  public async commandEnter(ctx: BotContext): Promise<void> {
    await ctx.conversation.enter('settingConversation');
  }
}
