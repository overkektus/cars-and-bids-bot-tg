import { injectable } from 'inversify';
import { ScheduleOptions } from 'node-cron';

@injectable()
export abstract class Cron {
  abstract cronExpression: string;
  abstract options: ScheduleOptions;
  abstract init(): void;
}
