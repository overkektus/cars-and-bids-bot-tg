import 'reflect-metadata';
import { Container } from 'inversify';
import { Bot as GrammyBot } from 'grammy';
import { ConnectOptions, FilterQuery, Mongoose, QueryOptions } from 'mongoose';

import { TYPES } from './types';
import { IConfigService } from './services/config/config.interface';
import { ConfigService } from './services/config/config.service';
import { App } from './app';
import { IApp } from './app.interface';
import { Cron } from './crons/cron';
import { CarCheck } from './crons/carCheck';
import { IMQ } from './services/mq/mq.interface';
import { ConsumerMessageType, RabbitMQ } from './services/mq/rabbitMQ.service';
import { ILogger } from './services/logger/loger.interface';
import { LoggerService } from './services/logger/logger.service';
import { IBot } from './bot/bot.interface';
import { Bot } from './bot/bot';
import { BotContext } from './bot/bot.context';
import { Command } from './bot/commands/command';
import { AddCommand } from './bot/commands/add';
import { CarListCommand } from './bot/commands/carList';
import { StartCommand } from './bot/commands/start';
import { INotifyService } from './services/notify/notify.interface';
import { NotifyService } from './services/notify/notify.service';
import { IDatabaseService } from './services/db/database.interface';
import { DatabaseService } from './services/db/database.service';
import { CarModel } from './models/car.model';
import { ICar } from './models/car.interface';
import { IModelService } from './services/car/model.interface';
import { CarService } from './services/car/car.service';
import { AuthorCommand } from './bot/commands/author';

const container = new Container();
container.bind<IApp>(TYPES.App).to(App);
container.bind<IBot<GrammyBot<BotContext>>>(TYPES.Bot).to(Bot);
container
  .bind<IConfigService>(TYPES.Config)
  .to(ConfigService)
  .inSingletonScope();
container.bind<Cron>(TYPES.CarCheck).to(CarCheck);
container
  .bind<IMQ<ConsumerMessageType>>(TYPES.RabbitMQ)
  .to(RabbitMQ)
  .inSingletonScope();
container.bind<ILogger>(TYPES.LoggerService).to(LoggerService);
container.bind<Command>(TYPES.AddCommand).to(AddCommand);
container.bind<Command>(TYPES.CarListCommand).to(CarListCommand);
container.bind<Command>(TYPES.StartCommand).to(StartCommand);
container.bind<Command>(TYPES.AuthorCommand).to(AuthorCommand);
container.bind<typeof CarModel>(TYPES.CarModel).toConstantValue(CarModel);
container
  .bind<IModelService<ICar, FilterQuery<ICar>, QueryOptions<ICar>>>(
    TYPES.CarService
  )
  .to(CarService)
  .inSingletonScope();
container.bind<INotifyService>(TYPES.Notify).to(NotifyService);
container
  .bind<IDatabaseService<Mongoose, ConnectOptions>>(TYPES.Database)
  .to(DatabaseService)
  .inRequestScope();

export { container };
