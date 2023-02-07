import { inject, injectable } from "inversify";
import { ScheduleOptions } from "node-cron";

import { Cron } from "./cron";
import { TYPES } from '../types';
import { IConfigService } from "../config/config.interface";

@injectable()
export class CarCheck extends Cron {
  public cronExpression: string;
  public options: ScheduleOptions;

  constructor(@inject(TYPES.Config) public config: IConfigService) {
    super();
    this.cronExpression = config.get('CRON_CAR_EXPRESSION');
    this.options = {};
  }

  task(): void {
    console.log('fire');
  }
}