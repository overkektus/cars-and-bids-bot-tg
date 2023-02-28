import { INotificationMessage } from "../../models/car.interface";

export interface INotifyService {
  notifyUser(message: INotificationMessage): Promise<void>;
}