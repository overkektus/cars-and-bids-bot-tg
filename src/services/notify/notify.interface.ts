import { INotificationMessage } from '../../models/car.interface';

export type INotifyService = {
  notifyUser(message: INotificationMessage): Promise<void>;
}
