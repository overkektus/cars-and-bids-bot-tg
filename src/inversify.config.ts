import "reflect-metadata";
import { Container } from 'inversify';

import { TYPES } from './types';
import { IConfigService } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { IBot } from "./bot/bot.interface";
import { Bot } from './bot/bot';
import { App } from "./app";
import { IApp } from "./app.interface";
import { Cron } from "./crons/cron";
import { CarCheck } from "./crons/carCheck";

const container = new Container();
container.bind<IApp>(TYPES.App).to(App);
container.bind<IBot>(TYPES.Bot).to(Bot);
container.bind<IConfigService>(TYPES.Config).to(ConfigService);
container.bind<Cron>(TYPES.CarCheck).to(CarCheck);

export { container };