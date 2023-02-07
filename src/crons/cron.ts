import { ScheduleOptions } from 'node-cron';

export abstract class Cron {
  abstract cronExpression: string;
  abstract options: ScheduleOptions;
  abstract task(): void;
}