import { injectable } from 'inversify';
import { Bot as GrammyBot } from 'grammy';

import { BotContext } from '../bot.context';

@injectable()
export abstract class Command {
  constructor() {}

  abstract init(bot: GrammyBot<BotContext>): void;
  abstract commandEnter(ctx: BotContext): void | Promise<void>;
}
