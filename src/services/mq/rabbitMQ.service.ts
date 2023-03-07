import { inject, injectable } from 'inversify';
import { Connection, Channel, ConsumeMessage, connect } from 'amqplib';

import { IMQ } from './mq.interface';
import { TYPES } from '../../types';
import { ILogger } from '../logger/loger.interface';

export type ConsumerMessageType = ConsumeMessage | null;

@injectable()
export class RabbitMQ implements IMQ<ConsumerMessageType> {
  private connectionAMPQ!: Connection;
  private channelAMPQ!: Channel;

  constructor(@inject(TYPES.LoggerService) public logger: ILogger) { }
  
  public accept(data: ConsumerMessageType): void {
    if (data) {
      this.channelAMPQ.ack(data);
    }
  }

  public async connect(uri: string): Promise<void> {
    try {
      this.connectionAMPQ = await connect(uri);
      this.channelAMPQ = await this.connectionAMPQ.createChannel();

      this.logger.log('rabbitMQ connected');
    } catch(error) {
      this.logger.error(String(error));
      throw error;
    }
  }

  public async closeConnection(): Promise<void> {
    try {
      await this.channelAMPQ.close();
      await this.connectionAMPQ.close();
    } catch(error) {
      this.logger.error(String(error));
      throw error;
    }
  }

  public sendData<T>(queueName: string, data: T): void {
    this.channelAMPQ.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  }
  
  public async setConsume(queueName: string, consumer: (msg: ConsumerMessageType) => void): Promise<void> {
    this.channelAMPQ.consume(queueName, consumer);
  }

  public async assertQueue(queueName: string): Promise<void> {
    await this.channelAMPQ.assertQueue(queueName);
  }
}