import "reflect-metadata";
import { Container } from 'inversify';

import { TYPES } from './types';
import { IConfigService } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { IBot } from "./bot/bot.interface";
import { Bot } from './bot/bot';

const container = new Container();
container.bind<IConfigService>(TYPES.Config).to(ConfigService);
container.bind<IBot>(TYPES.Bot).to(Bot);

export { container };