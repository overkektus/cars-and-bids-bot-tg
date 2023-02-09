import { inject, injectable } from "inversify";
import nodeCron from "node-cron";

import { Cron } from "./cron";
import { TYPES } from '../types';
import { IConfigService } from "../config/config.interface";
import { IMQ } from "./mq.interface";
import { IEvent } from "./event.interface";

@injectable()
export class CarCheck extends Cron {
  public cronExpression: string;
  public options: nodeCron.ScheduleOptions;
  
  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ,
  ) {
    super();
    this.cronExpression = config.get('CRON_CAR_EXPRESSION');
    this.options = {};
    this.task = this.task.bind(this);
  }

  private task(): void {
    this.rabbitMQ.sendData<IEvent>("car-queue", { url: "https://carsandbids.com/auctions/98XlpVL0/2019-honda-civic-type-r" });
  }

  public init(): void {
    nodeCron.schedule(this.cronExpression, this.task, this.options);
  }
}