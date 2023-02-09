export interface IMQ {
  connect(): Promise<void>;
  closeConnection(): Promise<void>;
  sendData<T>(queueName: string, data: T): void;
}