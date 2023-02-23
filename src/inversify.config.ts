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
import { IMQ } from "./crons/mq.interface";
import { RabbitMQ } from "./crons/rabbitMQ";
import { ILogger } from "./logger/loger.interface";
import { ConsoleLogger } from "./logger/consoleLogger";
import { Command } from "./commands/command";
import { AddCommand } from "./commands/add";
import { CarListCommand } from "./commands/carList";
import { StartCommand } from "./commands/start";

const container = new Container();
container.bind<IApp>(TYPES.App).to(App);
container.bind<IBot>(TYPES.Bot).to(Bot);
container.bind<IConfigService>(TYPES.Config).to(ConfigService).inSingletonScope();
container.bind<Cron>(TYPES.CarCheck).to(CarCheck);
container.bind<IMQ>(TYPES.RabbitMQ).to(RabbitMQ).inSingletonScope();
container.bind<ILogger>(TYPES.ConsoleLogger).to(ConsoleLogger).inSingletonScope();
container.bind<Command>(TYPES.AddCommand).to(AddCommand);
container.bind<Command>(TYPES.CarListCommand).to(CarListCommand);
container.bind<Command>(TYPES.StartCommand).to(StartCommand);

export { container };