import { Bot as GrammyBot } from 'grammy';
import { inject, injectable } from 'inversify';
import { IConfigService } from '../config/config.interface';

import { IBotContext } from '../context/context.interface';
import { TYPES } from '../types';
import { IBot } from './bot.interface';

@injectable()
export class Bot implements IBot {
  bot: GrammyBot<IBotContext>;

  constructor(
    @inject(TYPES.Config) public config: IConfigService,
  ) {
    this.bot = new GrammyBot<IBotContext>(config.get('TOKEN'));
  }
  
  init() {
    console.log('bot started');
    this.bot.start();
  }
};
