import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { FilterQuery, QueryOptions } from 'mongoose';

import { INotifyService } from './notify.interface';
import {
  ICar,
  INotificationMessage,
  ThreadEvent,
} from '../../models/car.interface';
import { TYPES } from '../../types';
import { IBot } from '../../bot/bot.interface';
import { BotContext } from '../../bot/bot.context';
import { IModelService } from '../../interfaces/model.interface';
import { ILogger } from '../logger/loger.interface';
import { ISetting } from '../../models/setting.interface';

@injectable()
export class NotifyService implements INotifyService {
  constructor(
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.CarService)
    public carService: IModelService<
      ICar,
      FilterQuery<ICar>,
      QueryOptions<ICar>
    >,
    @inject(TYPES.LoggerService) public logger: ILogger,
    @inject(TYPES.SettingService)
    public settingService: IModelService<
      ISetting,
      FilterQuery<ISetting>,
      QueryOptions<ISetting>
    >
  ) {}

  public async notifyUser(message: INotificationMessage): Promise<void> {
    const car = await this.carService.findById(message.carId);

    if (!car) {
      this.logger.log('car not found');
      return;
    }

    const { isBidOnly } = (
      await this.settingService.find({ userId: car.userId })
    )[0];

    const filteredActions = message.actions.filter(
      (el) => isBidOnly && el?.type === 'bid'
    );

    await Promise.all(
      filteredActions.map((action) => {
        this.bot.bot.api.sendMessage(
          car.userId,
          this.formateMessage(car, action)
        );
      })
    );
  }

  private formateMessage(car: ICar, el: ThreadEvent): string {
    switch (el?.type) {
      case 'bid':
        return `
          💰 New bid: ${el.value} on action "${car.carTitle}"
        `;
      case 'comment':
      case 'system-comment':
      case 'flagged-comment':
        return `
          💬 New comment: "${el.comment}" on action "${car.carTitle}"
        `;
    }
    return ' ';
  }
}
