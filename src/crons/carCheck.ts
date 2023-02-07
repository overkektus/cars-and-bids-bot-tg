import { inject } from "inversify";
import { ScheduleOptions } from "node-cron";

import { Cron } from "./cron";
import { TYPES } from '../types';
import { IConfigService } from "../config/config.interface";

export class CarCheck extends Cron {
  public cronExpression: string;
  public options: ScheduleOptions;

  constructor(@inject(TYPES.Config) public config: IConfigService) {
    super();
    this.cronExpression = config.get('CRON_CAR_EXPRESSION');
    this.options = {};
  }

  task(): void {
    throw new Error("Method not implemented.");
  }
}