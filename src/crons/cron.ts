import { injectable } from 'inversify';
import { ScheduleOptions } from 'node-cron';
import { INotificationMessage } from '../models/car.interface';

@injectable()
export abstract class Cron {
  abstract cronExpression: string;
  abstract options: ScheduleOptions;
  abstract init(): void;
  abstract notification(message: INotificationMessage): void;
}