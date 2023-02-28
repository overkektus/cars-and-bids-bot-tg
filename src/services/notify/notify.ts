import { inject, injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';

import { INotifyService } from "./notify.interface";
import { INotificationMessage } from '../../models/car.interface';
import carModel from '../../models/car.model';
import { TYPES } from '../../types';
import { IBot } from '../../bot/bot.interface';
import { BotContext } from '../../bot/bot.context';

@injectable()
export class NotifyService implements INotifyService {
  constructor(
    @inject(TYPES.Bot) public bot: IBot<GrammyBot<BotContext>>,
  ) { }

  public async notifyUser(message: INotificationMessage): Promise<void> {
    const car = await carModel.findById(message.carId);

    if (!car) {
      console.log('car not found');
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