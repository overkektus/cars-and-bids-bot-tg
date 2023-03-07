import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { FilterQuery, QueryOptions } from 'mongoose';

import { INotifyService } from "./notify.interface";
import { ICar, INotificationMessage } from '../../models/car.interface';
import { TYPES } from '../../types';
import { IBot } from '../../bot/bot.interface';
import { BotContext } from '../../bot/bot.context';
import { IModelService } from '../car/model.interface';
import { ILogger } from '../logger/loger.interface';

@injectable()
export class NotifyService implements INotifyService {
  constructor(
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
    @inject(TYPES.CarService) public carService: IModelService<ICar, FilterQuery<ICar>, QueryOptions<ICar>>,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) { }

  public async notifyUser(message: INotificationMessage): Promise<void> {
    const car = await this.carService.findById(message.carId);

    if (!car) {
      this.logger.log("car not found");
      return;
    }

    await Promise.all(message.actions.map(action => {
      this.bot.bot.api.sendMessage(car.userId, `
        New ${action?.type} on ${car.url} action. \n
        ${action?.type === 'bid' && action.value}
        ${action?.type === 'comment' && action.comment}
      `)
      }
    ));
  }
}