import { IBot } from './src/bot/bot.interface';
import { container } from './src/inversify.config';
import { TYPES } from './src/types';

const bot = container.get<IBot>(TYPES.Bot);
bot.init();
